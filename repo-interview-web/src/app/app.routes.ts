import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/components/product-list/product-list.component';
import { ProductFormComponent } from './features/products/components/product-form/product-form.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'add', component: ProductFormComponent },
  { path: 'edit/:id', component: ProductFormComponent },
];