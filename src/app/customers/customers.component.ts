import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CustomerService} from "../services/customer.service";
import {catchError, map, Observable, throwError} from "rxjs";
import {Customer} from "../model/customer.model";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {CommonModule} from '@angular/common';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  errorMessage: string = '';
  searchFormGroup: FormGroup;
  isLoading: boolean = false;
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  totalItems: number = 0;
  editingCustomer: Customer | null = null;
  editCustomerForm: FormGroup;
  showEditModal: boolean = false;

  constructor(
    private customerService: CustomerService, 
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control("")
    });

    this.editCustomerForm = this.fb.group({
      id: [''],
      name: [''],
      email: [''],
      phone: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading = true;
    this.customerService.getCustomers(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.customers = data.content;
        this.totalPages = data.totalPages;
        this.totalItems = data.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  handleSearchCustomers() {
    this.isLoading = true;
    const kw = this.searchFormGroup.value.keyword;
    this.currentPage = 0; // Reset to first page on search
    
    this.customerService.searchCustomers(kw, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.customers = data.content;
        this.totalPages = data.totalPages;
        this.totalItems = data.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  handleDeleteCustomer(c: Customer) {
    let conf = confirm("Are you sure you want to delete this customer?");
    if (!conf) return;
    
    this.isLoading = true;
    this.customerService.deleteCustomer(c.id).subscribe({
      next: () => {
        // Remove customer from the list
        this.customers = this.customers.filter(customer => customer.id !== c.id);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  handleCustomerAccounts(customer: Customer) {
    this.router.navigateByUrl("/customer-accounts/"+customer.id,{state :customer});
  }

  gotoPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadCustomers();
  }

  openEditModal(customer: Customer) {
    this.editingCustomer = { ...customer };
    this.editCustomerForm.patchValue(this.editingCustomer);
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingCustomer = null;
  }

  submitEditForm() {
    if (this.editCustomerForm.invalid || !this.editingCustomer) return;
    
    const updatedCustomer = {
      ...this.editingCustomer,
      ...this.editCustomerForm.value
    };
    
    // Add the current user as the modifier
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      updatedCustomer.lastModifiedBy = currentUser.username;
    }
    
    this.isLoading = true;
    this.customerService.updateCustomer(updatedCustomer.id, updatedCustomer).subscribe({
      next: (data) => {
        // Update customer in the list
        const index = this.customers.findIndex(c => c.id === data.id);
        if (index !== -1) {
          this.customers[index] = data;
        }
        this.closeEditModal();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }
}
