import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';


export const PagesRoutes: Routes = [
  // Dashboard example
  {
    path: 'home',
    component: StarterComponent,
    data: {
      title: 'Starter Page',
    },
  },


];
