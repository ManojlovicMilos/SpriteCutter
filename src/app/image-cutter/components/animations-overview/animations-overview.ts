import { VynilUIModule } from 'vynil-ui';
import { Component, computed, inject, Signal } from '@angular/core';

import { AnimationStrip } from '../animation-strip/animation-strip';
import { AnimationConfig } from '../../models/spriteset-config.model';
import { SpritesetConfigService } from '../../services/spriteset-config.service';

@Component({
    selector: 'spc-animations-overview',
    imports: [VynilUIModule, AnimationStrip],
    templateUrl: './animations-overview.html',
    styleUrl: './animations-overview.scss',
    host: { 'class': 'fill' },
})
export class AnimationsOverview {
    public directions: Signal<string[]>;
    public animations: Signal<AnimationConfig[]>;
    public displayDirection: Signal<string | undefined>;

    private spritesetConfigService: SpritesetConfigService = inject(SpritesetConfigService);

    public constructor() {
        this.directions = computed(() => this.spritesetConfigService.currentConfig().directions);
        this.animations = computed(() => this.spritesetConfigService.currentConfig().animations);
        this.displayDirection = computed(() => this.spritesetConfigService.currentConfig().displayDirection);
    }
}
