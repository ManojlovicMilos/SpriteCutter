import { VynilUIModule } from 'vynil-ui';
import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';

@Component({
    selector: 'spc-io-settings-switcher',
    imports: [
        CommonModule,
        VynilUIModule
    ],
    templateUrl: './io-settings-switcher.html',
    styleUrl: './io-settings-switcher.scss',
})
export class IoSettingsSwitcher {
    public changed = output<string>();

    public selectedView: string = 'import';

    public onChangeView(view: string): void {
        this.selectedView = view;
        this.changed.emit(view);
    }
}
