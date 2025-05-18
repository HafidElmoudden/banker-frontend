import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { AccountsService } from "../services/accounts.service";
import { catchError, Observable, throwError } from "rxjs";
import { AccountDetails } from "../model/account.model";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class AccountsComponent implements OnInit {
  // For account list
  accounts: AccountDetails[] = [];
  totalAccounts: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  isLoading: boolean = false;
  searchFormGroup!: FormGroup;
  
  // For selected account details
  selectedAccount: AccountDetails | null = null;
  operationFormGroup!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private accountService: AccountsService) { }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: ['']
    });

    this.operationFormGroup = this.fb.group({
      operationType: [null],
      amount: [0],
      description: [null],
      accountDestination: [null]
    });

    // Load all accounts on initialization
    this.loadAccounts();
  }

  loadAccounts() {
    this.isLoading = true;
    this.errorMessage = '';
    this.accountService.getAllAccounts(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (data && data.content) {
          console.log('Accounts data:', data.content);
          this.accounts = data.content;
          this.totalAccounts = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
        } else {
          this.accounts = [];
          this.totalAccounts = 0;
          this.totalPages = 0;
          this.errorMessage = 'No data returned from server';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading accounts:', err);
        this.accounts = [];
        this.errorMessage = err.message || 'Failed to load accounts';
        this.isLoading = false;
      }
    });
  }

  searchAccounts() {
    const keyword = this.searchFormGroup?.value?.keyword;
    if (!keyword || keyword.trim() === '') {
      this.loadAccounts();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.accountService.searchAccounts(keyword, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (data && data.content) {
          this.accounts = data.content;
          this.totalAccounts = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
        } else {
          this.accounts = [];
          this.totalAccounts = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error searching accounts:', err);
        this.accounts = [];
        this.errorMessage = err.message || 'Failed to search accounts';
        this.isLoading = false;
      }
    });
  }

  gotoPage(page: number) {
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) return;
    this.currentPage = page;
    
    if (this.searchFormGroup?.value?.keyword) {
      this.searchAccounts();
    } else {
      this.loadAccounts();
    }
  }

  selectAccount(accountId: string) {
    if (!accountId) {
      this.errorMessage = 'Invalid account ID';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.accountService.getAccount(accountId, 0, 5).subscribe({
      next: (data) => {
        this.selectedAccount = data;
        // Initialize accountOperationDTOS if it doesn't exist
        if (this.selectedAccount && !this.selectedAccount.accountOperationDTOS) {
          this.selectedAccount.accountOperationDTOS = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading account details:', err);
        this.errorMessage = err.message || 'Failed to load account details';
        this.isLoading = false;
      }
    });
  }

  handleAccountOperation() {
    if (!this.selectedAccount) return;
    
    const accountId = this.selectedAccount.accountId;
    const operationType = this.operationFormGroup?.value?.operationType;
    const amount = this.operationFormGroup?.value?.amount;
    const description = this.operationFormGroup?.value?.description;
    const accountDestination = this.operationFormGroup?.value?.accountDestination;
    
    if (!operationType) {
      this.errorMessage = 'Please select an operation type';
      return;
    }
    
    if (!amount || amount <= 0) {
      this.errorMessage = 'Please enter a valid amount';
      return;
    }
    
    this.errorMessage = '';
    
    if (operationType === 'DEBIT') {
      this.accountService.debit(accountId, amount, description).subscribe({
        next: (data) => {
          alert("Success Debit");
          this.operationFormGroup.reset();
          this.selectAccount(accountId);
        },
        error: (err) => {
          console.error('Error processing debit:', err);
          this.errorMessage = err.error?.message || 'Failed to process debit';
        }
      });
    } else if (operationType === 'CREDIT') {
      this.accountService.credit(accountId, amount, description).subscribe({
        next: (data) => {
          alert("Success Credit");
          this.operationFormGroup.reset();
          this.selectAccount(accountId);
        },
        error: (err) => {
          console.error('Error processing credit:', err);
          this.errorMessage = err.error?.message || 'Failed to process credit';
        }
      });
    } else if (operationType === 'TRANSFER') {
      if (!accountDestination) {
        this.errorMessage = 'Please enter a destination account';
        return;
      }
      
      this.accountService.transfer(accountId, accountDestination, amount, description).subscribe({
        next: (data) => {
          alert("Success Transfer");
          this.operationFormGroup.reset();
          this.selectAccount(accountId);
        },
        error: (err) => {
          console.error('Error processing transfer:', err);
          this.errorMessage = err.error?.message || 'Failed to process transfer';
        }
      });
    }
  }
}
