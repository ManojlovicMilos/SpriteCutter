import { VynilUIModule } from 'vynil-ui';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LoadingService } from '../../../shared/services/loading.service';
import { SpritesetImportService } from '../../services/spriteset-import.service';
import { SpritesetExportService } from '../../services/spriteset-export.service';

type SelectType = { text: string, value: string };

@Component({
    selector: 'spc-image-exports-panel',
    imports: [VynilUIModule, ReactiveFormsModule],
    templateUrl: './image-exports-panel.html',
    styleUrl: './image-exports-panel.scss',
})
export class ImageExportsPanel {
    private loadingService: LoadingService = inject(LoadingService);
    private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private spritesetImportService: SpritesetImportService = inject(SpritesetImportService);
    private spritesetExportService: SpritesetExportService = inject(SpritesetExportService);

    public messageText: string;
    public messageVisible: boolean;
    public nameControl: FormControl<string>;

    public constructor() {
        this.messageText = '';
        this.messageVisible = false;
        this.nameControl = new FormControl<string>('', { nonNullable: true });
    }

    public onExport(): void {
        this.loadingService.toggle(true);
        const layers = this.spritesetImportService.importedImages();
        if (this.nameControl.value.length > 0 && layers.length > 0) {
            this.spritesetExportService.exportCurrentProject(this.nameControl.value)
            .then(() => {
                this.messageVisible = true;
                this.messageText = 'Export successful!';
                this.loadingService.toggle(false);
                this.changeDetectorRef.markForCheck();
            }).catch(({ message }: { message: string }) => {
                this.messageVisible = true;
                this.messageText = 'ERROR: ' + message;
                this.loadingService.toggle(false);
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
