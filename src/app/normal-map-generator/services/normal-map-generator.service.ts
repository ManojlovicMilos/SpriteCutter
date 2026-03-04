import { Injectable, WritableSignal, inject, signal } from '@angular/core';

import { B64Image } from '../../shared/models/b64-image.model';
import { FileSystemService } from '../../shared/services/file-system.service';
import { ImageManipulationService } from '../../shared/services/image-manipulation.service';
import { NormalMapGenerationData, NormalMapGenerationInputImage } from '../models/normal-map-generation-data.model';

@Injectable({
    providedIn: 'root',
})
export class NormalMapGeneratorService {
    private fileSystemService: FileSystemService = inject(FileSystemService);
    private imageManipulationService: ImageManipulationService = inject(ImageManipulationService);

    public data: WritableSignal<NormalMapGenerationData> = signal({ images: {} });

    public async loadImage(type: NormalMapGenerationInputImage): Promise<void> {
        const imageFile = await this.fileSystemService.openFile();
        const image = this.fileSystemService.convertFileToB64Image(imageFile);
        const currentData = this.data();
        currentData.images[type] = image;
        this.data.set({ ...currentData });
    }

    public removeImage(type: NormalMapGenerationInputImage): void {
        const currentData = this.data();
        currentData.images[type] = undefined;
        this.data.set({ ...currentData });
    }

    public removeGeneratedImage(): void {
        const currentData = this.data();
        currentData.generated = undefined;
        this.data.set({ ...currentData });
    }

    public async exportGeneratedImage(): Promise<void> {
        const fileName = 'normal-map.png';
        const pathDirectoryHandle = await this.fileSystemService.selectDirectory();
        if (pathDirectoryHandle) {
            const doesItAlreadyExist = await this.fileSystemService.checkFileExists(pathDirectoryHandle, fileName);
            if (doesItAlreadyExist) {
                throw new Error('File "normal-map.png" already exists at the location, please choose a different name.');
            }
            const currentData = this.data();
            if (currentData.generated) {
                const file = await this.fileSystemService.getFileFromBase64Async(currentData.generated!, fileName);
                await this.fileSystemService.saveFile(fileName, file, pathDirectoryHandle);
            }
        } else {
            throw new Error('No output file or directory was selected!');
        }
    }

    public async generate(): Promise <B64Image> {
        const imagesBase64Object = this.data().images;
        const imagesBase64 = [
            imagesBase64Object.top,
            imagesBase64Object.bottom,
            imagesBase64Object.left,
            imagesBase64Object.right,
        ];
        const maskBase64 = imagesBase64Object.mask;
        let baseResolution: { x: number, y: number } | null = null;
        for (let image of imagesBase64) {
            if (!image) {
                throw Error('Not all of light images are imported!');
            }
            const resolution = await this.imageManipulationService.getResolution(image);
            if (!baseResolution) {
                baseResolution = resolution;
            } else {
                if (resolution.x !== baseResolution.x
                    || resolution.y !== baseResolution.y) {
                        throw Error('Imported images are not the same size!');
                    }
            }
        }
        const baseImage = await this.generateBaseImage(baseResolution!);
        let activeImage = baseImage;
        activeImage = await this.applyVector(activeImage, imagesBase64Object.left!, { x: -1.0, y: 0 });
        activeImage = await this.applyVector(activeImage, imagesBase64Object.right!, { x: 1.0, y: 0 });
        activeImage = await this.applyVector(activeImage, imagesBase64Object.top!, { x: 0, y: 1.0 });
        activeImage = await this.applyVector(activeImage, imagesBase64Object.bottom!, { x: 0, y: -1.0 });
        if (maskBase64) {
            activeImage = await this.applyMask(activeImage, maskBase64);
        }
        this.data.set({
            ...this.data(),
            generated: activeImage,
        });
        return activeImage;
    }

    private async applyMask(base: B64Image, mask: B64Image): Promise<B64Image> {
        const image = await this.imageManipulationService.imageElementFromBase64(base);
        const maskImage = await this.imageManipulationService.imageElementFromBase64(mask);
        const [imageCanvas, imageCtx] = this.createCanvasAndContext(image);
        const [maskImageCanvs, maskImageCtx] = this.createCanvasAndContext(maskImage);
        const outCanvas = document.createElement('canvas');
        outCanvas.width = image.width;
        outCanvas.height = image.height;
        const outCtx = outCanvas.getContext('2d');
        if (!imageCtx || !maskImageCtx || !outCtx) {
            throw Error('Failed to create rendering context.');
        }
        for (let ix = 0; ix < image.width; ix++) {
            for (let iy = 0; iy < image.height; iy++) {
                const maskValues = maskImageCtx.getImageData(ix, iy, 1, 1).data;
                const alphaValue = maskValues[3];
                if (alphaValue > 1) {
                    const colorValues = imageCtx.getImageData(ix, iy, 1, 1).data;
                    const pixelColor = 'rgba(' + colorValues[0] + ',' + colorValues[1] + ',' + colorValues[2] + ',' + colorValues[3] + ')';
                    outCtx.fillStyle = pixelColor;
                    outCtx.fillRect(ix, iy, 1, 1);
                }
            }
        }
        return outCanvas.toDataURL('image/png');
    }

    private async applyVector(baseImage: B64Image, lightMap: B64Image, vector: { x: number, y: number }): Promise<B64Image> {
        const image = await this.imageManipulationService.imageElementFromBase64(baseImage);
        const lightImage = await this.imageManipulationService.imageElementFromBase64(lightMap);
        const [imageCanvas, imageCtx] = this.createCanvasAndContext(image);
        const [lightImageCanvs, lightImageCtx] = this.createCanvasAndContext(lightImage);
        if (!imageCtx || !lightImageCtx) {
            throw Error('Failed to create rendering context.');
        }
        for (let ix = 0; ix < image.width; ix++) {
            for (let iy = 0; iy < image.height; iy++) {
                const colorValues = imageCtx.getImageData(ix, iy, 1, 1).data;
                const lightValues = lightImageCtx.getImageData(ix, iy, 1, 1).data;
                const redValue = lightValues[0];
                if (redValue > 1) {
                    const factor = redValue / 2;
                    const newColorValues = this.addColorValues([...colorValues], [
                        vector.x * factor,
                        vector.y * factor,
                        0,
                    ]);
                    const newColor = 'rgb(' + newColorValues[0] + ',' + newColorValues[1] + ', 127)';
                    imageCtx.fillStyle = newColor;
                    imageCtx.fillRect(ix, iy, 1, 1);
                }
            }
        }
        return imageCanvas.toDataURL('image/png');
    }

    private addColorValues(base: number[], add: number[]): number [] {
        return [
            (base[0] + add[0] > 255) ? 255 : base[0] + add[0],
            (base[1] + add[1] > 255) ? 255 : base[1] + add[1],
            127
        ];
    }

    private async generateBaseImage(resolution: { x: number, y: number }): Promise <B64Image> {
        const baseImage = await this.imageManipulationService.emptyImage(resolution, 'rgb(127,127,255)');
        return baseImage;
    }

    private createCanvasAndContext(image: HTMLImageElement): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
            ctx.drawImage(
                image,
                0,
                0,
                image.width,
                image.height,
                0,
                0,
                image.width,
                image.height,
            );
        }
        return [canvas, ctx];
    }
}
