import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ChatBotTestingComponent } from "../chat-bot-testing/chat-bot-testing.component";

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChatBotTestingComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  
  roleDes: string = '';
  type: string = 'info';
  message: string = '';
  
  
  successMessage: string = '';
  errorMessage: string = '';
  isUserDropdownOpen: boolean = false;
  
  // les roles
  roles: string[] = ['Tous', 'Administrateur', 'Responsable Qualité', 'Auditeur', 'Responsable d\'usine'];
  
  // Role mapping for API
  private roleMapping: { [key: string]: string } = {
    'Administrateur': 'Admin',
    'Responsable Qualité': 'QualityM',
    'Auditeur': 'Auditor',
    'Responsable d\'usine': 'FactoryM'
  };
  
  // Notification types
  types: string[] = ['info', 'alerte'];

  // Available users
  users: any[] = [];
  filteredUsers: any[] = [];
  selectedUserNames: string[] = [];

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router, 
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.isUserDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  fetchUsers(): void {
    const token = this.cookieService.get('jwt_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get('https://localhost:7299/api/Account/users', { headers })
      .subscribe({
        next: (response: any) => {
          this.users = response;
          this.filterUsersByRole();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la récupération des utilisateurs';
        }
      });
  }

  onRoleChange(): void {
    this.filterUsersByRole();
    // Clear selected users that are no longer in the filtered list
    this.selectedUserNames = this.selectedUserNames.filter(username => 
      this.filteredUsers.some(user => user.username === username)
    );
    this.cdr.detectChanges();
  }

  filterUsersByRole(): void {
    if (!this.roleDes || this.roleDes === 'Tous') {
      this.filteredUsers = [...this.users];
    } else {
      const apiRole = this.roleMapping[this.roleDes];
      this.filteredUsers = this.users.filter(user => user.role === apiRole);
    }
  }

  toggleAllUsers(event: any): void {
    if (event.target.checked) {
      this.selectedUserNames = this.filteredUsers.map(user => user.username);
    } else {
      this.selectedUserNames = [];
    }
    this.cdr.detectChanges();
  }

  toggleUser(username: string): void {
    const index = this.selectedUserNames.indexOf(username);
    if (index === -1) {
      this.selectedUserNames.push(username);
    } else {
      this.selectedUserNames.splice(index, 1);
    }
    this.cdr.detectChanges();
  }

  isUserSelected(username: string): boolean {
    return this.selectedUserNames.includes(username);
  }

  resetForm(): void {
    this.roleDes = '';
    this.selectedUserNames = [];
    this.type = 'info';
    this.message = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.filterUsersByRole();
    this.cdr.detectChanges();
  }

  sendNotification(): void {
    // Reset messages
    this.successMessage = '';
    this.errorMessage = '';

    // Validate form
    if (!this.message) {
      this.errorMessage = 'Le message est requis';
      return;
    }

    // Prepare payload
    const payload: any = {
      type: this.type,
      message: this.message
    };

    // Add optional fields if provided
    if (this.roleDes && this.roleDes !== 'Tous') {
      payload.roleDes = this.roleMapping[this.roleDes];
    }
    
    if (this.selectedUserNames.length > 0) {
      payload.usernames = this.selectedUserNames;
    }

    // Get token for authorization
    const token = this.cookieService.get('jwt_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Send notification
    this.http.post('https://localhost:7299/api/Account/CreateNotification', payload, { headers })
      .subscribe({
        next: (response) => {
          this.successMessage = 'Notification envoyée avec succès!';
          setTimeout(() => {
            this.resetForm();
          }, 1000);
        },
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors de l\'envoi de la notification. Veuillez réessayer.';
        }
      });
  }

  goback(): void {
    this.location.back();
  }
}