import { VynilUIModule } from 'vynil-ui';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { B64Image } from '../../../shared/models/b64-image.model';
import { NormalMapGeneratorService } from '../../services/normal-map-generator.service';
import { NormalMapGenerationInputImage } from '../../models/normal-map-generation-data.model';

@Component({
    selector: 'spc-light-side-image-input',
    imports: [
        CommonModule,
        VynilUIModule,
    ],
    templateUrl: './light-side-image-input.html',
    styleUrl: './light-side-image-input.scss',
})
export class LightSideImageInput {
    private normalMapGeneratorService: NormalMapGeneratorService = inject(NormalMapGeneratorService);

    public title = input<string | undefined>();
    public image = input<B64Image | undefined>();
    public type = input<NormalMapGenerationInputImage | undefined>();

    public onAddImage(): void {
        const type = this.type();
        if (type) {
            this.normalMapGeneratorService.loadImage(type);
        }
    }

    public onRemoveImage(): void {
        const type = this.type();
        if (type) {
            this.normalMapGeneratorService.removeImage(type);
        }
    }
}
