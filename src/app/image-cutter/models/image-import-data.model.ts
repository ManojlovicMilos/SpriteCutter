import { AnimationConfig, SpritesetConfig } from "./spriteset-config.model";

export type B64Image = string;

export type SpritesetLayerDirection = {
    name: string;
    images: B64Image[];
}

export type SpritesetLayerAnimation = {
    animationConfig: AnimationConfig;
    directions: { [key: string]: SpritesetLayerDirection };
}

export interface SpritesetLayer {
    id: string;
    name: string;
    file: File;
    image: B64Image;
    importConfig: SpritesetConfig;
    animations: { [key: string]: SpritesetLayerAnimation };
}
