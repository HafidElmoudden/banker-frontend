import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Customer} from "../model/customer.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private http:HttpClient) { }

  public getCustomers(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/customers?page=${page}&size=${size}`);
  }

  public getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${environment.backendHost}/customers/${id}`);
  }

  public searchCustomers(keyword: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/customers/search?keyword=${keyword}&page=${page}&size=${size}`);
  }

  public saveCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${environment.backendHost}/customers`, customer);
  }

  public updateCustomer(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${environment.backendHost}/customers/${id}`, customer);
  }

  public deleteCustomer(id: number) {
    return this.http.delete(`${environment.backendHost}/customers/${id}`);
  }

  public getCustomerStatistics(): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/customers/statistics`);
  }

  public getTopCustomers(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${environment.backendHost}/customers/top?limit=${limit}`);
  }
}
