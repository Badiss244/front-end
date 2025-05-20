import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';
import { GetNotificationComponent } from '../get-notification/get-notification.component';
import { ChatBotTestingComponent } from '../chat-bot-testing/chat-bot-testing.component';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, CommonModule, RouterOutlet, GetNotificationComponent, ChatBotTestingComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  dropdownOpen: boolean = false;
  adminProfileImage: string = ''; 
  adminName: string = ''; 
  adminRole: string = '';
  loading: boolean = true;
  maintenanceMode: boolean = false;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('erreur token');
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    // fetch dmin profile pic 
    this.http.get('https://localhost:7299/api/Account/get-picture', {
      headers,
      responseType: 'text'
    }).subscribe({
      next: (res: string) => {
        this.adminProfileImage = res;
      },
      error: (err) => {
        console.error('erreur admin photo', err);
      }
    });

    // 2) Fetch the admin profile data 
    this.http.get<any>('https://localhost:7299/api/Account/profile', { headers })
      .subscribe({
        next: (data) => {
          this.adminName = data.username;
          this.adminRole = data.role;
        },
        error: (err) => {
          console.error('profil erreur', err);
        }
      });

      this.http.get<any>('https://localhost:7299/api/Account/ismaintenance', { headers })
      .subscribe({
        next: (response) => {
          this.maintenanceMode = response.isMaintenance;
        },
        error: (err) => {
          console.error('maintenance mode error', err);
        }
      });
   
  }

  toggleMaintenanceMode(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) return;
    
    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');
    const newMaintenanceState = !this.maintenanceMode;
    
    this.http.put('https://localhost:7299/api/Admin/maintenance', 
      { 
        maintenance: newMaintenanceState
      },
      { headers }
    ).subscribe({
      next: () => {
        this.maintenanceMode = newMaintenanceState;
      },
      error: (err) => {
        console.error('Erreur', err);
      }
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    
    this.cookieService.delete('jwt_token');
    
    
    this.authService.logout();
    
    
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.gear-dropdown') && !target.closest('button')) {
      this.dropdownOpen = false;
    }
  }
}
