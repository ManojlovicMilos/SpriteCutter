import { Injectable } from '@angular/core';

import { B64Image } from '../models/b64-image.model';

@Injectable({
    providedIn: 'root',
})
export class FileSystemService {
    public constructor() { }

    public async openFile(): Promise<File> {
        const windowWithPicker = window as any;
        const [fileHandle]: [FileSystemFileHandle] = await windowWithPicker.showOpenFilePicker({
            types: [{
                description: 'Sprite Images',
                accept: {
                    'image/*': ['.png', '.jpeg', '.jpg'],
                },
            }],
            excludeAcceptAllOption: true,
            multiple: false,
        });
        return await fileHandle.getFile();
    }

    public async selectDirectory(): Promise<FileSystemDirectoryHandle> {
        const windowWithPicker = window as any;
        const directoryHandle = await windowWithPicker.showDirectoryPicker({
            mode: 'readwrite',
        });
        return directoryHandle;
    }

    public async saveFile(fileName: string, file: File, location: FileSystemDirectoryHandle): Promise<void> {
        const fileHandle = await location.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
    }

    public async checkFileExists(parentHandle: FileSystemDirectoryHandle, fileName: string): Promise<boolean> {
        try {
            await parentHandle.getFileHandle(fileName, { create: false });
            return true;
        } catch (error) {
            if ((error as { name: string }).name === 'NotFoundError') {
                return false;
            }
            throw error;
        }
    }

    public async checkDirectoryExists(parentHandle: FileSystemDirectoryHandle, directoryName: string): Promise<boolean> {
        try {
            await parentHandle.getDirectoryHandle(directoryName, { create: false });
            return true;
        } catch (error) {
            if ((error as { name: string }).name === 'NotFoundError') {
                return false;
            }
            throw error;
        }
    }

    public convertFileToB64Image(file: File): B64Image {
        return URL.createObjectURL(file) as B64Image;
    }

    public async getFileFromBase64Async(base64DataUrl: B64Image, fileName: string) {
        const response = await fetch(base64DataUrl);
        const blob = await response.blob();
        const mimeType = blob.type;
        return new File([blob], fileName, { type: mimeType });
    }
}
