import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';
import { GetNotificationComponent } from '../get-notification/get-notification.component';
import { ChatBotTestingComponent } from '../chat-bot-testing/chat-bot-testing.component';

@Component({
  selector: 'app-auditor',
  imports: [RouterLink, CommonModule, RouterOutlet, GetNotificationComponent, ChatBotTestingComponent],
  templateUrl: './auditor.component.html',
  styleUrl: './auditor.component.css'
})
export class AuditorComponent implements OnInit {
  dropdownOpen: boolean = false;
  auditorProfileImage: string = '';
  auditorName: string = '';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('Erreur token');
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    // Fetch the auditor's profile picture
    this.http.get('https://localhost:7299/api/Account/get-picture', {
      headers,
      responseType: 'text'
    }).subscribe({
      next: (res: string) => {
        this.auditorProfileImage = res;
      },
      error: (err) => {
        console.error('Erreur image', err);
      }
    });

    // Fetch the auditor profile data
    this.http.get<any>('https://localhost:7299/api/Account/profile', { headers })
      .subscribe({
        next: (data) => {
          this.auditorName = data.username;
        },
        error: (err) => {
          console.error('Erreur profile', err);
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
