import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChatBotTestingComponent } from '../chat-bot-testing/chat-bot-testing.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink, ChatBotTestingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
 
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService
  ) {}

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('token erreur ', error);
      return null;
    }
  }
  

  onSubmit(): void {
    const payload = {
      username: this.username,
      password: this.password
    };


    this.http.post<any>('https://localhost:7299/api/Account/login', payload)
      .subscribe({
        next: (response) => {
          if (response && response.token) {
            this.cookieService.set('jwt_token', response.token, 1, '/');
            
            const decodedToken = this.decodeToken(response.token);
            console.log('Decoded token:', decodedToken);

            const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (!decodedToken || !role) {
              this.errorMessage = 'Erreur: Rôle utilisateur manquant dans le token';
              return;
            }

            this.authService.login(response.token);
            
            // Redirect based on role
            const userRole = role.toLowerCase();
            if (userRole === 'admin') {
              this.router.navigate(['/admin/admin-home']);
            } else if (userRole === 'auditor') {
              this.router.navigate(['/auditor/auditor-home']);
            } 
            else if (userRole=='qualitym') {
              this.router.navigate(['/quality-manager/quality-home']); }
            else if (userRole=='factorym') {
                this.router.navigate(['/factory-manager/factory-home']);
            }
          } else {
            this.errorMessage = 'Erreur d\'authentification';
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur d\'authentification. Veuillez réessayer.';
        }
      });
  }

  
}
