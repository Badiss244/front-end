import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chart, ChartConfiguration } from 'chart.js';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { NgChartsModule } from 'ng2-charts';

// Register required Chart.js components
import { CategoryScale, LinearScale, BarController, BarElement, PieController, ArcElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarController, BarElement, PieController, ArcElement, Title, Tooltip, Legend);

interface Statistics {
  adminCount: number;
  factoryMCount: number;
  qualityMCount: number;
  auditorCount: number;
  usineCount: number;
  filialeCount: number;
  planActionCount: number;
  rapportCount: number;
  globalAverage5s: number;
  averageS1: number;
  averageS2: number;
  averageS3: number;
  averageS4: number;
  averageS5: number;
}

interface SScore {
  sName: string;
  averageScore: number;
}

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  imports: [CommonModule, NgChartsModule, DecimalPipe],
})
export class AdminHomeComponent implements OnInit {
  stats: Statistics = {
    adminCount: 0,
    factoryMCount: 0,
    qualityMCount: 0,
    auditorCount: 0,
    usineCount: 0,
    filialeCount: 0,
    planActionCount: 0,
    rapportCount: 0,
    globalAverage5s: 0,
    averageS1: 0,
    averageS2: 0,
    averageS3: 0,
    averageS4: 0,
    averageS5: 0
  };

  get totalUsers(): number {
    return this.stats.adminCount + this.stats.factoryMCount + 
           this.stats.qualityMCount + this.stats.auditorCount;
  }

  // Bar Chart Configuration
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [
      'Trier (Seiri)',
      'Ranger (Seiton)',
      'Nettoyer (Seiso)',
      'Standardiser (Seiketsu)',
      'Suivre (Shitsuke)'
    ],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      label: '',
      backgroundColor: [
        'rgba(54, 162, 235, 0.85)',
        'rgba(255, 206, 86, 0.85)',
        'rgba(75, 192, 192, 0.85)',
        'rgba(153, 102, 255, 0.85)',
        'rgba(255, 159, 64, 0.85)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8,
      barPercentage: 0.9,
      categoryPercentage: 0.8
    }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Scores par Principe 5S',
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
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 0.5,
          font: {
            size: 12
          },
          padding: 8
        },
        title: {
          display: true,
          text: 'Score',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawTicks: false
        }
      },
      x: {
        title: {
          display: true,
          text: 'Principes 5S',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 0
          }
        },
        ticks: {
          font: {
            size: 12
          },
          padding: 8
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Pie Chart Configuration
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Administrateurs', 'Responsables Usine', 'Responsables Qualité', 'Auditeurs'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(255, 99, 132, 0.85)',
        'rgba(54, 162, 235, 0.85)',
        'rgba(255, 206, 86, 0.85)',
        'rgba(75, 192, 192, 0.85)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
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
        text: 'Distribution des Utilisateurs',
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

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('erreur token');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Load general statistics
    this.http.get<Statistics>('https://localhost:7299/api/Account/statistics', { headers })
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.updateCharts();
        },
        error: (error) => {
          console.error('erreur lors de la récupération', error);
        }
      });

    // Load 5S scores
    this.http.get<SScore[]>('https://localhost:7299/api/Admin/global-scores', { headers })
      .subscribe({
        next: (scores) => {
          // Update bar chart with new scores
          if (this.barChartData && this.barChartData.datasets && this.barChartData.datasets.length > 0) {
            this.barChartData = {
              ...this.barChartData,
              datasets: [{
                ...this.barChartData.datasets[0],
                data: scores.map(score => score.averageScore)
              }]
            };
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('erreur lors de la récupération des scores 5S', error);
        }
      });
  }

  private updateCharts(): void {
    if (this.stats) {
      // Update pie chart data only
      if (this.pieChartData.datasets && this.pieChartData.datasets.length > 0) {
        this.pieChartData = {
          ...this.pieChartData,
          datasets: [{
            ...this.pieChartData.datasets[0],
            data: [
              this.stats.adminCount,
              this.stats.factoryMCount,
              this.stats.qualityMCount,
              this.stats.auditorCount
            ]
          }]
        };
      }
      this.cdr.detectChanges();
    }
  }
}
