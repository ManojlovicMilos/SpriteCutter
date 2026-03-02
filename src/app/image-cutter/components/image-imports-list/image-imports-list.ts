import { VynilUIModule } from 'vynil-ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, computed, effect, inject, signal, Signal } from '@angular/core';

import { SpritesetLayer } from '../../models/image-import-data.model';
import { SpritesetImportService } from '../../services/spriteset-import.service';

export interface ListInputEntry<T> {
    value: T;
    id: string,
    text: string,
    icon?: string;
    image?: string;
}

@Component({
    selector: 'spc-image-imports-list',
    imports: [VynilUIModule, ReactiveFormsModule],
    templateUrl: './image-imports-list.html',
    styleUrl: './image-imports-list.scss',
})
export class ImageImportsList {
    private changeDetectionRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private spritesetImportService: SpritesetImportService = inject(SpritesetImportService);

    public isListEmpty: Signal<boolean> = signal(true);
    public control: FormControl<ListInputEntry<SpritesetLayer>[]>;

    public constructor() {
        this.isListEmpty = computed(() => {
            const list = this.spritesetImportService.importedImages();
            return list.length > 0;
        });

        this.control = new FormControl<ListInputEntry<SpritesetLayer>[]>([], { nonNullable: true })
        this.control.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe((values: ListInputEntry<SpritesetLayer>[]) => this.updateValues(values));

        effect(() => {
            const importedImages: SpritesetLayer[] = this.spritesetImportService.importedImages();
            this.control.patchValue(importedImages.map((imageImport: SpritesetLayer) => ({
                value: imageImport,
                id: imageImport.id,
                text: imageImport.name,
                image: imageImport.image
            })));
            this.changeDetectionRef.markForCheck();
        });
    }

    public onAdd(): void {
        this.spritesetImportService.findImage();
    }
    
    public onClear(): void {
        this.spritesetImportService.updateImportedImages([]);
    }
    
    private updateValues(values: ListInputEntry<SpritesetLayer>[]): void {
        const currentValues = this.spritesetImportService.importedImages();
        const updatedValues = values.map((value: ListInputEntry<SpritesetLayer>) => value.value);
        let updated = false;
        if (currentValues.length !== updatedValues.length) updated = true;
        for (let i = 0; i < currentValues.length; i++) {
            if (currentValues[i].id !== updatedValues[i].id) updated = true;
        }
        if (updated) {
            this.spritesetImportService.updateImportedImages(updatedValues);
        }
    }
}
