import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Chart, ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';


import { PieController, ArcElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
Chart.register(PieController, ArcElement, Title, Tooltip, Legend, RadialLinearScale);

interface AuditStats {
  totalAudits: number;
  completedAudits: number;
  canceledAudits: number;
  inProgressAudits: number;
  rapports: number;
  dates: { planDate: string }[];
}

interface WeekDay {
  date: Date;
  hasAudit: boolean;
  isCurrentMonth: boolean;
  auditCount?: number;  // Number of audits on this day
}

@Component({
  selector: 'app-auditor-home',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './auditor-home.component.html',
  styleUrl: './auditor-home.component.css'
})
export class AuditorHomeComponent implements OnInit {
  stats: AuditStats = {
    totalAudits: 0,
    completedAudits: 0,
    canceledAudits: 0,
    inProgressAudits: 0,
    rapports: 0,
    dates: []
  };

  weeks: WeekDay[][] = [];
  weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  currentMonth = new Date();

  //  Progress Chart Configuration
  radialChartData: ChartConfiguration<'doughnut'>['data'] = {
    datasets: [{
      data: [0, 100],
      backgroundColor: [
        '#22c55e', // Green
        '#e5e7eb' // Light gray
      ],
      borderWidth: 0,
      circumference: 360, // Full circle
      rotation: 270,
    }]
  };

  radialChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '85%', 
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

  // Pie Chart Configuration
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Complétés', 'En Cours', 'Annulés'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',  // Brighter green for completed
        'rgba(234, 179, 8, 0.8)',  // Brighter yellow for in progress
        'rgba(239, 68, 68, 0.8)'   // Brighter red for canceled
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(234, 179, 8, 1)',
        'rgba(239, 68, 68, 1)'
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
        text: 'État des audits',
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
    this.fetchAuditStats();
  }

  fetchAuditStats() {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('Token not found');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // fetch the audit stats
    this.http.get<AuditStats>('https://localhost:7299/api/Auditor/audit-stats', { headers })
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.updateCharts();
          
          //  fetch the audit dates
          this.http.get<{ planDate: string }[]>('https://localhost:7299/api/Auditor/audits', { headers })
            .subscribe({
              next: (audits) => {
                
                this.stats.dates = audits
                  .map(audit => {
              // date format 
                    const date = new Date(audit.planDate);
                    
                    const localDate = date.toLocaleDateString('en-CA'); //
                    return { planDate: localDate };
                  })
                  .sort((a, b) => new Date(a.planDate).getTime() - new Date(b.planDate).getTime());
                
                this.generateCalendar();
              },
              error: (error) => {
                console.error('Error fetching audit dates:', error);
              }
            });
        },
        error: (error) => {
          console.error('Error fetching audit stats:', error);
        }
      });
  }

  getCompletionRate(): number {
    if (this.stats.totalAudits === 0) return 0;
    return Math.round((this.stats.completedAudits / this.stats.totalAudits) * 100);
  }

  private updateCharts(): void {
    // Update pie chart
    if (this.stats && this.pieChartData.datasets && this.pieChartData.datasets.length > 0) {
      this.pieChartData = {
        ...this.pieChartData,
        datasets: [{
          ...this.pieChartData.datasets[0],
          data: [
            this.stats.completedAudits,
            this.stats.inProgressAudits,
            this.stats.canceledAudits
          ]
        }]
      };
    }

    // Update progress chart 
    if (this.stats && this.radialChartData.datasets && this.radialChartData.datasets.length > 0) {
      const completionRate = this.getCompletionRate();
      const remaining = 100 - completionRate;

      this.radialChartData = {
        ...this.radialChartData,
        datasets: [{
          ...this.radialChartData.datasets[0],
          data: [completionRate, remaining]
        }]
      };
    }

    this.cdr.detectChanges();
  }

  generateCalendar() {
    const auditDatesMap = new Map<string, number>();
    this.stats.dates.forEach(d => {
      const date = d.planDate; 
      auditDatesMap.set(date, (auditDatesMap.get(date) || 0) + 1);
    });
    
    // Get the first day of the current month
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    // Get the last day of the current month
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    
    // Get the first day to display 
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Get the last day to display 
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    this.weeks = [];
    let currentWeek: WeekDay[] = [];
    
    // Generate the calendar data
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (currentWeek.length === 7) {
        this.weeks.push(currentWeek);
        currentWeek = [];
      }
      

      const dateString = currentDate.toLocaleDateString('en-CA');
      const auditCount = auditDatesMap.get(dateString) || 0;
      
      currentWeek.push({
        date: new Date(currentDate),
        hasAudit: auditCount > 0,
        isCurrentMonth: currentDate.getMonth() === this.currentMonth.getMonth(),
        auditCount: auditCount
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      this.weeks.push(currentWeek);
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { day: 'numeric' });
  }

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  getCurrentMonthName(): string {
    return this.currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

}
