import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Chart, ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';


import { PieController, ArcElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(PieController, ArcElement, Title, Tooltip, Legend);

interface QualityStats {
  totalPlanActions: number;
  totalTasks: number;
  doneTasks: number;
  notDoneTasks: number;
  totalRapports: number;
  totalFactories: number;
}

@Component({
  selector: 'app-quality-home',
  imports: [CommonModule, NgChartsModule],
  templateUrl: './quality-home.component.html',
})
export class QualityHomeComponent implements OnInit {
  stats: QualityStats = {
    totalPlanActions: 0,
    totalTasks: 0,
    doneTasks: 0,
    notDoneTasks: 0,
    totalRapports: 0,
    totalFactories: 0
  };

  // Pie Chart Configuration for Tasks
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Terminées', 'En Attente'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',  // Green for done
        'rgba(234, 179, 8, 0.8)',  // Yellow for not done
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(234, 179, 8, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 15,
      hoverBorderWidth: 3
    }]
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: 'bold'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'État des Tâches',
        font: {
          size: 20,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        },
        color: '#352961'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        bodyFont: {
          size: 13
        },
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        padding: 12,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 3,
        usePointStyle: true,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }
    }
  };

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchQualityStats();
  }

  fetchQualityStats() {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('Token not found');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<QualityStats>('https://localhost:7299/api/Quality/dashboard-stats', { headers })
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.updateChart();
        },
        error: (error) => {
          console.error('Error fetching quality stats:', error);
        }
      });
  }

  private updateChart(): void {
    if (this.stats && this.pieChartData.datasets && this.pieChartData.datasets.length > 0) {
      this.pieChartData = {
        ...this.pieChartData,
        datasets: [{
          ...this.pieChartData.datasets[0],
          data: [
            this.stats.doneTasks,
            this.stats.notDoneTasks
          ]
        }]
      };
      this.cdr.detectChanges();
    }
  }
}
