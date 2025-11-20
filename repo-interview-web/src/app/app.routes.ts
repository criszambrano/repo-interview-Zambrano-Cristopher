import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/components/product-list/product-list.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: '**', redirectTo: '' }
];