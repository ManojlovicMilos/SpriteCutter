import { inject, Injectable, signal, WritableSignal } from '@angular/core';

import { B64Image } from '../../shared/models/b64-image.model';
import { SpritesetConfigService } from './spriteset-config.service';
import { LoadingService } from '../../shared/services/loading.service';
import { FileSystemService } from '../../shared/services/file-system.service';
import { AnimationConfig, SpritesetConfig } from '../models/spriteset-config.model';
import { ImageManipulationService } from '../../shared/services/image-manipulation.service';
import { IODataStructure, SpritesetConfigType } from '../models/io-data-structure-config.model';
import { SpritesetLayerDirection, SpritesetLayerAnimation, SpritesetLayer } from '../models/image-import-data.model';

const DEFAULT_DATA_STRUCTURE_CONFIG: IODataStructure = {
    type: SpritesetConfigType.SingularImage,
    animationFolders: true,
    directionFolders: false,
    fileNameStructure: 'animation_direction_[i]',
    animationFolderNameStructure: 'animation',
    directionFolderNameStructure: 'direction',
};

@Injectable({
    providedIn: 'root',
})
export class SpritesetImportService {
    private loadingService: LoadingService = inject(LoadingService);
    private fileSystemService: FileSystemService = inject(FileSystemService);
    private spritesetConfigService: SpritesetConfigService = inject(SpritesetConfigService);
    private imageManipulationService: ImageManipulationService = inject(ImageManipulationService);

    public importedImages: WritableSignal<SpritesetLayer[]>;
    public dataStructureConfig: WritableSignal<IODataStructure>;

    public constructor() {
        this.importedImages = signal([] as SpritesetLayer[]);
        this.dataStructureConfig = signal(DEFAULT_DATA_STRUCTURE_CONFIG);
    }

    public updateDataConfig(value: IODataStructure): void {
        this.dataStructureConfig.set(value);
    }

    public async findImage(): Promise<SpritesetLayer> {
        const type = this.dataStructureConfig().type;
        if (type === SpritesetConfigType.SingularImage) {
            const file = await this.fileSystemService.openFile();
            const imageData = await this.importImage(file, this.spritesetConfigService.currentConfig());
            this.importedImages.set([
                ...this.importedImages(),
                imageData,
            ]);
            return imageData;
        } else {
            const pathDirectoryHandle = await this.fileSystemService.selectDirectory();
            const newLayer = await this.importDirectory(pathDirectoryHandle, this.spritesetConfigService.currentConfig());
            this.importedImages.set([
                ...this.importedImages(),
                newLayer,
            ]);
            return newLayer;
        }
    }

    public updateImportedImages(images: SpritesetLayer[]): void {
        this.importedImages.set(images);
    }

    private async importDirectory(directory: FileSystemDirectoryHandle, config: SpritesetConfig): Promise<SpritesetLayer> {
        const animationFoldersEnabled = this.dataStructureConfig().animationFolders;
        let animations = [];
        let animationLayerData: { [key: string]: SpritesetLayerAnimation } = {};
        for (let animation of config.animations) {
            let animationDirectory: FileSystemDirectoryHandle;
            if (animationFoldersEnabled) {
                animationDirectory = await directory.getDirectoryHandle(this.generateAnimationDirectoryName(animation.name), { create: false });
            } else {
                animationDirectory = directory;
            }
            const newAnimationData = await this.importAnimationDirectory(animationDirectory, config, animation);
            animations.push(newAnimationData);
            animationLayerData[animation.id] = newAnimationData;
        }
        const displayImage = this.findDisplayImage(config, animations);
        const output: SpritesetLayer = {
            id: directory.name,
            name: directory.name.replaceAll('_', ' '),
            image: displayImage,
            importConfig: config,
            animations: animationLayerData,
        };
        return output;
    }

    private generateAnimationDirectoryName(animationName: string): string {
        let pattern = this.dataStructureConfig().animationFolderNameStructure;
        pattern = pattern.replace('Animation', animationName);
        pattern = pattern.replace('animation', animationName.toLowerCase());
        pattern = pattern.replace('ANIMATION', animationName.toUpperCase());
        return pattern;
    }

    private async importAnimationDirectory(directory: FileSystemDirectoryHandle, config: SpritesetConfig, animation : AnimationConfig): Promise<SpritesetLayerAnimation> {
        const directionFoldersEnabled = this.dataStructureConfig().directionFolders;
        let directionLayerData: { [key: string]: SpritesetLayerDirection } = {};
        const directions = animation.directions || config.directions;
        for (let direction of directions) {
            let directionDirectory: FileSystemDirectoryHandle;
            if (directionFoldersEnabled) {
                directionDirectory = await directory.getDirectoryHandle(this.generateDirectionDirectoryName(direction), { create: false });
            } else {
                directionDirectory = directory;
            }
            const newDirectionData = await this.importDirectionDirectory(directionDirectory, config, animation, direction);
            directionLayerData[direction] = newDirectionData;
        }
        return {
            animationConfig: animation,
            directions: directionLayerData,
        };
    }

