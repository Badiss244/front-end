import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

interface Usine {
  id: string;
  name: string;
  address: string;
  filialeName: string;
  filialeId?: string;
}

export interface Filiale {
  id: string;
  name: string;
}

@Component({
  selector: 'app-gestion-usines',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usines.component.html',
  styleUrl: './gestion-usines.component.css'
})
export class GestionUsinesComponent implements OnInit {
  usines: Usine[] = [];
  searchTerm: string = '';
  message: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  showCreateForm: boolean = false;
  showEditForm: boolean = false;
  filiales: Filiale[] = [];
  loading: boolean = true;
  newUsine = {
    name: '',
    address: '',
    filialeId: ''
  };
  editingUsine: Usine | null = null;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.fetchUsines();
    this.fetchFiliales();
  }

  fetchUsines(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<Usine[]>('https://localhost:7299/api/Admin/factories', { headers })
      .subscribe({
        next: (data) => {
          this.usines = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur détaillée lors de la récupération des usines:', err);
          this.errorMessage = 'Erreur lors de la récupération des usines. Veuillez réessayer.';
          this.loading = false;
        }
      });
  }

  fetchFiliales() {
    const token = this.cookieService.get('jwt_token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer '+ token);

    this.http.get<Filiale[]>('https://localhost:7299/api/Admin/filiales', { headers })
      .subscribe({
        next: (data) => {
          this.filiales = data;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des filiales:', error);
          this.errorMessage = 'Erreur lors de la récupération des filiales.';
        }
      });
  }

  filteredUsines(): Usine[] {
    if (!this.searchTerm) return this.usines;
    return this.usines.filter(usine =>
      usine.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      usine.filialeName?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      // Reset form
      this.newUsine = {
        name: '',
        address: '',
        filialeId: ''
      };
    }
    this.errorMessage = '';
    this.message = '';
    this.successMessage = '';
  }

  modifierUsine(usine: Usine): void {
    this.editingUsine = { ...usine };
    this.fetchFiliales(); 
    this.showEditForm = true;
    this.showCreateForm = false;
  }

  updateUsine(): void {
    if (!this.editingUsine) {
      this.errorMessage = 'Aucune usine sélectionnée pour la modification.';
      return;
    }

    if (!this.editingUsine.name || !this.editingUsine.address || !this.editingUsine.filialeId) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    const token = this.cookieService.get('jwt_token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer '+token);

    const payload = {
      id: this.editingUsine.id,
      name: this.editingUsine.name,
      address: this.editingUsine.address,
      filialeId: this.editingUsine.filialeId
    };

    this.http.put('https://localhost:7299/api/Admin/factory/' + this.editingUsine.id, payload, { headers })
      .subscribe({
        next: () => {
          this.successMessage = 'Usine modifiée avec succès!';
          this.fetchUsines(); 
          this.showEditForm = false;
          this.editingUsine = null;
          this.errorMessage = '';
          
         
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors de la modification de l\'usine:', err);
          this.errorMessage = 'Erreur lors de la modification de l\'usine. Veuillez réessayer.';
          this.successMessage = '';
        }
      });
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editingUsine = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  supprimerUsine(usine: Usine): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette usine ?')) {
      return;
    }

    this.http.delete(`https://localhost:7299/api/Admin/factory/${usine.id}`, { 
      headers,
      responseType: 'text' as 'json'
    })
      .subscribe({
        next: (response) => {
          this.usines = this.usines.filter(u => u.id !== usine.id);
          this.successMessage = 'Usine supprimée avec succès';
          this.errorMessage = '';
         
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur détaillée lors de la suppression de l\'usine:', err);
          if (err.error && typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'Erreur lors de la suppression de l\'usine. Veuillez réessayer.';
          }
          this.successMessage = '';
        }
      });
  }

  createUsine() {
    if (!this.newUsine.name || !this.newUsine.address || !this.newUsine.filialeId) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    const token = this.cookieService.get('jwt_token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer '+token);

    this.http.post('https://localhost:7299/api/Admin/factory', this.newUsine, { headers })
      .subscribe({
        next: () => {
          this.message = 'Usine créée avec succès!';
          this.fetchUsines(); // Refresh the list
          this.toggleCreateForm(); // Close the form
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Erreur lors de la création de l\'usine:', error);
          this.errorMessage = 'Erreur lors de la création de l\'usine.';
        }
      });
  }
}
