import { Routes } from '@angular/router';
import { HomeView } from './home/home-view/home-view';
import { ImageCutterView } from './image-cutter/components/image-cutter-view/image-cutter-view';
import { NormalMagGeneratorView } from './normal-map-generator/components/normal-mag-generator-view/normal-mag-generator-view';

const routes: Routes = [
    {
        path: '',
        component: HomeView,
    },
    {
        path: 'spriteset-editor',
        component: ImageCutterView,
    },
    {
        path: 'normal-map-generator',
        component: NormalMagGeneratorView,
    },
];

export default routes;
