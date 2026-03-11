import { inject, Injectable, signal, WritableSignal } from '@angular/core';

import { B64Image } from '../../shared/models/b64-image.model';
import { SpritesetConfigService } from './spriteset-config.service';
import { SpritesetImportService } from './spriteset-import.service';
import { FileSystemService } from '../../shared/services/file-system.service';
import { AnimationConfig, SpritesetConfig } from '../models/spriteset-config.model';
import { ImageManipulationService } from '../../shared/services/image-manipulation.service';
import { SpritesetLayer, SpritesetLayerAnimation } from '../models/image-import-data.model';
import { IODataStructure, SpritesetConfigType } from '../models/io-data-structure-config.model';

const DEFAULT_DATA_STRUCTURE_CONFIG: IODataStructure = {
    type: SpritesetConfigType.DirectoryStructure,
    animationFolders: true,
    directionFolders: false,
    fileNameStructure: 'animation_direction_[i]',
    animationFolderNameStructure: 'animation',
    directionFolderNameStructure: 'direction',
};

@Injectable({
    providedIn: 'root',
})
export class SpritesetExportService {
    private fileSystemService: FileSystemService = inject(FileSystemService);
    private spritesetImportService: SpritesetImportService = inject(SpritesetImportService);
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

    public async exportCurrentProject(projectName: string): Promise<void> {
        const exportType = this.dataStructureConfig().type;
        const pathDirectoryHandle = await this.fileSystemService.selectDirectory();
        if (pathDirectoryHandle) {
            if (exportType === SpritesetConfigType.DirectoryStructure) {
                await this.exportDirectoryStructure(projectName, pathDirectoryHandle);
            } else if (exportType === SpritesetConfigType.SingularImage) {
                await this.exportSingularImage(projectName, pathDirectoryHandle);
            }
        } else {
            throw new Error('No output file or directory was selected!');
        }
    }

    private async exportSingularImage(projectName: string, pathDirectoryHandle: FileSystemDirectoryHandle): Promise<void> {
        const doesItAlreadyExist = await this.fileSystemService.checkFileExists(pathDirectoryHandle, projectName + '.png');
        if (doesItAlreadyExist) {
            throw new Error('File "' + projectName + '.png" already exists at the location, please choose a different name.');
        }
        const importConfig: SpritesetConfig = this.spritesetConfigService.currentConfig();
        const imageDataLayers: SpritesetLayer[] = this.spritesetImportService.importedImages();
        const resolution = this.calculateSingularImageResolution(importConfig);
        let layerImages = [];
        for (let layer of imageDataLayers) {
            const newImage = await this.drawLayer(layer, importConfig, resolution);
            layerImages.push(newImage);
        }
        const completeImage = await this.imageManipulationService.combineImages(layerImages, resolution);
        this.exportImage(completeImage, projectName + '.png', pathDirectoryHandle);
    }

    private async exportDirectoryStructure(projectName: string, pathDirectoryHandle: FileSystemDirectoryHandle): Promise<void> {
        const doesItAlreadyExist = await this.fileSystemService.checkDirectoryExists(pathDirectoryHandle, projectName);
        if (doesItAlreadyExist) {
            throw new Error('Directory "' + projectName + '" already exists at the location, please choose a different name.');
        }
        const outputDirectoryHandle: FileSystemDirectoryHandle = await pathDirectoryHandle.getDirectoryHandle(projectName, { create: true });
        const importConfig: SpritesetConfig = this.spritesetConfigService.currentConfig();
        const imageDataLayers: SpritesetLayer[] = this.spritesetImportService.importedImages();
        for (let animationConfig of importConfig.animations) {
            const animationLayerData: SpritesetLayerAnimation[] = [];
            imageDataLayers.forEach((layer: SpritesetLayer) => {
                const animation = layer.animations[animationConfig.id];
                if (animation) {
                    animationLayerData.push(animation);
                }
            });
            await this.exportAnimation(animationConfig, importConfig, animationLayerData, outputDirectoryHandle);
        }
    }

