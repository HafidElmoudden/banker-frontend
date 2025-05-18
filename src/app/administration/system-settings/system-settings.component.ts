import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { SystemSettingsService } from '../../services/system-settings.service';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatIconModule
  ],
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.css'],
  providers: [SystemSettingsService]
})
export class SystemSettingsComponent implements OnInit {
  generalSettingsForm!: FormGroup;
  securitySettingsForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private systemSettingsService: SystemSettingsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadSettings();
  }

  initForms(): void {
    this.generalSettingsForm = this.fb.group({
      bankName: ['', Validators.required],
      bankCode: ['', Validators.required],
      defaultCurrency: ['MAD', Validators.required],
      supportEmail: ['', [Validators.required, Validators.email]],
      supportPhone: ['', Validators.required],
      maintenanceMode: [false]
    });

    this.securitySettingsForm = this.fb.group({
      sessionTimeoutMinutes: [30, [Validators.required, Validators.min(5), Validators.max(120)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(3), Validators.max(10)]],
      passwordExpiryDays: [90, [Validators.required, Validators.min(30), Validators.max(365)]],
      twoFactorAuthRequired: [false],
      minimumPasswordLength: [8, [Validators.required, Validators.min(6), Validators.max(20)]],
      requireSpecialCharacters: [true],
      requireNumbers: [true]
    });
  }

  loadSettings(): void {
    this.isLoading = true;
    this.systemSettingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings.general) {
          this.generalSettingsForm.patchValue(settings.general);
        }
        if (settings.security) {
          this.securitySettingsForm.patchValue(settings.security);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.showMessage('Error loading settings: ' + (err.error?.message || err.message));
        this.isLoading = false;
      }
    });
  }

  saveGeneralSettings(): void {
    if (this.generalSettingsForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.systemSettingsService.updateGeneralSettings(this.generalSettingsForm.value).subscribe({
      next: () => {
        this.showMessage('General settings updated successfully');
        this.isLoading = false;
      },
      error: (err) => {
        this.showMessage('Error updating general settings: ' + (err.error?.message || err.message));
        this.isLoading = false;
      }
    });
  }

  saveSecuritySettings(): void {
    if (this.securitySettingsForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.systemSettingsService.updateSecuritySettings(this.securitySettingsForm.value).subscribe({
      next: () => {
        this.showMessage('Security settings updated successfully');
        this.isLoading = false;
      },
      error: (err) => {
        this.showMessage('Error updating security settings: ' + (err.error?.message || err.message));
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