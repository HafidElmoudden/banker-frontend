import { Routes } from '@angular/router';
import { UsersManagementComponent } from './users-management/users-management.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'users', component: UsersManagementComponent },
      { path: 'settings', component: SystemSettingsComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
]; 