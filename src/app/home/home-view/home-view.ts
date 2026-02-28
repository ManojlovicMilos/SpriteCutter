import { Component, inject } from '@angular/core';
import { RoutingService, VynilUIModule } from 'vynil-ui';

@Component({
    selector: 'spc-home-view',
    imports: [VynilUIModule],
    templateUrl: './home-view.html',
    styleUrl: './home-view.scss',
})
export class HomeView {
    private routingService: RoutingService = inject(RoutingService);

    public onNavigate(path: string): void {
        this.routingService.navigate(path);
    }
}
