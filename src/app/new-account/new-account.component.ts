import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AccountsService } from '../services/accounts.service';
import { CustomerService } from '../services/customer.service';
import { AuthService } from '../services/auth.service';
import { Customer } from '../model/customer.model';

@Component({
  selector: 'app-new-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './new-account.component.html',
  styleUrl: './new-account.component.css'
})
export class NewAccountComponent implements OnInit {
  accountForm!: FormGroup;
  customers: Customer[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  accountTypes = ['CURRENT', 'SAVING'];
  selectedCustomerId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private accountsService: AccountsService,
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      customerId: ['', [Validators.required]],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      accountType: ['CURRENT', [Validators.required]],
      overDraft: [9000, [Validators.min(0)]],
      interestRate: [5.5, [Validators.min(0), Validators.max(100)]]
    });

    // Check for customerId in query params
    this.route.queryParams.subscribe(params => {
      if (params['customerId']) {
        this.selectedCustomerId = params['customerId'];
        this.accountForm.patchValue({
          customerId: this.selectedCustomerId
        });
      }
    });

    // Show/hide fields based on account type
    this.accountForm.get('accountType')?.valueChanges.subscribe(accountType => {
      this.updateFormBasedOnAccountType(accountType);
    });

    this.loadCustomers();
    this.updateFormBasedOnAccountType(this.accountForm.get('accountType')?.value);
  }

  updateFormBasedOnAccountType(accountType: string) {
    if (accountType === 'CURRENT') {
      this.accountForm.get('overDraft')?.enable();
      this.accountForm.get('interestRate')?.disable();
    } else {
      this.accountForm.get('overDraft')?.disable();
      this.accountForm.get('interestRate')?.enable();
    }
  }

  loadCustomers() {
    this.isLoading = true;
    this.customerService.getCustomers(0, 100).subscribe({
      next: (data) => {
        this.customers = data.content;
        this.isLoading = false;
        
        // If we have a selectedCustomerId, make sure it's in the list
        if (this.selectedCustomerId && this.customers.findIndex(c => c.id.toString() === this.selectedCustomerId) === -1) {
          this.errorMessage = 'Selected customer not found';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load customers';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.accountForm.invalid) {
      this.markFormGroupTouched(this.accountForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const accountRequest = {
      customerId: this.accountForm.value.customerId,
      initialBalance: this.accountForm.value.initialBalance,
      accountType: this.accountForm.value.accountType,
      overDraft: this.accountForm.value.accountType === 'CURRENT' ? this.accountForm.value.overDraft : null,
      interestRate: this.accountForm.value.accountType === 'SAVING' ? this.accountForm.value.interestRate : null,
      createdBy: this.authService.currentUserValue?.username
    };

    console.log('Creating account with:', accountRequest);

    this.accountsService.createAccount(accountRequest).subscribe({
      next: (data) => {
        this.successMessage = `Account created successfully with ID: ${data.accountId}`;
        this.accountForm.get('initialBalance')?.reset(0);
        setTimeout(() => {
          // If we came from a customer page, go back to it
          if (this.selectedCustomerId) {
            this.router.navigate(['/customer-accounts', this.selectedCustomerId]);
          } else {
            this.router.navigate(['/accounts']);
          }
        }, 1500);
      },
      error: (err) => {
        console.error('Error creating account:', err);
        this.errorMessage = err.error?.message || 'Failed to create account';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Helper method to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
} 