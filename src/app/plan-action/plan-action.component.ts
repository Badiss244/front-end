import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

interface Factory {
  id: string;
  name: string;
  address : string ;
}

interface Report {
  id: string;
  name: string;
  createdDate: string;
  factory: string;
}

interface Task {
  id: string;
  name: string;
  nameS: string | null;
  isDone: boolean;
  pictures: string[];
  commantaire: string;
}

interface PlanActionResponse {
  id: string;
  name: string;
  taches: Task[];
}

interface PlanAction {
  id: string;
  name: string;
  factory: string;
  isDone: boolean;
  taches: Task[];
}

interface SDefinition {
  id: string;
  nameEnglish: string;
  nameJaponaise: string;
}

@Component({
  selector: 'app-plan-action',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-action.component.html',
  styleUrl: './plan-action.component.css'
})
export class PlanActionComponent implements OnInit {
  factories: Factory[] = [];
  reports: Report[] = [];
  planActions: PlanAction[] = [];
  sDefinitions: SDefinition[] = [];
  selectedFactoryId: string = '';
  selectedReportId: string = '';
  selectedSId: string = '';  // For new plan creation only
  planSSelections: { [planId: string]: string } = {};  // For existing plans
  planName: string = '';
  tasks: Task[] = [];
  loading: boolean = true;
  newTaskName: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  showCreateForm: boolean = false;
  editingPlanId: string | null = null;
  editingTaskId: string | null = null;
  selectedImage: string | null = null;
  private baseUrl = 'https://localhost:7299/api/Quality';
  groupedTasks: { [planId: string]: { [key: string]: Task[] } } = {};

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.loadPlanActions();
    this.fetchFactories();
    this.fetchSDefinitions();
  }

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('jwt_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000); // 5 seconds timeout for all error messages
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000); // 3 seconds timeout for success messages
  }

  loadPlanActions(): void {
    this.http.get<PlanAction[]>(`${this.baseUrl}/planActions`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          console.log('Plan Actions Data:', data);
          this.planActions = data;
          this.loading = false;
          this.updateGroupedTasks();
          
          // Log each plan's tasks to check for pictures and comments
          this.planActions.forEach(plan => {
            console.log(`Plan: ${plan.name}`);
            plan.taches.forEach(task => {
              console.log(`Task: ${task.name}`);
              console.log('Task Pictures:', task.pictures);
              console.log('Task Comment:', task.commantaire);
            });
          });
        },
        error: (error) => {
          console.error('Error loading plan actions:', error);
          this.showError('Erreur lors du chargement des plans d\'action');
          this.loading = false;
        }
      });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.planName = '';
    this.selectedFactoryId = '';
    this.selectedReportId = '';
    this.selectedSId = '';
    this.tasks = [];
    this.newTaskName = '';
  }

  fetchFactories(): void {
    this.http.get<Factory[]>(`${this.baseUrl}/factories`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.factories = data;
        },
        error: (err) => {
          if (err.status === 401) {
            this.showError('Session expirée. Veuillez vous reconnecter.');
          } else {
            this.showError('Erreur lors du chargement des usines');
          }
        }
      });
  }

  fetchReports(factoryId?: string): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.showError('Token non trouvé. Veuillez vous connecter.');
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    const selectedFactory = this.factories.find(f => f.id === factoryId);
    if (!selectedFactory) {
      this.reports = [];
      return;
    }

    // Combine name and address to match the report's factory field
    const factoryFullName = `${selectedFactory.name} | ${selectedFactory.address}`;

    this.http.get<Report[]>(`${this.baseUrl}/rapports`, { headers })
      .subscribe({
        next: (data) => {
          console.log('Factory Full Name:', factoryFullName);
          data.forEach(report => {
            console.log('Report Factory:', report.factory);
          });
          this.reports = data.filter(
            report =>
              report.factory &&
              factoryFullName &&
              report.factory.trim().toLowerCase() === factoryFullName.trim().toLowerCase()
          );
          this.errorMessage = ''; 
          if (this.reports.length === 0) {
            this.showError('Aucun rapport trouvé pour cette usine.');
          }
        },
        error: (err) => {
          console.error('Error fetching reports:', err);
          if (err.status === 401) {
            this.showError('Session expirée. Veuillez vous reconnecter.');
          } else {
            this.showError('Erreur lors du chargement des rapports. Veuillez réessayer.');
          }
          this.reports = []; 
        }
      });
  }

  onFactoryChange(): void {
    this.selectedReportId = ''; 
    this.fetchReports(this.selectedFactoryId);
  }

  addTask(): void {
    const trimmedTaskName = this.newTaskName.trim();
    if (!trimmedTaskName) {
      this.showError('Le nom de la tâche ne peut pas être vide');
      return;
    }
    if (!this.selectedSId) {
      this.showError('Veuillez sélectionner une définition S pour la tâche');
      return;
    }
    
    const selectedS = this.sDefinitions.find(s => s.id === this.selectedSId);
    if (!selectedS) {
      this.showError('Définition S sélectionnée non trouvée');
      return;
    }

    const combinedSName = `${selectedS.nameEnglish} (${selectedS.nameJaponaise})`;
    
    const newTask: Task = {
      id: '',
      name: trimmedTaskName,
      isDone: false,
      nameS: combinedSName,
      pictures: [],
      commantaire: ''
    };
    
    this.tasks.push(newTask);
    this.newTaskName = '';
    this.selectedSId = '';
    this.errorMessage = '';
  }

  removeTask(index: number): void {
    this.tasks.splice(index, 1);
  }

  createPlanAction(): void {
    if (!this.planName?.trim()) {
      this.showError('Le nom du plan est requis');
      return;
    }
    if (!this.selectedFactoryId) {
      this.showError('Veuillez sélectionner une usine');
      return;
    }
    if (!this.selectedReportId) {
      this.showError('Veuillez sélectionner un rapport');
      return;
    }
    if (this.tasks.length === 0) {
      this.showError('Veuillez ajouter au moins une tâche');
      return;
    }
    
    const dto = {
      name: this.planName.trim(),
      idFactory: this.selectedFactoryId,
      idRapport: this.selectedReportId,
      taches: this.tasks.map(task => ({
        name: task.name.trim(),
        nameS: task.nameS
      }))
    };

    this.http.post(
      `${this.baseUrl}/planAction`,
      dto,
      {
        headers: this.getHeaders()
      }
    ).subscribe({
      next: (response) => {
        this.showSuccess('Plan d\'action créé avec succès!');
        this.loadPlanActions();
        this.resetForm();
        this.showCreateForm = false;
      },
      error: (err) => {
        if (err.status === 400) {
          if (err.error && err.error.title) {
            this.showError(`Erreur: ${err.error.title}`);
          } else {
            this.showError('Données invalides. Vérifiez les informations saisies.');
          }
        } else if (err.status === 401) {
          this.showError('Session expirée. Veuillez vous reconnecter.');
        } else {
          this.showError('Erreur lors de la création du plan d\'action');
        }
      }
    });
  }

  deletePlanAction(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plan d\'action ?')) {
      const planToDelete = this.planActions.find(p => p.id === id);
      if (!planToDelete) {
        this.showError('Plan d\'action introuvable dans la liste locale');
        return;
      }

      const url = `${this.baseUrl}/planAction/(${planToDelete.id})`;
      const token = this.cookieService.get('jwt_token');
      if (!token) {
        this.showError('Token d\'authentification non trouvé');
        return;
      }

      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`);
      
      this.http.delete(url, { headers })
        .subscribe({
          next: () => {
            this.planActions = this.planActions.filter(plan => plan.id !== planToDelete.id);
            this.showSuccess('Plan d\'action supprimé avec succès');
            this.loadPlanActions();
          },
          error: (error) => {
             if (error.status === 404) {
              this.showError('Impossible de trouver le plan d\'action sur le serveur.');
              this.planActions = this.planActions.filter(plan => plan.id !== planToDelete.id);
            } else {
              this.showError('Erreur lors de la suppression du plan d\'action');
            }
          }
        });
    }
  }

  startEditPlan(plan: PlanAction): void {
    this.editingPlanId = plan.id;
  }

  updatePlanName(plan: PlanAction, newName: string): void {
    const payload = { id: plan.id, name: newName };
    this.http.put(`${this.baseUrl}/planAction/name/${plan.id}`, payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          plan.name = newName;
          this.editingPlanId = null;
          this.showSuccess('Nom du plan d\'action mis à jour avec succès');
        },
        error: () => {
          this.showError('Erreur lors de la mise à jour du nom du plan d\'action');
        }
      });
  }

  deleteTask(taskId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.http.delete(`${this.baseUrl}/tache/${taskId}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.planActions.forEach(plan => {
              plan.taches = plan.taches.filter(task => task.id !== taskId);
            });
            this.updateGroupedTasks();
            this.showSuccess('Tâche supprimée avec succès');
          },
          error: () => {
            this.showError('Erreur lors de la suppression de la tâche');
          }
        });
    }
  }

  startEditTask(task: Task): void {
    this.editingTaskId = task.id;
  }

  updateTask(task: Task, newName: string): void {
    const payload = { 
      id: task.id, 
      name: newName
    };
    this.http.put(`${this.baseUrl}/tache/${task.id}`, payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          task.name = newName;
          this.editingTaskId = null;
          this.updateGroupedTasks();
          this.showSuccess('Tâche mise à jour avec succès');
        },
        error: () => {
          this.showError('Erreur lors de la mise à jour de la tâche');
        }
      });
  }

  addTaskToPlan(planId: string, taskName: string): void {
    const trimmedTaskName = taskName.trim();
    if (!trimmedTaskName) {
      this.showError('Le nom de la tâche ne peut pas être vide');
      return;
    }

    const selectedSId = this.planSSelections[planId];
    if (!selectedSId) {
      this.showError('Veuillez sélectionner une définition S pour la tâche');
      return;
    }

    const selectedS = this.sDefinitions.find(s => s.id === selectedSId);
    if (!selectedS) {
      this.showError('Définition S sélectionnée non trouvée');
      return;
    }

    const combinedSName = `${selectedS.nameEnglish} (${selectedS.nameJaponaise})`;

    const payload = { 
      idPlanAction: planId, 
      name: trimmedTaskName,
      nameS: combinedSName
    };

    this.http.post(`${this.baseUrl}/planAction/NTache`, payload, { headers: this.getHeaders() })
      .subscribe({
        next: (response: any) => {
          const plan = this.planActions.find(p => p.id === planId);
          if (plan) {
            plan.taches.push({
              id: response.id,
              name: trimmedTaskName,
              isDone: false,
              nameS: combinedSName,
              pictures: [],
              commantaire: ''
            });
            this.updateGroupedTasks();
          }
          this.showSuccess('Tâche ajoutée avec succès');
          delete this.planSSelections[planId]; // Reset the S selection for this plan
        },
        error: () => {
          this.showError('Erreur lors de l\'ajout de la tâche');
        }
      });
  }

  // Method to get the selected S for a specific plan
  getSelectedS(planId: string): string {
    return this.planSSelections[planId] || '';
  }

  // Method to set the selected S for a specific plan
  setSelectedS(planId: string, sId: string): void {
    this.planSSelections[planId] = sId;
  }

  fetchSDefinitions(): void {
    this.http.get<SDefinition[]>(`${this.baseUrl}/sdefinitions`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.sDefinitions = data;
        },
        error: (err) => {
          if (err.status === 401) {
            this.showError('Session expirée. Veuillez vous reconnecter.');
          } else {
            this.showError('Erreur lors du chargement des définitions S');
          }
        }
      });
  }

  openImageModal(image: string): void {
    this.selectedImage = image;
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }

  updateGroupedTasks() {
    this.groupedTasks = {};
    this.planActions.forEach(plan => {
      const grouped: { [key: string]: Task[] } = {};
      plan.taches.forEach(task => {
        const sName = task.nameS || 'Non classé';
        if (!grouped[sName]) grouped[sName] = [];
        grouped[sName].push(task);
      });
      this.groupedTasks[plan.id] = grouped;
    });
  }
}
