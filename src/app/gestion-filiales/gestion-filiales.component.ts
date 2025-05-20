import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-gestion-filiales',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-filiales.component.html',
  styleUrl: './gestion-filiales.component.css'
})
export class GestionFilialesComponent implements OnInit {
  filiales: any[] = [];
  searchTerm: string = '';
  errorMessage: string = '';
  message: string = '';
  loading: boolean = true;
  
  // Add new properties for create functionality
  showCreateForm: boolean = false;
  newFilialeName: string = '';
  usersListTemplate: any;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.fetchFiliales();
  }

  fetchFiliales(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<any[]>('https://localhost:7299/api/Admin/filiales', { headers })
      .subscribe({
        next: (data) => {
          this.filiales = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur détaillée lors de la récupération des filiales:', err);
          this.errorMessage = 'Erreur lors de la récupération des filiales. Veuillez réessayer.';
          this.loading = false;
        }
      });
  }

  filteredFiliales(): any[] {
    if (!this.searchTerm) return this.filiales;
    return this.filiales.filter(filiale =>
      filiale.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Edit functionality
  startEdit(filiale: any): void {
    filiale.isEditing = true;
    filiale.newName = filiale.name;
    this.message = '';
    this.errorMessage = '';
  }

  saveEdit(filiale: any): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');

    const filialeId = filiale.subsidiaryId || filiale.id;
    if (!filialeId) {
      this.errorMessage = 'ID de la filiale non trouvé.';
      return;
    }

    const payload = {
      id: filialeId,
      name: filiale.newName,
      subsidiaryId: filialeId  
    };



    
    this.http.put(`https://localhost:7299/api/Admin/filiale/${filialeId}`, payload, { 
      headers,
      responseType: 'text' as 'json' 
    })
      .subscribe({
        next: (response) => {
          filiale.name = filiale.newName;
          filiale.isEditing = false;
          this.message = 'Filiale modifiée avec succès.';
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Erreur détaillée lors de la modification de la filiale:', err);
          if (err.error && typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'Erreur lors de la modification de la filiale. Veuillez réessayer.';
          }
        }
      });
  }

  cancelEdit(filiale: any): void {
    filiale.isEditing = false;
    filiale.newName = filiale.name;
  }

  deleteFiliale(filiale: any): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);

    const filialeId = filiale.subsidiaryId || filiale.id;
    if (!filialeId) {
      this.errorMessage = 'ID de la filiale non trouvé.';
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette filiale ?')) {
      return;
    }

    this.http.delete(`https://localhost:7299/api/Admin/filiale/${filialeId}`, { 
      headers,
      responseType: 'text' as 'json'
    })
      .subscribe({
        next: () => {
          // Remove the filiale from the local array
          this.filiales = this.filiales.filter(f => (f.subsidiaryId || f.id) !== filialeId);
          this.message = 'Filiale supprimée avec succès.';
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Erreur détaillée lors de la suppression de la filiale:', err);
          if (err.error && typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'Erreur lors de la suppression de la filiale. Veuillez réessayer.';
          }
        }
      });
  }

  // Create filiale methods
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      // Reset form
      this.newFilialeName = '';
    }
    this.errorMessage = '';
    this.message = '';
  }

  createFiliale(): void {
    if (!this.newFilialeName.trim()) {
      this.errorMessage = 'Le nom de la filiale est requis.';
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
      name: this.newFilialeName.trim()
    };

    this.http.post('https://localhost:7299/api/Admin/filiale', payload, {
      headers,
      responseType: 'text' as 'json'
    }).subscribe({
      next: (response) => {
        this.message = 'Filiale créée avec succès.';
        this.errorMessage = '';
        this.toggleCreateForm();
        this.fetchFiliales(); // Refresh the list
      },
      error: (err) => {
        console.error('Erreur détaillée lors de la création de la filiale:', err);
        if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Erreur lors de la création de la filiale. Veuillez réessayer.';
        }
      }
    });
  }
}
