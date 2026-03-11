import { ListInputEntry, VynilUIModule } from 'vynil-ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, computed, effect, inject, signal, Signal, WritableSignal } from '@angular/core';

import { SpritesetLayer } from '../../models/image-import-data.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { SpritesetImportService } from '../../services/spriteset-import.service';

@Component({
    selector: 'spc-image-imports-list',
    imports: [
        VynilUIModule,
        ReactiveFormsModule,
    ],
    templateUrl: './image-imports-list.html',
    styleUrl: './image-imports-list.scss',
})
export class ImageImportsList {
    private loadingService: LoadingService = inject(LoadingService);
    private changeDetectionRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private spritesetImportService: SpritesetImportService = inject(SpritesetImportService);

    public isListEmpty: Signal<boolean> = signal(true);
    public control: FormControl<ListInputEntry<SpritesetLayer>[]>;
    public selectedEntry: WritableSignal<ListInputEntry<SpritesetLayer> | null>;

    public constructor() {
        this.selectedEntry = signal(null);
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
        this.loadingService.toggle(true);
        this.spritesetImportService.findImage();
        this.loadingService.toggle(false);
    }
    
    public onClear(): void {
        this.spritesetImportService.updateImportedImages([]);
    }

    public onSelectEntry(entry: ListInputEntry<SpritesetLayer> | null): void {
        //this.selectedEntry.set(entry);
    }
    
    private updateValues(values: ListInputEntry<SpritesetLayer>[]): void {
        const currentValues = this.spritesetImportService.importedImages();
        const updatedValues = values.map((value: ListInputEntry<SpritesetLayer>) => value.value);
        let updated = false;
        if (currentValues.length !== updatedValues.length) updated = true;
        if (!updated) {
            for (let i = 0; i < currentValues.length; i++) {
                if (currentValues[i].id !== updatedValues[i].id) updated = true;
            }
        }
        if (updated) {
            this.spritesetImportService.updateImportedImages(updatedValues);
        }
    }
}
