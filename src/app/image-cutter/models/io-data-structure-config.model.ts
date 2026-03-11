export enum SpritesetConfigType {
    SingularImage = 'singular',
    DirectoryStructure = 'directory',
}

export interface IODataStructure {
    type: SpritesetConfigType;
    animationFolders?: boolean;
    directionFolders?: boolean;
    fileNameStructure: string;
    animationFolderNameStructure: string;
    directionFolderNameStructure: string;
}
