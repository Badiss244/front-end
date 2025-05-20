import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { jsPDF } from 'jspdf';
import { FormsModule } from '@angular/forms';

interface Score {
  critereId: string;
  name: string;
  score: number;
  sName: string;
}

interface Report {
  auditorName: string;
  id: string;
  createdDate: string;
  description: string;
  factory: string;
  pictures: string[];
  scores: Score[];
}

@Component({
  selector: 'app-rapport-factory',
  imports: [CommonModule, FormsModule],
  templateUrl: './rapport-factory.component.html',
  styleUrl: './rapport-factory.component.css'
})
export class RapportFactoryComponent implements OnInit {
  reports: Report[] = [];
  errorMessage: string = '';
  loading: boolean = true;
  selectedImage: string | null = null;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.fetchReports();
  }

  fetchReports(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Aucun jeton d\'authentification trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<Report[]>('https://localhost:7299/api/Factory/rapports', { headers })
      .subscribe({
        next: (data) => {
          this.reports = data;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.errorMessage = 'Échec de l\'authentification. Veuillez vous reconnecter.';
          } else if (error.status === 403) {
            this.errorMessage = 'Vous n\'avez pas la permission de consulter les rapports.';
          } else if (error.status === 404) {
            this.errorMessage = 'Endpoint des rapports introuvable.';
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = `Erreur lors de la récupération des rapports : ${error.statusText || 'Unknown error'}`;
          }
          this.loading = false;
        }
      });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  openImageModal(image: string): void {
    this.selectedImage = image;
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }

  getScoresByCategory(report: Report, categoryName: string): Score[] {
    return report.scores.filter(score => score.sName === categoryName);
  }

  getUniqueCategories(scores: Score[]): string[] {
    return [...new Set(scores.map(score => score.sName))];
  }

  exportToPDF(report: Report): void {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    // Add Poulina logo
    const img = new Image();
    img.src = 'poulina1.0.png';
    img.onload = () => {
      try {
  
        const logoHeight = 25;
        const aspectRatio = img.width / img.height;
        const logoWidth = logoHeight * aspectRatio;
        
        // Center the logo horizontally
        const logoX = (pageWidth - logoWidth) / 2;
        
        // Add logo 
        pdf.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);
        
        // Header with border
        pdf.setDrawColor(53, 41, 97);
        pdf.setLineWidth(0.5);
        pdf.line(margin, 45, pageWidth - margin, 45);
        
        // Title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(24);
        pdf.setTextColor(53, 41, 97);
        pdf.text(`Rapport d'Audit`, margin, 65);
        
        // Factory and Date info
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(0);
        pdf.text(`Usine: ${report.factory}`, margin, 80);
        pdf.text(`Date: ${this.formatDate(report.createdDate)}`, margin, 87);
        pdf.text(`Auditeur: ${report.auditorName}`, margin, 94);
        
        // Separator line
        pdf.line(margin, 100, pageWidth - margin, 100);
        
        // Description
        pdf.setTextColor(53, 41, 97);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text('Description', margin, 115);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(0);
        const splitDesc = pdf.splitTextToSize(report.description, contentWidth);
        pdf.text(splitDesc, margin, 125);
        
        // Results section
        const descHeight = splitDesc.length * 7;
        let currentY = Math.max(135, 105 + descHeight + 15);
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(53, 41, 97);
        pdf.text('Résultats', margin, currentY);
        currentY += 10;

        // Group scores by critère
        const criteres = this.getUniqueCategories(report.scores);
        
        for (const critere of criteres) {
            const critereScores = this.getScoresByCategory(report, critere);
            
           
            if (currentY > 250) {
                pdf.addPage();
                currentY = margin;
            }
            
            // Critère header
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.setTextColor(53, 41, 97);
            pdf.text(`${critere}`, margin, currentY);
            currentY += 10;
            
            // Scores
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(0);
            
            for (const score of critereScores) {
                pdf.text(score.name, margin + 5, currentY);
                pdf.text(`${score.score}/5`, pageWidth - margin - 20, currentY);
                currentY += 8;
            }
            currentY += 5;
        }

        // Photos section
        if (report.pictures && report.pictures.length > 0) {
            
            if (currentY + 100 > pdf.internal.pageSize.height - margin) {
                pdf.addPage();
                currentY = margin;
            }
            
            const photosStartY = currentY;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.setTextColor(53, 41, 97);
            pdf.text('Photos', margin, photosStartY);
            
            currentY = photosStartY + 10;
            const imageWidth = contentWidth;
            const imageHeight = 80;
            
            report.pictures.forEach((picture, index) => {
                if (currentY + imageHeight > pdf.internal.pageSize.height - margin) {
                    pdf.addPage();
                    currentY = margin;
                }
                
                try {
                    // Add image 
                    pdf.addImage(picture, 'JPEG', margin, currentY, imageWidth, imageHeight);
                    currentY += imageHeight + 10;
                    
                    // Add caption
                    pdf.setFont("helvetica", "italic");
                    pdf.setFontSize(10);
                    pdf.setTextColor(0);
                    pdf.text(`Photo ${index + 1}`, margin, currentY);
                    
                    currentY += 20;
                } catch (error) {
                    console.error('Error adding image:', error);
                }
            });
        }
        
        // Save the PDF
        pdf.save(`rapport_audit_${report.factory}_${this.formatDate(report.createdDate)}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    };
  }
}
