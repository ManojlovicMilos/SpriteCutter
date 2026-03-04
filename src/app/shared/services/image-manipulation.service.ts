import { Injectable } from '@angular/core';

import { B64Image } from '../models/b64-image.model';

@Injectable({
    providedIn: 'root',
})
export class ImageManipulationService {
    public async cropImage(
        imageData: B64Image,
        location: { x: number, y: number },
        resolution: { x: number, y: number },
    ): Promise<B64Image> {
        const imageElement = await this.imageElementFromBase64(imageData);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = resolution.x;
        canvas.height = resolution.y;
        if (!ctx) {
            throw Error('No canvas context!');
        } else {
            ctx.drawImage(
                imageElement,
                location.x,
                location.y,
                resolution.x,
                resolution.y,
                0,
                0,
                resolution.x,
                resolution.y,
            );
            return canvas.toDataURL('image/png');
        }
    }

    public async compositeImage(
        source: B64Image,
        destination: B64Image,
        location: { x: number, y: number },
        sourceResolution: { x: number, y: number },
        destinationResolution: { x: number, y: number },
    ): Promise<B64Image> {
        const sourceImage = await this.imageElementFromBase64(source);
        const destinationImage = await this.imageElementFromBase64(destination);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = destinationResolution.x;
        canvas.height = destinationResolution.y;
        if (!ctx) {
            throw Error('No canvas context!');
        }
        ctx.drawImage(
            destinationImage,
            0,
            0,
            destinationResolution.x,
            destinationResolution.y,
            0,
            0,
            destinationResolution.x,
            destinationResolution.y,
        );
        ctx.drawImage(
            sourceImage,
            0,
            0,
            sourceResolution.x,
            sourceResolution.y,
            location.x,
            location.y,
            sourceResolution.x,
            sourceResolution.y,
        );
        return canvas.toDataURL('image/png');
    }

    public async emptyImage(
        resolution: { x: number, y: number },
        color?: string,
    ): Promise<B64Image> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = resolution.x;
        canvas.height = resolution.y;
        if (!ctx) {
            throw Error('No canvas context!');
        }
        if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        return canvas.toDataURL('image/png');
    }

    public async combineImages(
        images: B64Image[],
        resolution: { x: number, y: number },
    ): Promise<B64Image> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = resolution.x;
        canvas.height = resolution.y;
        if (!ctx) {
            throw Error('No canvas context!');
        }
        for (let i = 0; i < images.length; i++) {
            const imageElement = await this.imageElementFromBase64(images[i]);
            ctx.drawImage(
                imageElement,
                0,
                0,
                resolution.x,
                resolution.y,
                0,
                0,
                resolution.x,
                resolution.y,
            );
        }
        return canvas.toDataURL('image/png');
    }

    public async getResolution(image: B64Image): Promise<{ x: number, y: number }> {
        const imageElement = await this.imageElementFromBase64(image);
        return {
            x: imageElement.width,
            y: imageElement.height,
        };
    }

    public imageElementFromBase64(imageData: B64Image): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imageData;
            image.onload = () => {
                resolve(image);
            };
        });
    }
}
