export type AnimationConfig = {
    id: string;
    name: string;
    length: number;
    directions?: string[];
}

export enum SpritesetConfigType {
    SingularImage = 'singular',
    DirectoryStructure = 'directory',
}

export interface SpritesetConfig {
    id: string;
    name: string;
    type: SpritesetConfigType;
    resolution: {
        x: number;
        y: number;
    };
    directions: string[];
    animations: AnimationConfig[];
    displayDirection?: string;
    displayAnimation?: string;
}
