import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { CatagoryComponent } from './catagory/catagory.component';
import { ProductsComponent } from './products/products.component';


export const PagesRoutes: Routes = [
  // Dashboard example
  {
    path: 'home',
    component: StarterComponent,
    data: {
      title: 'Starter Page',
    },
  },

  {
    path: 'categories',
    component: CatagoryComponent,
    data: {
      title: 'Categories Page',
    },
  },
  {
    path: 'products',
    component: ProductsComponent,
    data: {
      title: 'Products Page',
    },
  },





];
