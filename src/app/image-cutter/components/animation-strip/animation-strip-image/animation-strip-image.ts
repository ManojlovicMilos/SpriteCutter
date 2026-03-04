import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { B64Image } from '../../../../shared/models/b64-image.model';

@Component({
    selector: 'spc-animation-strip-image',
    imports: [CommonModule],
    templateUrl: './animation-strip-image.html',
    styleUrl: './animation-strip-image.scss',
})
export class AnimationStripImage {
    public index = input<number>(0);
    public images = input<B64Image[][]>([]);
}
