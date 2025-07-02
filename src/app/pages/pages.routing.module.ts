import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { ProductsComponent } from './products/products.component';
import { CatagoryComponent } from './catagory/catagory.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter Page',
    },
  },
  {
    path: 'products',
    component: ProductsComponent,
    data: {
      title: 'Products Page',
    },
  },
  {
    path: 'catagory',
    component: CatagoryComponent,
    data: {
      title: 'Catagory Page',
    },
  },
];
