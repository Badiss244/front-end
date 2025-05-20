import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';
import { GetNotificationComponent } from '../get-notification/get-notification.component';
import { ChatBotTestingComponent } from "../chat-bot-testing/chat-bot-testing.component";

@Component({
  selector: 'app-quality-manager',
  imports: [RouterLink, CommonModule, RouterOutlet, GetNotificationComponent, ChatBotTestingComponent],
  templateUrl: './quality-manager.component.html',
  styleUrl: './quality-manager.component.css'
})
export class QualityManagerComponent implements OnInit {
  dropdownOpen: boolean = false;
  qualityManagerProfileImage: string = '';
  qualityManagerName: string = '';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('Token introuvable');
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    
    this.http.get('https://localhost:7299/api/Account/get-picture', {
      headers,
      responseType: 'text'
    }).subscribe({
      next: (res: string) => {
        this.qualityManagerProfileImage = res;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de la  photo', err);
      }
    });

    
    this.http.get<any>('https://localhost:7299/api/Account/profile', { headers })
      .subscribe({
        next: (data) => {
          this.qualityManagerName = data.username;
        },
        error: (err) => {
          console.error('erreur lors de la récupération des données du responsable qualité', err);
        }
      });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    // Delete the JWT token from cookies
    this.cookieService.delete('jwt_token');
    
    // Update authentication state
    this.authService.logout();
    
    // Navigate back to the home page
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
