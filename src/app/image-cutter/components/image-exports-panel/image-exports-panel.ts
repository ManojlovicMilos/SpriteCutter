import { Component } from '@angular/core';
import { VynilUIModule } from 'vynil-ui';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

const EXPORT_TYPE_OPTIONS = [{
    text: 'Directory Structure',
    value: 'directory',
}, {
    text: 'Singular Image',
    value: 'singular',
}];

type SelectType = {text: string, value: string};

@Component({
    selector: 'spc-image-exports-panel',
    imports: [VynilUIModule, ReactiveFormsModule],
    templateUrl: './image-exports-panel.html',
    styleUrl: './image-exports-panel.scss',
})
export class ImageExportsPanel {
    public options = EXPORT_TYPE_OPTIONS;
    public control: FormControl<SelectType>;

    public constructor() {
        this.control = new FormControl<SelectType>(EXPORT_TYPE_OPTIONS[0], { nonNullable: true });
    }
}
