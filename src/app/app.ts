import { RouterOutlet } from '@angular/router';
import { Component, inject } from '@angular/core';
import { ThemeService, VynilUIModule } from 'vynil-ui';
import { Navigation } from './global/components/navigation/navigation';

const components = [
  Navigation,
];

@Component({
  selector: 'spc-root',
  imports: [
    RouterOutlet,
    VynilUIModule,
    ...components,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private themeService: ThemeService = inject(ThemeService);

  public constructor() {
    this.themeService.updateTheme({
      variables: {
        border: 2,
        radius: 1,
        padding: 1,
        transitionLength: 0.3,
        colorContrastFactor: 10,
        iconSizes: [0.75, 0.9, 1.5, 2.75, 3.5],
        fontSizes: [10, 12, 16, 20, 24, 42, 64, 92],
      },
      colors: {
          text: '#FFFFFF',
          primary: '#0EA5E9',
          highlight: '#FFFFFF',
          background: '#27272A',
          boxShadow: 'rgba(0, 0, 0, 0.45) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px',
      },
    });
  }
}
