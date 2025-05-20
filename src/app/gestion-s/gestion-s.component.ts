import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';

interface Critere {
  idCritereDefinition: string;
  name: string;
  fKsxDefinition: string;
  sDefinition: any;
}

interface SDefinition {
  idSDefinition: string;
  nameEnglish: string;
  nameJaponaise?: string;
  critaires: Critere[];
}

@Component({
  selector: 'app-gestion-s',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-s.component.html'
})
export class GestionSComponent implements OnInit, OnDestroy {
  sDefinitions: SDefinition[] = [];
  loading: boolean = true;
  isSynchronizing: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  showAddFormForId: string | null = null;
  showAddSForm: boolean = false;
  private successMessageTimeout: any;

  // Form states
  newS: SDefinition = {
    idSDefinition: '',
    nameEnglish: '',
    nameJaponaise: '',
    critaires: []
  };

  newCritereName: string = '';
  editingS: SDefinition | null = null;
  editingCritere: Critere | null = null;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.loadSDefinitions();
  }

  ngOnDestroy(): void {
    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
    this.successMessageTimeout = setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('jwt_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadSDefinitions(): void {
    this.loading = true;
    this.http.get<SDefinition[]>('https://localhost:7299/api/Admin/S', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.sDefinitions = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading S definitions:', error);
        this.error = 'Erreur lors du chargement des principes S';
        this.loading = false;
      }
    });
  }

  addS(): void {
    if (!this.newS.nameEnglish || !this.newS.nameEnglish.trim()) {
      this.error = 'Le nom en français est obligatoire';
      setTimeout(() => {
        this.error = "";
      }, 800)
      return;
    }

    this.http.post<SDefinition>('https://localhost:7299/api/Admin/S', this.newS, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.sDefinitions.push(data);
        this.newS = { idSDefinition: '', nameEnglish: '', nameJaponaise: '', critaires: [] };
        this.error = null;
        setTimeout(() => {
          this.showAddSForm = false;
        }, 500); 
        this.showSuccessMessage('Principe S ajouté avec succès');
        this.loadSDefinitions();
      },
      error: (error) => {
        console.error('Error adding S definition:', error);
        this.error = 'Erreur lors de l\'ajout du principe S';
      }
    });
  }

  updateS(s: SDefinition): void {
    const payload = {
      id: s.idSDefinition,
      nameEnglish: s.nameEnglish,
      nameJaponaise: s.nameJaponaise
    };

    this.http.put(`https://localhost:7299/api/Admin/S/${s.idSDefinition}`, payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        const index = this.sDefinitions.findIndex(item => item.idSDefinition === s.idSDefinition);
        if (index !== -1) {
          this.sDefinitions[index] = s;
        }
        this.editingS = null;
        this.error = null;
        this.showSuccessMessage('Principe S modifié avec succès');
        this.loadSDefinitions();
      },
      error: (error) => {
        console.error('Error updating S definition:', error);
        this.error = 'Erreur lors de la modification du principe S';
      }
    });
  }

  deleteS(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce principe S ?')) {
      return;
    }

    this.http.delete(`https://localhost:7299/api/Admin/S/${id}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.sDefinitions = this.sDefinitions.filter(s => s.idSDefinition !== id);
        this.error = null;
        this.showSuccessMessage('Principe S supprimé avec succès');
      },
      error: (error) => {
        console.error('Error deleting S definition:', error);
        this.error = 'Erreur lors de la suppression du principe S';
      }
    });
  }

  addCritere(sDefinition: SDefinition): void {
    if (!this.newCritereName.trim()) return;
    
    const payload = {
      name: this.newCritereName.trim(),
      sDefinitionId: sDefinition.idSDefinition
    };

    console.log('Adding critere with payload:', payload);

    this.http.post<Critere>('https://localhost:7299/api/Admin/Critaire', payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Critere added successfully:', response);
        this.newCritereName = '';
        this.showAddFormForId = null;
        this.error = null;
        this.showSuccessMessage('Critère ajouté avec succès');
        this.loadSDefinitions();
      },
      error: (error) => {
        console.error('Error adding critere:', error);
        if (error.status === 404) {
          this.error = 'Point de terminaison API introuvable';
        } else if (error.status === 500) {
          this.error = 'Erreur serveur lors de l\'ajout du critère';
        } else if (error.status === 401) {
          this.error = 'Non autorisé. Veuillez vérifier votre authentification';
        } else {
          this.error = 'Erreur lors de l\'ajout du critère';
        }
      }
    });
  }

  updateCritere(critere: Critere | null): void {
    if (!critere) return;
    
    const payload = {
      id: critere.idCritereDefinition,
      name: critere.name,
      sxId: critere.fKsxDefinition
    };

    console.log('Updating critere with payload:', payload);

    this.http.put(`https://localhost:7299/api/Admin/Critaire/${critere.idCritereDefinition}`, payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Critere mis a jour:', response);
        this.editingCritere = null;
        this.error = null;
        this.showSuccessMessage('Critère modifié avec succès');
        this.loadSDefinitions();
      },
    });
  }

  deleteCritere(critere: Critere): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce critère ?')) {
      return;
    }

    this.http.delete(`https://localhost:7299/api/Admin/Critaire/${critere.idCritereDefinition}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.error = null;
        this.showSuccessMessage('Critère supprimé avec succès');
        this.loadSDefinitions();
      },
      error: (error) => {
        console.error('Error deleting critere:', error);
        this.error = 'Erreur lors de la suppression du critère';
      }
    });
  }

  startEditingS(s: SDefinition): void {
    this.editingS = { ...s };
  }

  cancelEditingS(): void {
    this.editingS = null;
  }

  startEditingCritere(critere: Critere): void {
    this.editingCritere = { ...critere };
  }

  cancelEditingCritere(): void {
    this.editingCritere = null;
  }

  toggleAddForm(sId: string): void {
    this.showAddFormForId = this.showAddFormForId === sId ? null : sId;
    this.newCritereName = '';
  }

  toggleAddSForm(): void {
    this.showAddSForm = !this.showAddSForm;
    if (!this.showAddSForm) {
      this.newS = {
        idSDefinition: '',
        nameEnglish: '',
        nameJaponaise: '',
        critaires: []
      };
    }
  }

  synchronizeData(): void {
    if (this.isSynchronizing) return;
    
    this.isSynchronizing = true;
    this.error = null;

    this.http.post('https://localhost:7299/api/Admin/synchronize-factories', {}, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.showSuccessMessage('Synchronisation réussie');
        this.loadSDefinitions(); // Refresh data after sync
        this.isSynchronizing = false;
      },
      error: (error) => {
        console.error('Error during synchronization:', error);
        this.error = 'Erreur lors de la synchronisation';
        this.isSynchronizing = false;
      }
    });
  }
}
