import { VynilUIModule } from 'vynil-ui';
import { Component, inject, input } from '@angular/core';

import { B64Image } from '../../../shared/models/b64-image.model';
import { NormalMapGeneratorService } from '../../services/normal-map-generator.service';

@Component({
    selector: 'spc-generated-image-panel',
    imports: [VynilUIModule],
    templateUrl: './generated-image-panel.html',
    styleUrl: './generated-image-panel.scss',
})
export class GeneratedImagePanel {
    private normalMapGeneratorService: NormalMapGeneratorService = inject(NormalMapGeneratorService);

    public image = input<B64Image | undefined>();

    public onExport(): void {
        if (this.image()) {
            this.normalMapGeneratorService.exportGeneratedImage();
        }
    }

    public onRemoveImage(): void {
        this.normalMapGeneratorService.removeGeneratedImage();
    }
}
