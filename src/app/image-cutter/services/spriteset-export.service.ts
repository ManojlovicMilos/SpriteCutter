import { inject, Injectable, signal, WritableSignal } from '@angular/core';

import { FileSystemService } from './file-system.service';
import { SpritesetConfigService } from './spriteset-config.service';
import { SpritesetImportService } from './spriteset-import.service';
import { ImageManipulationService } from './image-manipulation.service';
import { AnimationConfig, SpritesetConfig } from '../models/spriteset-config.model';
import { B64Image, SpritesetLayer, SpritesetLayerAnimation } from '../models/image-import-data.model';

export enum ExportType {
    Singular = 'singular',
    Directory = 'directory',
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

    public constructor() {
        this.importedImages = signal([] as SpritesetLayer[]);
    }

    public async exportCurrentProject(projectName: string, exportType: ExportType): Promise<void> {
        const pathDirectoryHandle = await this.fileSystemService.selectDirectory();
        if (pathDirectoryHandle) {
            if (exportType === ExportType.Directory) {
                await this.exportDirectoryStructure(projectName, pathDirectoryHandle);
            } else if (exportType === ExportType.Singular) {
                await this.exportSingularImage(projectName, pathDirectoryHandle);
            }
        } else {
            throw new Error('No output directory was selected!');
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
        const animationDirectory: FileSystemDirectoryHandle = await outputDirectoryHandle.getDirectoryHandle(config.name.toLowerCase(), { create: true });
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

    private async exportDirection(
        direction: string,
        resolution: { x: number, y: number },
        directionImages: B64Image[][],
        animationConfig: AnimationConfig,
        animationDirectoryHandle: FileSystemDirectoryHandle,
    ): Promise<void> {
        for (let i = 0; i < animationConfig.length; i++) {
            const newFileName = animationConfig.name.toLowerCase() + '_' + direction.toLowerCase() + '_' + i + '.png';
            let imagesToCombine = [];
            for (let j = 0; j < directionImages.length; j++) {
                imagesToCombine.push(directionImages[j][i]);
            }
            const outputImage = await this.imageManipulationService.combineImages(imagesToCombine, resolution);
            await this.exportImage(outputImage, newFileName, animationDirectoryHandle);
        }
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
