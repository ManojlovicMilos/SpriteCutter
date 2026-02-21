import { Component } from '@angular/core';
import { VynilUIModule } from 'vynil-ui';

import { AnimationStrip } from '../animation-strip/animation-strip';

@Component({
  selector: 'spc-image-cutter-view',
  imports: [VynilUIModule, AnimationStrip],
  templateUrl: './image-cutter-view.html',
  styleUrl: './image-cutter-view.scss',
  host: { 'class': 'fill' },
})
export class ImageCutterView {

}
