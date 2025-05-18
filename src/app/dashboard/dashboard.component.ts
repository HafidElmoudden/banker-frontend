import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { CustomerService } from '../services/customer.service';
import { AccountsService } from '../services/accounts.service';
import { AuthService } from '../services/auth.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  statistics: any = {
    totalCustomers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    totalBalance: 0
  };
  
  topCustomers: any[] = [];
  recentTransactions: any[] = [];
  accountDistribution: any = {};
  monthlyOperations: any[] = [];
  
  isLoading = true;
  error = '';
  dataLoaded = false;

  // Charts
  accountTypeChart: any;
  monthlyOperationsChart: any;
  transactionTrendsChart: any;

  constructor(
    private dashboardService: DashboardService,
    private customerService: CustomerService,
    private accountsService: AccountsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Wait for the view to be fully initialized before attempting to create charts
    setTimeout(() => {
      if (this.dataLoaded) {
        this.createCharts();
      }
    }, 500);
  }

  private createCharts() {
    this.createAccountTypeChart();
    this.createMonthlyOperationsChart();
    this.createTransactionTrendsChart();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Get system statistics
    this.dashboardService.getSystemStatistics().subscribe({
      next: (data) => {
        console.log('Statistics data:', data);
        this.statistics = data;
      },
      error: (error) => {
        this.error = 'Failed to load statistics';
        console.error('Statistics error:', error);
      }
    });

    // Get top customers
    this.customerService.getTopCustomers(5).subscribe({
      next: (data) => {
        console.log('Top customers data:', data);
        this.topCustomers = data;
      },
      error: (error) => {
        console.error('Failed to load top customers', error);
      }
    });

    // Get recent transactions
    this.dashboardService.getRecentTransactions(10).subscribe({
      next: (data) => {
        console.log('Recent transactions data:', data);
        this.recentTransactions = data;
      },
      error: (error) => {
        console.error('Failed to load recent transactions', error);
      }
    });

    // Get account type distribution
    this.dashboardService.getAccountTypeDistribution().subscribe({
      next: (data) => {
        console.log('Account distribution data:', data);
        this.accountDistribution = data;
      },
      error: (error) => {
        console.error('Failed to load account distribution', error);
      }
    });

    // Get monthly operations
    this.dashboardService.getMonthlyOperations().subscribe({
      next: (data) => {
        console.log('Monthly operations data:', data);
        this.monthlyOperations = data;
        this.isLoading = false;
        this.dataLoaded = true;
        
        // Create charts if view is already initialized
        if (document.getElementById('accountTypeChart')) {
          this.createCharts();
        }
      },
      error: (error) => {
        console.error('Failed to load monthly operations', error);
        this.isLoading = false;
      }
    });
  }

  createAccountTypeChart() {
    if (this.accountTypeChart) {
      this.accountTypeChart.destroy();
    }

    const ctx = document.getElementById('accountTypeChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Could not find accountTypeChart canvas element');
      return;
    }

    console.log('Creating account type chart with data:', this.accountDistribution);

    this.accountTypeChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Saving Accounts', 'Current Accounts'],
        datasets: [{
          data: [
            this.accountDistribution.savingAccounts || 0,
            this.accountDistribution.currentAccounts || 0
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Account Type Distribution'
          }
        }
      }
    });
  }

  createMonthlyOperationsChart() {
    if (this.monthlyOperationsChart) {
      this.monthlyOperationsChart.destroy();
    }

    const ctx = document.getElementById('monthlyOperationsChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Could not find monthlyOperationsChart canvas element');
      return;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const credits = this.monthlyOperations.map(item => item.credits || 0);
    const debits = this.monthlyOperations.map(item => item.debits || 0);
    const counts = this.monthlyOperations.map(item => item.count || 0);

    console.log('Creating monthly operations chart with data:', {
      months,
      credits,
      debits,
      counts
    });

    this.monthlyOperationsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Credits',
            data: credits,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Debits',
            data: debits,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monthly Operations'
          }
        }
      }
    });
  }

  createTransactionTrendsChart() {
    if (this.transactionTrendsChart) {
      this.transactionTrendsChart.destroy();
    }

    const ctxLine = document.getElementById('transactionTrendsChart') as HTMLCanvasElement;
    if (!ctxLine) {
      console.error('Could not find transactionTrendsChart canvas element');
      return;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = this.monthlyOperations.map(item => item.count || 0);

    this.transactionTrendsChart = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Transaction Count',
          data: counts,
          fill: false,
          borderColor: 'rgba(153, 102, 255, 1)',
          tension: 0.1,
          pointBackgroundColor: 'rgba(153, 102, 255, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(153, 102, 255, 1)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Transactions'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Transaction Trends'
          }
        }
      }
    });
  }
}
