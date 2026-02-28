import { VynilUIModule } from 'vynil-ui';
import { Component, computed, inject, input, Signal } from '@angular/core';

import { AnimationStrip } from '../animation-strip/animation-strip';
import { AnimationConfig } from '../../models/spriteset-config.model';
import { SpritesetConfigService } from '../../services/spriteset-config.service';
import { AnimationImageData, ImageImportData } from '../../models/image-import-data.model';
import { ImageImportService } from '../../services/image-import.service';

@Component({
    selector: 'spc-animations-overview',
    imports: [VynilUIModule, AnimationStrip],
    templateUrl: './animations-overview.html',
    styleUrl: './animations-overview.scss',
    host: { 'class': 'fill' },
})
export class AnimationsOverview {
    private imageImportService: ImageImportService = inject(ImageImportService);

    public directions: Signal<string[]>;
    public animationConfigs: Signal<AnimationConfig[]>;
    public animationSeparatedData: Signal<AnimationImageData[][]>;
    public displayDirection: Signal<string | undefined>;

    private spritesetConfigService: SpritesetConfigService = inject(SpritesetConfigService);

    public constructor() {
        this.directions = computed(() => this.spritesetConfigService.currentConfig().directions);
        
        this.animationConfigs = computed(() => this.spritesetConfigService.currentConfig().animations);
        this.displayDirection = computed(() => this.spritesetConfigService.currentConfig().displayDirection);

        this.animationSeparatedData = computed(() => {
            const animationImageData: ImageImportData[] = this.imageImportService.importedImages();
            let outputData = this.spritesetConfigService.currentConfig().animations
                .map((animationConfig: AnimationConfig) => {
                    let perAnimation: AnimationImageData[] = [];
                    animationImageData.forEach((dataEntry: ImageImportData) => {
                        const foundAnimation = dataEntry.animations.find((animation: AnimationImageData) => animation.animationConfig.id === animationConfig.id);
                        if (foundAnimation) {
                            perAnimation.push(foundAnimation);
                        }
                    });
                    return perAnimation;
                });
            return outputData;
        })
    }
}
