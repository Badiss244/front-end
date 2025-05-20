import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Chart, ChartConfiguration, DoughnutController, ArcElement } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';


import { PieController, Title, Tooltip, Legend } from 'chart.js';
Chart.register(PieController, ArcElement, Title, Tooltip, Legend, DoughnutController);

interface FactoryStats {
  factoryName: string;
  factoryAddress: string;
  totalPlanActions: number;
  averageScore: number;
  rapports: number;
  totalTasksToDo: number;
  totalTasksCompleted: number;
  totalTasksNotCompleted: number;
}

@Component({
  selector: 'app-factory-home',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './factory-home.component.html',
  styleUrl: './factory-home.component.css'
})
export class FactoryHomeComponent implements OnInit {
  stats: FactoryStats = {
    factoryName: '',
    factoryAddress: '',
    totalPlanActions: 0,
    averageScore: 0,
    rapports: 0,
    totalTasksToDo: 0,
    totalTasksCompleted: 0,
    totalTasksNotCompleted: 0
  };

  // Gauge Chart Configuration
  gaugeChartData: ChartConfiguration<'doughnut'>['data'] = {
    datasets: [{
      data: [0, 5], 
      backgroundColor: [
        '#ef4444', // Red 
        '#e5e7eb' // Light gray 
      ],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
    }]
  };

  gaugeChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    events: [] 
  };

  // Pie Chart Configuration for Tasks
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Terminées', 'En Attente'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',  // Green for completed
        'rgba(234, 179, 8, 0.8)',  // Yellow for not completed
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
    this.fetchFactoryStats();
  }

  fetchFactoryStats() {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('Token not found');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': 'Bearer'+token
    });

    this.http.get<FactoryStats>('https://localhost:7299/api/Factory/factory-stats', { headers })
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.updateCharts();
        },
        error: (error) => {
          console.error('Error fetching factory stats:', error);
        }
      });
  }

  private updateCharts(): void {
    // Update pie chart
    if (this.stats && this.pieChartData.datasets && this.pieChartData.datasets.length > 0) {
      this.pieChartData = {
        ...this.pieChartData,
        datasets: [{
          ...this.pieChartData.datasets[0],
          data: [
            this.stats.totalTasksCompleted,
            this.stats.totalTasksNotCompleted
          ]
        }]
      };
    }

    // Update gauge chart
    if (this.stats && this.gaugeChartData.datasets && this.gaugeChartData.datasets.length > 0) {
      const score = this.stats.averageScore;
      const remaining = 5 - score;

      let color;
      if (score >= 4) {
        color = '#22c55e'; // Green
      } else if (score >= 3) {
        color = '#eab308'; // Yellow
      } else {
        color = '#ef4444'; // Red
      }

      this.gaugeChartData = {
        ...this.gaugeChartData,
        datasets: [{
          ...this.gaugeChartData.datasets[0],
          data: [score, remaining],
          backgroundColor: [
            color,
            '#e5e7eb' // Light gray 
          ]
        }]
      };
    }

    this.cdr.detectChanges();
  }
}
