import { VynilUIModule } from 'vynil-ui';
import { Component, computed, input, Signal, signal } from '@angular/core';

import { AnimationConfig } from '../../models/spriteset-config.model';
import { AnimationStripDirection } from './animation-strip-direction/animation-strip-direction';
import { AnimationDirectionData, AnimationImageData, B64Image } from '../../models/image-import-data.model';

const DEFAULT_TITLE = 'Unknown';

@Component({
    selector: 'spc-animation-strip',
    imports: [VynilUIModule, AnimationStripDirection],
    templateUrl: './animation-strip.html',
    styleUrl: './animation-strip.scss',
    host: { 'class': 'fill' },
})
export class AnimationStrip {
    public directions = input<string[]>();
    public animationData = input<AnimationImageData[]>();
    public animationConfig = input<AnimationConfig>();
    public displayDirection = input<string | undefined>();

    public expanded = signal(false);
    public displayedDirection: Signal<string>;
    public nonDisplayedDirections: Signal<string[]>;
    public imageDataPerDirection: Signal<{ [key: string]: B64Image[][] }>;

    public constructor() {
        this.displayedDirection = computed(() => {
            const directions = this.directions();
            const displayDirection = this.displayDirection();
            const animationConfigValue = this.animationConfig();
            if (animationConfigValue?.directions) {
                return displayDirection && animationConfigValue.directions.includes(displayDirection)
                    ? displayDirection
                    : animationConfigValue.directions[0];
            }
            return displayDirection
                ? displayDirection as string
                : directions && directions.length > 0
                    ? directions[0]
                    : DEFAULT_TITLE;
        });
        this.nonDisplayedDirections = computed(() => {
            const animationConfigValue = this.animationConfig();
            const directions = animationConfigValue?.directions || this.directions() || [];
            const displayDirection = this.displayedDirection();
            if (displayDirection) {
                return directions?.filter(entry => entry !== displayDirection);
            } else {
                return directions.slice(1);
            }
        });
        this.imageDataPerDirection = computed(() => {
            const directionsObject: { [key: string]: B64Image[][] } = {};
            this.directions()?.forEach((direction: string) => {
                let directionImages: B64Image[][] = [];
                this.animationData()?.forEach((animationImageData: AnimationImageData) => {
                    if (animationImageData.directions[direction]) {
                        directionImages.push(animationImageData.directions[direction].images);
                    }
                });
                directionsObject[direction] = directionImages;
            });
            return directionsObject;
        });
    }

    public onToggleExpand(): void {
        this.expanded.set(!this.expanded());
    }
}
