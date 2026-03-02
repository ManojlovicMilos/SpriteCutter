import { VynilUIModule } from 'vynil-ui';
import { Component, computed, inject, Signal } from '@angular/core';

import { AnimationStrip } from '../animation-strip/animation-strip';
import { AnimationConfig } from '../../models/spriteset-config.model';
import { SpritesetImportService } from '../../services/spriteset-import.service';
import { SpritesetConfigService } from '../../services/spriteset-config.service';
import { SpritesetLayerAnimation, SpritesetLayer } from '../../models/image-import-data.model';

@Component({
    selector: 'spc-animations-overview',
    imports: [VynilUIModule, AnimationStrip],
    templateUrl: './animations-overview.html',
    styleUrl: './animations-overview.scss',
    host: { 'class': 'fill' },
})
export class AnimationsOverview {
    private spritesetImportService: SpritesetImportService = inject(SpritesetImportService);

    public directions: Signal<string[]>;
    public animationConfigs: Signal<AnimationConfig[]>;
    public animationSeparatedData: Signal<SpritesetLayerAnimation[][]>;
    public displayDirection: Signal<string | undefined>;

    private spritesetConfigService: SpritesetConfigService = inject(SpritesetConfigService);

    public constructor() {
        this.directions = computed(() => this.spritesetConfigService.currentConfig().directions);
        
        this.animationConfigs = computed(() => this.spritesetConfigService.currentConfig().animations);
        this.displayDirection = computed(() => this.spritesetConfigService.currentConfig().displayDirection);

        this.animationSeparatedData = computed(() => {
            const animationImageData: SpritesetLayer[] = this.spritesetImportService.importedImages();
            let outputData = this.spritesetConfigService.currentConfig().animations
                .map((animationConfig: AnimationConfig) => {
                    let perAnimation: SpritesetLayerAnimation[] = [];
                    animationImageData.forEach((dataEntry: SpritesetLayer) => {
                        const foundAnimation = dataEntry.animations[animationConfig.id];
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
