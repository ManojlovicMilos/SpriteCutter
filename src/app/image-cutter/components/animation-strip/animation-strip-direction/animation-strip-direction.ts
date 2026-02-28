import { VynilUIModule } from 'vynil-ui';
import { Component, input } from '@angular/core';

import { B64Image } from '../../../models/image-import-data.model';
import { AnimationConfig } from '../../../models/spriteset-config.model';
import { AnimationStripImage } from '../animation-strip-image/animation-strip-image';

@Component({
    selector: 'spc-animation-strip-direction',
    imports: [VynilUIModule, AnimationStripImage],
    templateUrl: './animation-strip-direction.html',
    styleUrl: './animation-strip-direction.scss',
    host: { 'class': 'fill' },
})
export class AnimationStripDirection {
    public title = input<string>('');
    public images = input<B64Image[][]>([]);
    public animation = input<AnimationConfig>();
}
