import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';


interface Audit {
  idAudit: string;
  createdAt: string;
  planDate: string;
  status: string;
  filiale: string;
  factory: string;
}

@Component({
  selector: 'app-history-audit',
  imports: [CommonModule],
  templateUrl: './history-audit.component.html',
  styleUrl: './history-audit.component.css'
})
export class HistoryAuditComponent implements OnInit {
  
  audits: Audit[] = [];
  errorMessage: string = '';
  loading: boolean = true;


  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.fetchAuditHistory();
  }

  fetchAuditHistory(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<Audit[]>('https://localhost:7299/api/Auditor/Historique_audits', { headers })
      .subscribe({
        next: (data) => {
          this.audits = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('erreur historique d\'audit', err);
          this.errorMessage = 'Erreur lors de la récupération de l\'historique des audits. Veuillez réessayer.';
          this.loading = false;
        }
      });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  
}
