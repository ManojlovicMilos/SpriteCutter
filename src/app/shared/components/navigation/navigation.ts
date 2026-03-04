import { Component, inject, OnInit } from '@angular/core';
import { RoutingService, VynilUIModule } from 'vynil-ui';

import navigationData from './navigation.data.json';

type NavigationEntry = {
  name: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'spc-navigation',
  imports: [VynilUIModule],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation implements OnInit {
  private routingService: RoutingService = inject(RoutingService);

  public activePath = '';
  public navData: NavigationEntry[] = navigationData as NavigationEntry[];

  public ngOnInit() {
    const location = window.location.href;
    navigationData.forEach((entry: NavigationEntry) => {
      if (entry.name !== 'Home') {
        if (location.includes(entry.path)) {
          this.activePath = entry.path;
        }
      }
    });
  }

  public onNavigate(path: string) {
    this.routingService.navigate(path);
    this.activePath = path;
  }
}
