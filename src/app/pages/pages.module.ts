import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StarterComponent } from './starter/starter.component';
import { PagesRoutes } from './pages.routing.module';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { CatagoryComponent } from './catagory/catagory.component';
import { ProductsComponent } from './products/products.component';
import { ConfirmDialogComponent } from './authentication/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [CatagoryComponent, ProductsComponent, ConfirmDialogComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    RouterModule.forChild(PagesRoutes),
    StarterComponent
  ],
  exports: [RouterModule],
})
export class PagesModule {}
