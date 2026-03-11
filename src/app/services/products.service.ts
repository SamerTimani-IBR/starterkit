import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from 'src/assets/models/products';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  Api = environment.API_URL;

  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.Api}/products`);
  }

  // ✅ POST (create) - no id
  createProduct(payload: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(`${this.Api}/products`, payload);
  }

  // ✅ PUT (update) - full payload
  updateProduct(payload: Product): Observable<Product> {
    return this.http.put<Product>(`${this.Api}/products/${payload.id}`, payload);
  }


  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.Api}/products/${id}`);
  }


}
