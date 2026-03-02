import { VynilUIModule } from 'vynil-ui';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SpritesetImportService } from '../../services/spriteset-import.service';
import { ExportType, SpritesetExportService } from '../../services/spriteset-export.service';

const EXPORT_TYPE_OPTIONS = [{
    text: 'Directory Structure',
    value: ExportType.Directory,
}, {
    text: 'Singular Image',
    value: ExportType.Singular,
}];

type SelectType = { text: string, value: string };

@Component({
    selector: 'spc-image-exports-panel',
    imports: [VynilUIModule, ReactiveFormsModule],
    templateUrl: './image-exports-panel.html',
    styleUrl: './image-exports-panel.scss',
})
export class ImageExportsPanel {
    private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private spritesetImportService: SpritesetImportService = inject(SpritesetImportService);
    private spritesetExportService: SpritesetExportService = inject(SpritesetExportService);

    public messageText: string;
    public messageVisible: boolean;
    public options = EXPORT_TYPE_OPTIONS;
    public nameControl: FormControl<string>;
    public typeControl: FormControl<SelectType>;

    public constructor() {
        this.messageText = '';
        this.messageVisible = false;
        this.nameControl = new FormControl<string>('', { nonNullable: true });
        this.typeControl = new FormControl<SelectType>(EXPORT_TYPE_OPTIONS[0], { nonNullable: true });
    }

    public onExport(): void {
        const layers = this.spritesetImportService.importedImages();
        if (this.nameControl.value.length > 0 && layers.length > 0) {
            this.spritesetExportService.exportCurrentProject(
                this.nameControl.value,
                this.typeControl.value.value as ExportType,
            )
            .then(() => {
                this.messageVisible = true;
                this.messageText = 'Export successful!';
                this.changeDetectorRef.markForCheck();
            }).catch(({ message }: { message: string }) => {
                this.messageVisible = true;
                this.messageText = 'ERROR: ' + message;
                this.changeDetectorRef.markForCheck();
            });
        } else {
            this.messageVisible = true;
            this.messageText = this.nameControl.value.length > 0
                ? 'ERROR: No image layers imported.'
                : 'ERROR: Invalid export name value.';
        }
    }

    public onToggleMessage(): void {
        this.messageVisible = !this.messageVisible;
    }
}
