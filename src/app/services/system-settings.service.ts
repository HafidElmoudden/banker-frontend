import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SystemSettingsService {
  private apiUrl = `${environment.backendHost}/settings`;

  constructor(private http: HttpClient) { }

  // Get all settings
  getSettings(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Update general settings
  updateGeneralSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/general`, settings);
  }

  // Update security settings
  updateSecuritySettings(settings: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/security`, settings);
  }
} 