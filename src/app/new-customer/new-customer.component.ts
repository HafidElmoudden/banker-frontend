import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Customer } from "../model/customer.model";
import { CustomerService } from "../services/customer.service";
import { Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class NewCustomerComponent implements OnInit {
  newCustomerFormGroup!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private customerService: CustomerService, 
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.newCustomerFormGroup = this.fb.group({
      name: [null, [Validators.required, Validators.minLength(4)]],
      email: [null, [Validators.required, Validators.email]],
      phone: [null, [Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      address: [null]
    });
  }

  handleSaveCustomer() {
    if (this.newCustomerFormGroup.invalid) {
      this.markFormGroupTouched(this.newCustomerFormGroup);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const customer: Customer = this.newCustomerFormGroup.value;
    
    // Add the current user as the creator
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      customer.createdBy = currentUser.username;
    }
    
    this.customerService.saveCustomer(customer).subscribe({
      next: data => {
        this.successMessage = "Customer has been successfully saved!";
        this.newCustomerFormGroup.reset();
        setTimeout(() => {
          this.router.navigateByUrl("/customers");
        }, 1500);
      },
      error: err => {
        this.errorMessage = err.error?.message || "Failed to save customer. Please try again.";
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
