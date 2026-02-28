import { VynilUIModule } from 'vynil-ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';

import { ImageImportData } from '../../models/image-import-data.model';
import { ImageImportService } from '../../services/image-import.service';

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
    private imageImportService: ImageImportService = inject(ImageImportService);

    public control: FormControl<ListInputEntry<ImageImportData>[]>;

    public constructor() {
        this.control = new FormControl<ListInputEntry<ImageImportData>[]>([], { nonNullable: true })
        this.control.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe((values: ListInputEntry<ImageImportData>[]) => this.updateValues(values));

        effect(() => {
            const importedImages: ImageImportData[] = this.imageImportService.importedImages();
            this.control.patchValue(importedImages.map((imageImport: ImageImportData) => ({
                value: imageImport,
                id: imageImport.id,
                text: imageImport.name,
                image: imageImport.image
            })));
            this.changeDetectionRef.markForCheck();
        });
    }

    public onAdd(): void {
        this.imageImportService.findImage();
    }
    
    public onClear(): void {
        this.imageImportService.updateImportedImages([]);
    }
    
    private updateValues(values: ListInputEntry<ImageImportData>[]): void {
        const currentValues = this.imageImportService.importedImages();
        const updatedValues = values.map((value: ListInputEntry<ImageImportData>) => value.value);
        let updated = false;
        if (currentValues.length !== updatedValues.length) updated = true;
        for (let i = 0; i < currentValues.length; i++) {
            if (currentValues[i].id !== updatedValues[i].id) updated = true;
        }
        if (updated) {
            this.imageImportService.updateImportedImages(updatedValues);
        }
    }
}
