import { Injectable } from '@angular/core';
import { B64Image } from '../models/image-import-data.model';

@Injectable({
    providedIn: 'root',
})
export class ImageManipulationService {

    public constructor() {}

    public cropImage(
        imageSrc: B64Image,
        location: { x: number, y: number },
        resolution: { x: number, y: number },
    ): Promise<B64Image> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imageSrc;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = resolution.x;
                canvas.height = resolution.y;
                if (!ctx) {
                    reject('No canvas context!');
                } else {
                    ctx.drawImage(
                        image,
                        location.x,
                        location.y,
                        resolution.x,
                        resolution.y,
                        0,
                        0,
                        resolution.x,
                        resolution.y,
                    );
                    resolve(canvas.toDataURL('image/png'));
                }
            };
        });
    }
}
