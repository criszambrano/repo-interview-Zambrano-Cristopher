import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../features/products/models/product.interface';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3002/bp/products';

  getAll() {
    return this.http.get<{ data: Product[] }>(this.apiUrl).pipe(
      map(res => res.data),
      catchError(() => of([]))
    );
  }
}