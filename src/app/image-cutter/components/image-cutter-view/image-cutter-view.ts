import { VynilUIModule } from 'vynil-ui';
import { CommonModule } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';

import { ImageImportsList } from '../image-imports-list/image-imports-list';
import { IODataStructure } from '../../models/io-data-structure-config.model';
import { ImageExportsPanel } from '../image-exports-panel/image-exports-panel';
import { AnimationsOverview } from '../animations-overview/animations-overview';
import { SpritesetImportService } from '../../services/spriteset-import.service';
import { SpritesetExportService } from '../../services/spriteset-export.service';
import { IoSettingsSwitcher } from '../io-settings-switcher/io-settings-switcher';
import { IoDataStructureEditor } from '../io-data-structure-editor/io-data-structure-editor';
import { SpritesetStructureSelector } from '../spriteset-structure-selector/spriteset-structure-selector';

@Component({
    selector: 'spc-image-cutter-view',
    imports: [
        CommonModule,
        VynilUIModule,
        ImageImportsList,
        ImageExportsPanel,
        AnimationsOverview,
        IoSettingsSwitcher,
        IoDataStructureEditor,
        SpritesetStructureSelector,
    ],
    templateUrl: './image-cutter-view.html',
    styleUrl: './image-cutter-view.scss',
    host: { 'class': 'fill' },
})
export class ImageCutterView {
    private spritesetImportService: SpritesetImportService = inject(SpritesetImportService);
    private spritesetExportService: SpritesetExportService = inject(SpritesetExportService);

    public selectedView: string = 'import';
    public importDataConfig: Signal<IODataStructure>;
    public exportDataConfig: Signal<IODataStructure>;

    public constructor() {
        this.importDataConfig = this.spritesetImportService.dataStructureConfig;
        this.exportDataConfig = this.spritesetExportService.dataStructureConfig;
    }

    public onChangeView(view: string): void {
        this.selectedView = view;
    }

    public onChangeImportDataConfig(value: IODataStructure): void {
        this.spritesetImportService.updateDataConfig(value);
    }

    public onChangeExportDataConfig(value: IODataStructure): void {
        this.spritesetExportService.updateDataConfig(value);
    }
}
