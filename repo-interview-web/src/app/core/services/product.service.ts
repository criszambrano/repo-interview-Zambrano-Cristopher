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

  verifyId(id: string) {
    return this.http.get<boolean>(`${this.apiUrl}/verification/${id}`);
  }

  getById(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: Product) {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: string, product: Partial<Product>) {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}