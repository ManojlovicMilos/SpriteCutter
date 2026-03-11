import { Component, input, output } from '@angular/core';
import { VynilUIModule } from 'vynil-ui';

@Component({
    selector: 'spc-loader',
    imports: [VynilUIModule],
    templateUrl: './loader.html',
    styleUrl: './loader.scss',
})
export class Loader {
    public visible = input(false);
}
