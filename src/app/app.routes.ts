import { Routes } from '@angular/router';
import { CustomersComponent } from "./customers/customers.component";
import { AccountsComponent } from "./accounts/accounts.component";
import { NewCustomerComponent } from "./new-customer/new-customer.component";
import { NewAccountComponent } from "./new-account/new-account.component";
import { CustomerAccountsComponent } from "./customer-accounts/customer-accounts.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { authGuard } from './guards/auth.guard';
import { AdministrationLayoutComponent } from './administration/administration-layout/administration-layout.component';
import { ADMINISTRATION_ROUTES } from './administration/administration.routes';

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "dashboard", component: DashboardComponent, canActivate: [authGuard] },
  { path: "customers", component: CustomersComponent, canActivate: [authGuard] },
  { path: "accounts", component: AccountsComponent, canActivate: [authGuard] },
  { path: "new-customer", component: NewCustomerComponent, canActivate: [authGuard] },
  { path: "new-account", component: NewAccountComponent, canActivate: [authGuard] },
  { path: "customer-accounts/:id", component: CustomerAccountsComponent, canActivate: [authGuard] },
  { path: "change-password", component: ChangePasswordComponent, canActivate: [authGuard] },
  { 
    path: "admin", 
    component: AdministrationLayoutComponent, 
    canActivate: [authGuard],
    children: ADMINISTRATION_ROUTES 
  },
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "**", redirectTo: "/dashboard" }
]; 