import { VynilUIModule } from 'vynil-ui';
import { Component, input } from '@angular/core';

import { AnimationConfig } from '../../../models/spriteset-config.model';

@Component({
    selector: 'spc-animation-strip-direction',
    imports: [VynilUIModule],
    templateUrl: './animation-strip-direction.html',
    styleUrl: './animation-strip-direction.scss',
    host: { 'class': 'fill' },
})
export class AnimationStripDirection {
    public title = input<string>('');
    public animation = input<AnimationConfig>();
}
