import { Component, input } from '@angular/core';
import { VynilUIModule } from 'vynil-ui';

import { AnimationStripDirection } from './animation-strip-direction/animation-strip-direction';

@Component({
    selector: 'spc-animation-strip',
    imports: [VynilUIModule, AnimationStripDirection],
    templateUrl: './animation-strip.html',
    styleUrl: './animation-strip.scss',
    host: { 'class': 'fill' },
})
export class AnimationStrip {
    public title = input<string>('');
}