    private async exportAnimation(
        config: AnimationConfig,
        globalConfig: SpritesetConfig,
        animationLayersData: SpritesetLayerAnimation[],
        outputDirectoryHandle: FileSystemDirectoryHandle,
    ): Promise<void> {
        const animationFoldersEnabled = this.dataStructureConfig().animationFolders;
        let animationDirectory: FileSystemDirectoryHandle;
        if (animationFoldersEnabled) {
            animationDirectory = await outputDirectoryHandle.getDirectoryHandle(this.generateAnimationDirectoryName(config.name), { create: true });
        } else {
            animationDirectory = outputDirectoryHandle;
        }
        const directions = config.directions || globalConfig.directions;
        for (let direction of directions) {
            const directionLayerData: B64Image[][] = [];
            for (let animationLayer of animationLayersData) {
                const directionData = animationLayer.directions[direction];
                if (directionData) {
                    directionLayerData.push(directionData.images);
                }
            }
            this.exportDirection(direction, globalConfig.resolution, directionLayerData, config, animationDirectory);
        }
    }

    private generateAnimationDirectoryName(animationName: string): string {
        let pattern = this.dataStructureConfig().animationFolderNameStructure;
        pattern = pattern.replace('Animation', animationName);
        pattern = pattern.replace('animation', animationName.toLowerCase());
        pattern = pattern.replace('ANIMATION', animationName.toUpperCase());
        return pattern;
    }

    private async exportDirection(
        direction: string,
        resolution: { x: number, y: number },
        directionImages: B64Image[][],
        animationConfig: AnimationConfig,
        animationDirectoryHandle: FileSystemDirectoryHandle,
    ): Promise<void> {
        const directionFoldersEnabled = this.dataStructureConfig().directionFolders;
        let directionDirectory: FileSystemDirectoryHandle;
        if (directionFoldersEnabled) {
            directionDirectory = await animationDirectoryHandle.getDirectoryHandle(this.generateDirectionDirectoryName(direction), { create: true });
        } else {
            directionDirectory = animationDirectoryHandle;
        }
        for (let i = 0; i < animationConfig.length; i++) {
            const newFileName = this.generateFileName(animationConfig.name, direction, i);
            let imagesToCombine = [];
            for (let j = 0; j < directionImages.length; j++) {
                imagesToCombine.push(directionImages[j][i]);
            }
            const outputImage = await this.imageManipulationService.combineImages(imagesToCombine, resolution);
            await this.exportImage(outputImage, newFileName, directionDirectory);
        }
    }

    private generateDirectionDirectoryName(directionName: string): string {
        let pattern = this.dataStructureConfig().directionFolderNameStructure;
        pattern = pattern.replace('Direction', directionName);
        pattern = pattern.replace('direction', directionName.toLowerCase());
        pattern = pattern.replace('DIRECTION', directionName.toUpperCase());
        return pattern;
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

    private async exportImage(
        image: B64Image,
        fileName: string,
        parent: FileSystemDirectoryHandle,
    ): Promise<void> {
        const file = await this.fileSystemService.getFileFromBase64Async(image, fileName);
        await this.fileSystemService.saveFile(fileName, file, parent);
    }

    private async drawLayer(layer: SpritesetLayer, importConfig: SpritesetConfig, resolution: { x: number, y: number }): Promise<B64Image> {
        let currentRow = 0;
        let completeImage: B64Image = await this.imageManipulationService.emptyImage(resolution);
        for (let animation of importConfig.animations) {
            const directions = animation.directions || importConfig.directions;
            for (let direction of directions) {
                const images: B64Image[] = layer.animations[animation.id].directions[direction].images;
                if (images) {
                    for(let i = 0; i < images.length; i++) {
                        completeImage = await this.imageManipulationService.compositeImage(
                            images[i],
                            completeImage,
                            { x: i * importConfig.resolution.x, y: currentRow * importConfig.resolution.y },
                            importConfig.resolution,
                            resolution,
                        );
                    }
                }
                currentRow++;
            }
        }
        return completeImage;
    }

    private calculateSingularImageResolution(config: SpritesetConfig): { x: number, y: number } {
        let totalFrames = 0;
        config.animations.forEach((animation: AnimationConfig) => {
            if (animation.length > totalFrames) {
                totalFrames = animation.length;
            }
        });
        let totalDirections = 0;
        config.animations.forEach((animation: AnimationConfig) =>
            totalDirections += (animation.directions || config.directions).length);
        return {
            x: totalFrames * config.resolution.x,
            y: totalDirections * config.resolution.y,
        };
    }
}
