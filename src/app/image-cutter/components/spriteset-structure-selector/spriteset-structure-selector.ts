import { VynilUIModule } from 'vynil-ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, computed, inject, Signal } from '@angular/core';

import { SpritesetConfig } from '../../models/spriteset-config.model';
import { SpritesetConfigService } from '../../services/spriteset-config.service';
import { SpritesetImportService } from '../../services/spriteset-import.service';

export interface SelectInputOption<T> {
    text: string,
    value: T,
}

@Component({
    selector: 'spc-spriteset-structure-selector',
    imports: [VynilUIModule, ReactiveFormsModule],
    templateUrl: './spriteset-structure-selector.html',
    styleUrl: './spriteset-structure-selector.scss',
})
export class SpritesetStructureSelector {
    private spritesetImportService: SpritesetImportService = inject(SpritesetImportService);
    private spritesetConfigService: SpritesetConfigService = inject(SpritesetConfigService);

    public dialogVisible: boolean;
    public animationsString: Signal<string>;
    public current: Signal<SpritesetConfig>;
    public options: Signal<SelectInputOption<SpritesetConfig>[]>;
    public control: FormControl<SelectInputOption<SpritesetConfig>>;

    public constructor() {
        this.dialogVisible = false;
        const currentConfig = this.spritesetConfigService.currentConfig();
        this.current = this.spritesetConfigService.currentConfig;
        this.options = computed(() => {
            return this.spritesetConfigService.existingConfigs().map((entry) => ({
                text: entry.name, value: entry
            }));
        });
        this.animationsString = computed(() => this.current()
            .animations
            .map(entry => entry.name + '(' + entry.length + ')')
            .join(', ')
        );
        this.control = new FormControl<SelectInputOption<SpritesetConfig>>({
            text: currentConfig.name, value: currentConfig,
        }, { nonNullable: true });
        this.control.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe((value: SelectInputOption<SpritesetConfig>) => {
                const layers = this.spritesetImportService.importedImages();
                if (layers.length > 0) {
                    this.dialogVisible = true;
                } else {
                    this.spritesetConfigService.selectCurrentConfig(value.value);
                }
            });
    }

    public onConfirm(): void {
        this.spritesetConfigService.selectCurrentConfig(this.control.value.value);
        this.spritesetImportService.updateImportedImages([]);
        this.dialogVisible = false;
    }

    public onDecline(): void {
        const currentConfig = this.spritesetConfigService.currentConfig();
        this.control.setValue({ text: currentConfig.name, value: currentConfig });
        this.control.updateValueAndValidity();
        this.dialogVisible = false;
    }
}
