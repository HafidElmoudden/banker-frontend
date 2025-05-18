import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) { }

  public getSystemStatistics(): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/dashboard/statistics`);
  }

  public getMonthlyOperations(year: number = new Date().getFullYear()): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/dashboard/operations/monthly?year=${year}`);
  }

  public getAccountTypeDistribution(): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/dashboard/accounts/distribution`);
  }

  public getCustomerGrowth(months: number = 12): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/dashboard/customers/growth?months=${months}`);
  }

  public getTransactionVolume(days: number = 30): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/dashboard/transactions/volume?days=${days}`);
  }

  public getTopPerformingAccounts(limit: number = 5): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/dashboard/accounts/top?limit=${limit}`);
  }

  public getRecentTransactions(limit: number = 10): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/dashboard/transactions/recent?limit=${limit}`);
  }

  public getUserActivity(days: number = 7): Observable<any> {
    return this.http.get<any>(`${environment.backendHost}/dashboard/users/activity?days=${days}`);
  }
} 