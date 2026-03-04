import { B64Image } from "../../shared/models/b64-image.model";

export type NormalMapGenerationInputImage = 'top' | 'bottom' | 'left' | 'right' | 'mask';

export interface NormalMapGenerationData {
    images: {
        top?: B64Image;
        bottom?: B64Image;
        left?: B64Image;
        right?: B64Image;
        mask?: B64Image;
    }
    generated?: B64Image;
}
