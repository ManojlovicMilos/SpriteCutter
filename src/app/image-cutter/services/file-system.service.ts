import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FileSystemService {
    public constructor() {}

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
}
