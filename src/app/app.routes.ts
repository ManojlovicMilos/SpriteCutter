import { Routes } from '@angular/router';
import { HomeView } from './home/home-view/home-view';
import { ImageCutterView } from './image-cutter/components/image-cutter-view/image-cutter-view';

const routes: Routes = [
    {
        path: '',
        component: HomeView,
    },
    {
        path: 'spriteset-editor',
        component: ImageCutterView,
    },
];

export default routes;
