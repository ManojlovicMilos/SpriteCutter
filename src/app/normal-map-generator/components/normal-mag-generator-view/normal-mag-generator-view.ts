import { VynilUIModule } from 'vynil-ui';
import { ChangeDetectorRef, Component, inject, Signal } from '@angular/core';

import { GeneratedImagePanel } from '../generated-image-panel/generated-image-panel';
import { LightSideImageInput } from '../light-side-image-input/light-side-image-input';
import { NormalMapGenerationData } from '../../models/normal-map-generation-data.model';
import { NormalMapGeneratorService } from '../../services/normal-map-generator.service';

@Component({
    selector: 'spc-normal-mag-generator-view',
    imports: [
        VynilUIModule,
        LightSideImageInput,
        GeneratedImagePanel,
    ],
    templateUrl: './normal-mag-generator-view.html',
    styleUrl: './normal-mag-generator-view.scss',
})
export class NormalMagGeneratorView {
    private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private normalMapGeneratorService: NormalMapGeneratorService = inject(NormalMapGeneratorService);

    public messageText: string;
    public messageVisible: boolean;
    public generatorData: Signal<NormalMapGenerationData> = this.normalMapGeneratorService.data;

    public constructor() {
        this.messageText = '';
        this.messageVisible = false;
    }

    public onGenerate(): void {
        this.normalMapGeneratorService.generate()
        .then(() => {
            this.messageVisible = true;
            this.messageText = 'Normal map generated successfully!';
            this.changeDetectorRef.markForCheck();
        }).catch(({ message }: { message: string }) => {
            this.messageVisible = true;
            this.messageText = 'ERROR: ' + message;
            this.changeDetectorRef.markForCheck();
        });
    }

    public onToggleMessage(): void {
        this.messageVisible = !this.messageVisible;
    }
}
