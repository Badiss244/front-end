import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

interface Task {
  id: string;
  name: string;
  isDone: boolean;
  pictures?: string[];
  commantaire?: string;
}

interface PlanAction {
  id: string;
  name: string;
  taches: Task[];
  isDone?: boolean;
}

@Component({
  selector: 'app-plan-action-factory',
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-action-factory.component.html',
  styleUrl: './plan-action-factory.component.css'
})
export class PlanActionFactoryComponent implements OnInit {
  planActions: PlanAction[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  private baseUrl = 'https://localhost:7299/api/Factory';
  selectedTaskId: string | null = null;
  uploadedPictures: string[] = [];
  taskComment: string = '';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.loadPlanActions();
  }

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('jwt_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadPlanActions(): void {
    this.http.get<PlanAction[]>(`${this.baseUrl}/planActions`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.planActions = data.map(plan => ({
            ...plan,
            isDone: plan.isDone || false
          }));
        },
        error: () => {
          this.errorMessage = 'Erreur lors du chargement des plans d\'action';
        }
      });
  }

  completeTask(taskId: string, pictures: string[] = [], commantaire: string = ''): void {
    // Find the task to get its name
    let taskName = '';
    this.planActions.forEach(plan => {
      const task = plan.taches.find(t => t.id === taskId);
      if (task) {
        taskName = task.name;
      }
    });

    // First call to update task details
    const updateBody = {
      name: taskName,
      pictures: pictures,
      commantaire: commantaire
    };

    this.http.put(`${this.baseUrl}/tache/${taskId}`, updateBody, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    })
      .subscribe({
        next: () => {
          // Second call to mark task as complete
          this.http.put(`${this.baseUrl}/completeTache?id=${taskId}`, null, { 
            headers: this.getHeaders(),
            responseType: 'text' as 'json'
          })
            .subscribe({
              next: () => {
                // Find and update the task in the existing plans
                this.planActions.forEach(plan => {
                  const task = plan.taches.find(t => t.id === taskId);
                  if (task) {
                    task.isDone = true;
                    task.pictures = pictures;
                    task.commantaire = commantaire;
                  }
                });
                
                this.successMessage = 'Tâche marquée comme terminée';
                setTimeout(() => this.successMessage = '', 3000);
              },
              error: (error) => {
                console.error('Error completing task:', error);
                if (error.status === 200) {
                  // Find and update the task in the existing plans
                  this.planActions.forEach(plan => {
                    const task = plan.taches.find(t => t.id === taskId);
                    if (task) {
                      task.isDone = true;
                      task.pictures = pictures;
                      task.commantaire = commantaire;
                    }
                  });
                  
                  this.successMessage = 'Tâche marquée comme terminée';
                  setTimeout(() => this.successMessage = '', 3000);
                  return;
                }
                
                if (error.status === 401) {
                  this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                } else if (error.status === 404) {
                  this.errorMessage = 'Tâche non trouvée. Veuillez rafraîchir la page.';
                } else if (error.status === 400) {
                  this.errorMessage = 'Données invalides. Veuillez réessayer.';
                } else {
                  this.errorMessage = `Erreur lors de la mise à jour de la tâche: ${error.message || 'Erreur inconnue'}`;
                }
                setTimeout(() => this.errorMessage = '', 5000);
              }
            });
        },
        error: (error) => {
          console.error('Error updating task details:', error);
          this.errorMessage = 'Erreur lors de la mise à jour des détails de la tâche';
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
  }

  checkAndCompletePlan(plan: PlanAction): void {
    const allTasksCompleted = plan.taches.every(task => task.isDone);
    if (allTasksCompleted) {
      this.http.put(`${this.baseUrl}/completePlanAction?id=${plan.id}`, null, { 
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      })
        .subscribe({
          next: () => {
            this.successMessage = 'Plan d\'action terminé avec succès!';
            setTimeout(() => this.successMessage = '', 3000);
            const index = this.planActions.findIndex(p => p.id === plan.id);
            if (index !== -1) {
              this.planActions[index] = { ...plan, isDone: true };
            }
          },
          error: (error) => {
            if (error.status === 200) {
              this.successMessage = 'Plan d\'action terminé avec succès!';
              setTimeout(() => this.successMessage = '', 3000);
              const index = this.planActions.findIndex(p => p.id === plan.id);
              if (index !== -1) {
                this.planActions[index] = { ...plan, isDone: true };
              }
              return;
            }
            
            if (error.status === 401) {
              this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            } else if (error.status === 404) {
              this.errorMessage = 'Plan d\'action non trouvé. Veuillez rafraîchir la page.';
            } else if (error.status === 400) {
              this.errorMessage = 'Données invalides. Veuillez réessayer.';
            } else {
              this.errorMessage = `Erreur lors de la finalisation du plan d\'action: ${error.message || 'Erreur inconnue'}`;
            }
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
    }
  }

  getCompletionPercentage(plan: PlanAction): number {
    if (!plan.taches.length) return 0;
    const completedTasks = plan.taches.filter(task => task.isDone).length;
    return Math.round((completedTasks / plan.taches.length) * 100);
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64String = e.target.result.split(',')[1]; // Remove data:image/png;base64,
          this.uploadedPictures.push(base64String);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  openModal(taskId: string): void {
    this.selectedTaskId = taskId;
    this.uploadedPictures = [];
    this.taskComment = '';
  }

  closeModal(): void {
    this.selectedTaskId = null;
    this.uploadedPictures = [];
    this.taskComment = '';
  }

  completeTaskWithDetails(taskId: string): void {
    this.completeTask(taskId, this.uploadedPictures, this.taskComment);
    this.closeModal();
  }
}
