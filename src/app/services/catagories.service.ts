import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface Catagory {
  id: string;
  name: string;
  catagoryType: string;
  isActive: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class CatagoriesService {

  Api = environment.API_URL;

  constructor(private http: HttpClient) { }
  getAllCatagories(): Observable<Catagory[]> {
    return this.http.get<Catagory[]>(`${this.Api}/catagory`);
  }

  updateCatagory(payload: Catagory): Observable<Catagory> {
    return this.http.put<Catagory>(`${this.Api}/catagory/${payload.id}`, payload);
  }

  AddCatagory(payload: Omit<Catagory, 'id'>): Observable<Catagory> {
    return this.http.post<Catagory>(`${this.Api}/catagory`, payload);
  }
}