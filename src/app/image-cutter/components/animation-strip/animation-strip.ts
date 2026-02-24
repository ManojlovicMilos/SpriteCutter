import { VynilUIModule } from 'vynil-ui';
import { Component, computed, input, Signal, signal } from '@angular/core';

import { AnimationConfig } from '../../models/spriteset-config.model';
import { AnimationStripDirection } from './animation-strip-direction/animation-strip-direction';

const DEFAULT_TITLE = 'Unknown';

@Component({
    selector: 'spc-animation-strip',
    imports: [VynilUIModule, AnimationStripDirection],
    templateUrl: './animation-strip.html',
    styleUrl: './animation-strip.scss',
    host: { 'class': 'fill' },
})
export class AnimationStrip {
    public animation = input<AnimationConfig>();
    public directions = input<string[]>();
    public displayDirection = input<string | undefined>();

    public expanded = signal(false);
    public displayedDirection: Signal<string>;
    public nonDisplayedDirections: Signal<string[]>;

    public constructor() {
        this.displayedDirection = computed(() => {
            const directions = this.directions();
            const displayDirection = this.displayDirection();
            return displayDirection
                ? displayDirection as string
                : directions && directions.length > 0
                    ? directions[0]
                    : DEFAULT_TITLE;
        });
        this.nonDisplayedDirections = computed(() => {
            const directions = this.directions() || [];
            const displayDirection = this.displayDirection();
            if (displayDirection) {
                return directions?.filter(entry => entry !== displayDirection);
            } else {
                return directions.slice(1);
            }
        })
    }

    public onToggleExpand(): void {
        this.expanded.set(!this.expanded());
    }
}
