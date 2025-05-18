import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../model/user.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'username', 'email', 'roles', 'active', 'actions'];
  
  // Pagination
  totalUsers: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  currentPage: number = 0;
  
  // Search
  searchForm!: FormGroup;
  
  // User form
  userForm!: FormGroup;
  isEditMode: boolean = false;
  selectedUser: User | null = null;
  
  // Loading state
  isLoading: boolean = false;
  
  // Available roles
  availableRoles: string[] = ['USER', 'ADMIN'];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadUsers();
  }

  initForms(): void {
    this.searchForm = this.fb.group({
      keyword: ['']
    });

    this.userForm = this.fb.group({
      id: [null],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      roles: [['USER'], [Validators.required]],
      active: [true]
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.users = data.content;
        this.totalUsers = data.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.showMessage('Error loading users: ' + (err.error?.message || err.message));
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const keyword = this.searchForm.get('keyword')?.value;
    if (!keyword || keyword.trim() === '') {
      this.loadUsers();
      return;
    }

    this.isLoading = true;
    this.userService.searchUsers(keyword, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.users = data.content;
        this.totalUsers = data.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.showMessage('Error searching users: ' + (err.error?.message || err.message));
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    
    if (this.searchForm.get('keyword')?.value) {
      this.onSearch();
    } else {
      this.loadUsers();
    }
  }

  openUserDialog(user?: User): void {
    this.isEditMode = !!user;
    this.selectedUser = user || null;
    
    if (this.isEditMode && user) {
      this.userForm.patchValue({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        active: user.active
      });
      // Clear password field in edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.reset({
        active: true,
        roles: ['USER']
      });
      // Add password validator in create mode
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      return;
    }

    const userData = this.userForm.value;
    this.isLoading = true;

    if (this.isEditMode) {
      // If password is empty, remove it from the update data
      if (!userData.password) {
        delete userData.password;
      }
      
      this.userService.updateUser(userData.id, userData).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.showMessage('User updated successfully');
          this.cancelEdit();
          this.isLoading = false;
        },
        error: (err) => {
          this.showMessage('Error updating user: ' + (err.error?.message || err.message));
          this.isLoading = false;
        }
      });
    } else {
      this.userService.createUser(userData).subscribe({
        next: (newUser) => {
          this.users = [newUser, ...this.users];
          this.showMessage('User created successfully');
          this.cancelEdit();
          this.isLoading = false;
        },
        error: (err) => {
          this.showMessage('Error creating user: ' + (err.error?.message || err.message));
          this.isLoading = false;
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedUser = null;
    this.userForm.reset({
      active: true,
      roles: ['USER']
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.isLoading = true;
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.showMessage('User deleted successfully');
          this.isLoading = false;
        },
        error: (err) => {
          this.showMessage('Error deleting user: ' + (err.error?.message || err.message));
          this.isLoading = false;
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    this.isLoading = true;
    this.userService.changeUserStatus(user.id, !user.active).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.showMessage(`User ${updatedUser.active ? 'activated' : 'deactivated'} successfully`);
        this.isLoading = false;
      },
      error: (err) => {
        this.showMessage('Error changing user status: ' + (err.error?.message || err.message));
        this.isLoading = false;
      }
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
} 