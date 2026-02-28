import { AnimationConfig, SpritesetConfig } from "./spriteset-config.model";

export type B64Image = string;

export type AnimationDirectionData = {
    name: string;
    images: B64Image[];
}

export type AnimationImageData = {
    animationConfig: AnimationConfig;
    directions: { [key: string]: AnimationDirectionData };
}

export interface ImageImportData {
    id: string;
    name: string;
    file: File;
    image: B64Image;
    importConfig: SpritesetConfig;
    animations: AnimationImageData[];
}
