import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Customer } from "../model/customer.model";
import { CommonModule } from '@angular/common';
import { AccountsService } from '../services/accounts.service';
import { CustomerService } from '../services/customer.service';
import { AccountDetails } from '../model/account.model';

@Component({
  selector: 'app-customer-accounts',
  templateUrl: './customer-accounts.component.html',
  styleUrls: ['./customer-accounts.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class CustomerAccountsComponent implements OnInit {
  customerId!: string;
  customer!: Customer;
  accounts: AccountDetails[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private accountsService: AccountsService,
    private customerService: CustomerService
  ) {
    this.customer = this.router.getCurrentNavigation()?.extras.state as Customer;
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.params['id'];
    this.loadCustomerData();
    this.loadCustomerAccounts();
  }

  loadCustomerData() {
    if (!this.customer) {
      this.isLoading = true;
      this.customerService.getCustomerById(Number(this.customerId)).subscribe({
        next: (data) => {
          this.customer = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Error loading customer data';
          this.isLoading = false;
        }
      });
    }
  }

  loadCustomerAccounts() {
    this.isLoading = true;
    this.accountsService.getCustomerAccounts(Number(this.customerId)).subscribe({
      next: (data) => {
        this.accounts = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error loading customer accounts';
        this.isLoading = false;
      }
    });
  }

  getTotalBalance(): number {
    return this.accounts.reduce((total, account) => total + account.balance, 0);
  }

  goToAccountDetails(accountId: string) {
    this.router.navigateByUrl('/accounts').then(() => {
      setTimeout(() => {
        // Find the account in the accounts list and trigger the selectAccount method
        const accountElement = document.querySelector(`[data-account-id="${accountId}"]`);
        if (accountElement) {
          accountElement.dispatchEvent(new Event('click'));
        }
      }, 500);
    });
  }
}
