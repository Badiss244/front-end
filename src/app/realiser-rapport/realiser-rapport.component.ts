import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';

interface Factory {
  id: string;
  name: string;
}

interface Score {
  critereId: string;
  name: string;
  score: number;
  sName: string;
}

interface AuditReport {
  description: string;
  idFactory: string;
  pictures: string[];
  scores: Score[];
}

interface Criteria {
  id: string;
  name: string;
  score: number;
}

interface Sx {
  sxId: string;
  nameEnglish: string;
  nameJaponaise: string;
  criteres: Criteria[];
}

@Component({
  selector: 'app-realiser-rapport',
  imports: [CommonModule, FormsModule],
  templateUrl: './realiser-rapport.component.html',
  styleUrl: './realiser-rapport.component.css'
})
export class RealiserRapportComponent implements OnInit {
  auditId: string = '';
  factoryId: string = '';
  factory: Factory | null = null;
  
  report: AuditReport = {
    description: '',
    idFactory: '',
    pictures: [],
    scores: []
  };

  sxList: Sx[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.auditId = params['auditId'];
      this.factoryId = params['factoryId'];
      console.log('Received query params:', { auditId: this.auditId, factoryId: this.factoryId });
      if (this.factoryId) {
        this.report.idFactory = this.factoryId;
        this.fetchFactoryDetails();
        this.fetchSxList();
      } else {
        this.errorMessage = 'ID de l\'usine manquant dans les paramètres.';
      }
    });
  }

  fetchFactoryDetails(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<Factory[]>('https://localhost:7299/api/Auditor/factories', { headers })
      .subscribe({
        next: (factories) => {
          this.factory = factories.find(f => f.id === this.factoryId) || null;
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la récupération des détails de l\'usine.';
        }
      });
  }

  fetchSxList(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<Sx[]>(`https://localhost:7299/api/Auditor/C-by-factory?factoryId=${this.factoryId}`, { headers })
      .subscribe({
        next: (sxList) => {
          console.log('SxList received:', sxList); 
          if (!sxList || sxList.length === 0) {
            this.errorMessage = 'Aucun critère trouvé.';
            return;
          }
          this.sxList = sxList;
          // Initialize scores array with all criteria
          this.report.scores = sxList.flatMap(sx => 
            sx.criteres.map(critere => ({
              critereId: critere.id,
              name: critere.name,
              score: 0,
              sName: sx.nameEnglish,
              sNameJaponaise: sx.nameJaponaise
            }))
          );
          console.log('Report scores initialized:', this.report.scores); 
        },
        error: (err) => {
          console.error('Error fetching criteria:', err); 
          this.errorMessage = 'Erreur lors de la récupération des critères. Détails: ' + 
            (err.error?.message || err.message || 'Erreur inconnue');
        }
      });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64String = e.target.result.split(',')[1]; // Remove data:image/png;base64,
          this.report.pictures.push(base64String);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  updateScore(critereId: string, value: number): void {
    if (value >= 1 && value <= 5) {
      const scoreIndex = this.report.scores.findIndex(s => s.critereId === critereId);
      if (scoreIndex !== -1) {
        this.report.scores[scoreIndex].score = value;
      }
    }
  }

  submitReport(): void {
    if (!this.report.idFactory) {
      this.errorMessage = 'ID de l\'usine manquant. Veuillez réessayer.';
      return;
    }

    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }
    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');

    this.report.idFactory = this.factoryId;

    this.http.post('https://localhost:7299/api/Auditor/rapport', this.report, { 
      headers,
      responseType: 'text'
    }).subscribe({
        next: () => {
          this.http.put(`https://localhost:7299/api/Auditor/completeAudit?id=${this.auditId}`, {}, { 
            headers,
            responseType: 'text'
          }).subscribe({
              next: () => {
                this.successMessage = 'Rapport soumis et audit complété avec succès!';
                setTimeout(() => {
                  this.router.navigate(['/auditor/audits']);
                }, 2000);
              },
              error: () => {
                this.errorMessage = 'Erreur lors de la complétion de l\'audit.';
              }
            });
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la soumission du rapport.';
        }
      });
  }

  onSubmit() {
    this.submitReport();
  }

  getButtonClass(critereId: string, score: number): string {
    const baseClass = 'px-4 py-2 rounded-full transform transition-all duration-300 hover:scale-110';
    const selectedScore = this.report.scores.find(s => s.critereId === critereId)?.score;
    return selectedScore === score 
      ? `${baseClass} bg-[#272343] text-white shadow-lg`
      : `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  }
}
