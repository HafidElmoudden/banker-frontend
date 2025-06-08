import { Routes } from '@angular/router';
import { UsersManagementComponent } from './users-management/users-management.component';

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'users', component: UsersManagementComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
]; 