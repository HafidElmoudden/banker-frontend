import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse, PasswordChange, User } from '../model/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.backendHost}/auth/login`, { username, password })
      .pipe(
        tap(response => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
          this.currentUserSubject.next(response.user);
          this.autoLogout(3600000); // Auto logout after 1 hour
        })
      );
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${environment.backendHost}/auth/register`, user);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
    this.router.navigate(['/login']);
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  changePassword(passwordData: PasswordChange): Observable<any> {
    return this.http.post(`${environment.backendHost}/auth/change-password`, passwordData);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return of(null as any);
    }
    return this.http.post<AuthResponse>(`${environment.backendHost}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
        }),
        catchError(error => {
          this.logout();
          return of(null as any);
        })
      );
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.roles.includes(role) || false;
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.backendHost}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.backendHost}/users/${id}`);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${environment.backendHost}/users/${user.id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${environment.backendHost}/users/${id}`);
  }
} 