    private generateDirectionDirectoryName(directionName: string): string {
        let pattern = this.dataStructureConfig().directionFolderNameStructure;
        pattern = pattern.replace('Direction', directionName);
        pattern = pattern.replace('direction', directionName.toLowerCase());
        pattern = pattern.replace('DIRECTION', directionName.toUpperCase());
        return pattern;
    }

    private async importDirectionDirectory(directory: FileSystemDirectoryHandle, config: SpritesetConfig, animation: AnimationConfig, direction: string): Promise<SpritesetLayerDirection> {
        let imageData = [];
        for (let i = 0; i < animation.length; i++) {
            const fileName = this.generateFileName(animation.name, direction, i);
            const exists = await this.fileSystemService.checkFileExists(directory, fileName);
            if (exists) {
                const fileHandle = await directory.getFileHandle(fileName, { create: false });
                const file = await fileHandle.getFile();
                const image = this.fileSystemService.convertFileToB64Image(file);
                imageData.push(image);
            } else {
                const empty = await this.imageManipulationService.emptyImage(config.resolution);
                imageData.push(empty);
            }
        }
        return {
            name: direction,
            images: imageData,
        };
    }

    private generateFileName(animationName: string, directionName: string, index: number): string {
        let pattern = this.dataStructureConfig().fileNameStructure;
        pattern = pattern.replace('Animation', animationName);
        pattern = pattern.replace('animation', animationName.toLowerCase());
        pattern = pattern.replace('ANIMATION', animationName.toUpperCase());
        pattern = pattern.replace('Direction', directionName);
        pattern = pattern.replace('direction', directionName.toLowerCase());
        pattern = pattern.replace('DIRECTION', directionName.toUpperCase());
        pattern = pattern.replace('[i]', index.toString());
        return pattern + '.png';
    }

    private async importImage(file: File, config: SpritesetConfig): Promise<SpritesetLayer> {
        const image = URL.createObjectURL(file) as B64Image;
        let yOffset = 0;
        const animationPromises = config.animations.map((animationConfig) => {
            const promise = this.importAnimation(image, animationConfig, config, yOffset);
            yOffset += !!animationConfig.directions ? animationConfig.directions.length : config.directions.length;
            return promise;
        });
        const animations = await Promise.all(animationPromises);
        const displayImage = this.findDisplayImage(config, animations);
        const animationsObject: { [key: string]: SpritesetLayerAnimation } = {};
        animations.forEach((animation: SpritesetLayerAnimation) => {
            animationsObject[animation.animationConfig.id] = animation;
        });
        const imageImport = {
            id: file.name,
            name: file.name.replaceAll('_', ' '),
            importConfig: config,
            image: displayImage,
            animations: animationsObject,
        };
        return imageImport;
    }

    private findDisplayImage(config: SpritesetConfig, animations: SpritesetLayerAnimation[]): B64Image {
        let displayAnimation;
        if (config.displayAnimation) {
            displayAnimation = animations.find((animation: SpritesetLayerAnimation) => animation.animationConfig.name === config.displayAnimation);
        }
        if (!displayAnimation) {
            displayAnimation = animations[0];
        }
        let displayImage;
        if (config.displayDirection) {
            const displayDirection = displayAnimation.directions[config.displayDirection];
            if (displayDirection) {
                displayImage = displayDirection.images[0];
            }
        }
        if (!displayImage) {
            displayImage = displayAnimation.directions[0].images[0];
        }
        return displayImage;
    }

    private async importAnimation(
        image: B64Image,
        config: AnimationConfig,
        globalConfig: SpritesetConfig,
        yOffset: number,
    ): Promise<SpritesetLayerAnimation> {
        const directionConfigs = !!config.directions ? config.directions : globalConfig.directions;
        const directionPromises = directionConfigs.map((direction: string, index: number) => this.importDirection(
            image,
            direction,
            config.length,
            yOffset + index,
            globalConfig.resolution,
        ));
        const directions = await Promise.all(directionPromises);
        let directionsObject: { [key: string]: SpritesetLayerDirection } = {};
        directions.forEach((direction: SpritesetLayerDirection) => {
            directionsObject[direction.name] = direction;
        });
        return {
            directions: directionsObject,
            animationConfig: config,
        };
    }

    private async importDirection(
        image: B64Image,
        name: string,
        length: number,
        yOffset: number,
        resolution: { x: number, y: number },
    ): Promise<SpritesetLayerDirection> {
        const imagePromises = Array.from({ length }).map((_, index) => 
            this.imageManipulationService.cropImage(
                image,
                { x: index * resolution.x, y: yOffset * resolution.y },
                resolution,
            )
        );
        const images = await Promise.all(imagePromises);
        return {
            name,
            images,
        };
    }
}
