import { inject, Injectable, signal, WritableSignal } from '@angular/core';

import { FileSystemService } from './file-system.service';
import { SpritesetConfigService } from './spriteset-config.service';
import { ImageManipulationService } from './image-manipulation.service';
import { AnimationConfig, SpritesetConfig } from '../models/spriteset-config.model';
import { AnimationDirectionData, AnimationImageData, B64Image, ImageImportData } from '../models/image-import-data.model';

@Injectable({
    providedIn: 'root',
})
export class ImageImportService {
    private fileSystemService: FileSystemService = inject(FileSystemService);
    private spritesetConfigService: SpritesetConfigService = inject(SpritesetConfigService);
    private imageManipulationService: ImageManipulationService = inject(ImageManipulationService);

    public importedImages: WritableSignal<ImageImportData[]>;

    public constructor() {
        this.importedImages = signal([] as ImageImportData[]);
    }

    public async findImage(): Promise<ImageImportData> {
        const file = await this.fileSystemService.openFile();
        const imageData = await this.importImage(file, this.spritesetConfigService.currentConfig());
        this.importedImages.set([
            ...this.importedImages(),
            imageData,
        ])
        return imageData;
    }

    public updateImportedImages(images: ImageImportData[]): void {
        this.importedImages.set(images);
    }

    private async importImage(file: File, config: SpritesetConfig): Promise<ImageImportData> {
        const image = URL.createObjectURL(file) as B64Image;
        let yOffset = 0;
        const animationPromises = config.animations.map((animationConfig) => {
            const promise = this.importAnimation(image, animationConfig, config, yOffset);
            yOffset += !!animationConfig.directions ? animationConfig.directions.length : config.directions.length;
            return promise;
        });
        const animations = await Promise.all(animationPromises);
        const displayImage = this.findDisplayImage(config, animations);
        const imageImport = {
            file,
            image: displayImage,
            animations,
            id: file.name,
            name: file.name,
            importConfig: config,
        };
        return imageImport;
    }

    private findDisplayImage(config: SpritesetConfig, animations: AnimationImageData[]): B64Image {
        let displayAnimation;
        if (config.displayAnimation) {
            displayAnimation = animations.find((animation: AnimationImageData) => animation.animationConfig.name === config.displayAnimation);
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
    ): Promise<AnimationImageData> {
        const directionConfigs = !!config.directions ? config.directions : globalConfig.directions;
        const directionPromises = directionConfigs.map((direction: string, index: number) => this.importDirection(
            image,
            direction,
            config.length,
            yOffset + index,
            globalConfig.resolution,
        ));
        const directions = await Promise.all(directionPromises);
        let directionsObject: { [key: string]: AnimationDirectionData } = {};
        directions.forEach((direction: AnimationDirectionData) => {
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
    ): Promise<AnimationDirectionData> {
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
