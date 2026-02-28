export type AnimationConfig = {
    id: string;
    name: string;
    length: number;
    directions?: string[];
}

export interface SpritesetConfig {
    id: string;
    name: string;
    resolution: {
        x: number;
        y: number;
    };
    directions: string[];
    animations: AnimationConfig[];
    displayDirection?: string;
    displayAnimation?: string;
}
