import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

interface Factory {
  id: string;
  name: string;
  address: string;
  filialeId: string;
  filialeName: string;
  managerFactory: string;
}

interface Audit {
  idAudit: string;
  createdAt: string;
  planDate: string;
  status: string;
  filiale: string;
  factory: string;
  fKfactory: string;
}

@Component({
  selector: 'app-audits',
  imports: [CommonModule, FormsModule],
  templateUrl: './audits.component.html',
  styleUrl: './audits.component.css'
})
export class AuditsComponent implements OnInit {
  factories: Factory[] = [];
  audits: Audit[] = [];
  selectedFactoryId: string = '';
  planDate: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  showCreateForm: boolean = false;
  loading: boolean = true;
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchFactories();
    this.fetchAudits();
  }

  fetchFactories(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<Factory[]>('https://localhost:7299/api/Auditor/factories', { headers })
      .subscribe({
        next: (data) => {
          this.factories = data;
        },
        error: (err) => {
          console.error('Error fetching factories:', err);
          this.errorMessage = 'Erreur lors de la récupération des usines. Veuillez réessayer.';
        }
      });
  }

  fetchAudits(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<Audit[]>('https://localhost:7299/api/Auditor/audits', { headers })
      .subscribe({
        next: (data) => {
          this.audits = data;
          this.loading=false; 
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la récupération des audits. Veuillez réessayer.';
          this.loading=false; 
        }
      });
  }

  createAudit(): void {
    if (!this.selectedFactoryId || !this.planDate) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
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

    const payload = {
      planDate: this.planDate,
      fKfactory: this.selectedFactoryId
    };

    this.http.post('https://localhost:7299/api/Auditor/createAudit', payload, { headers })
      .subscribe({
        next: () => {
          this.successMessage = 'Plan d\'audit créé avec succès!';
          this.errorMessage = '';
          // Reset form
          this.selectedFactoryId = '';
          this.planDate = '';
          this.showCreateForm = false;
          // Refresh audits list
          this.fetchAudits();
        },
        error: (err) => {
          console.error('Erreur lors de la création d\' un audit', err);
          this.errorMessage = 'Erreur lors de la création du plan d\'audit. Veuillez réessayer.';
          this.successMessage = '';
        }
      });
  }

  cancelAudit(auditId: string): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');

    this.http.put(`https://localhost:7299/api/Auditor/cancelAudit?id=${auditId}`, {}, { headers })
      .subscribe({
        next: () => {
          this.successMessage =  'Audit annulé avec succès!';
          this.errorMessage = '';
          // Refresh audits list
          this.fetchAudits();
        },
        error: (err) => {
          console.error('Erreur audit ', err);
          this.errorMessage = 'Erreur lors de l\'annulation de l\'audit. Veuillez réessayer.';
          this.successMessage = '';
        }
      });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      // Reset form when hiding
      this.selectedFactoryId = '';
      this.planDate = '';
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  createReport(auditId: string): void {
    const audit = this.audits.find(a => a.idAudit === auditId);
    if (!audit) {
      this.errorMessage = 'Audit non trouvé';
      return;
    }
    
    const token = this.cookieService.get('jwt_token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    
    this.http.get<Factory[]>('https://localhost:7299/api/Auditor/factories', { headers })
      .subscribe({
        next: (factories) => {
          console.log('Audit factory name:', audit.factory);
          const auditFactoryNames = (audit.factory || '').split('|').map(name => name.trim().toLowerCase());
          const normalizedFactoryNames = factories.map(f => f.name ? f.name.trim().toLowerCase() : '');
          console.log('Audit factory names (normalized):', auditFactoryNames);
          console.log('Available factories (normalized):', normalizedFactoryNames);
          const factory = factories.find(f => f.name && auditFactoryNames.includes(f.name.trim().toLowerCase()));
          if (factory) {
            this.router.navigate(['/auditor/realiser-rapport'], {
              queryParams: {
                auditId: auditId,
                factoryId: factory.id
              }
            });
          } else {
            this.errorMessage = 'Usine non trouvée';
          }
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la récupération des détails de l\'usine';
        }
      });
  }
  isPlanDateReached(audit: Audit): boolean {
    const planDate = new Date(audit.planDate);
    const today = new Date();
    return planDate <= today;
  }
}
