import { Component } from '@angular/core';
import { VynilUIModule } from 'vynil-ui';

import { ImageImportsList } from '../image-imports-list/image-imports-list';
import { ImageExportsPanel } from '../image-exports-panel/image-exports-panel';
import { AnimationsOverview } from '../animations-overview/animations-overview';
import { SpritesetStructureSelector } from '../spriteset-structure-selector/spriteset-structure-selector';

@Component({
  selector: 'spc-image-cutter-view',
  imports: [
    VynilUIModule,
    ImageImportsList,
    ImageExportsPanel,
    AnimationsOverview,
    SpritesetStructureSelector,
  ],
  templateUrl: './image-cutter-view.html',
  styleUrl: './image-cutter-view.scss',
  host: { 'class': 'fill' },
})
export class ImageCutterView {
  
}
