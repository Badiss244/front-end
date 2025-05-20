import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatBotTestingComponent } from '../chat-bot-testing/chat-bot-testing.component';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule,  ChatBotTestingComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  mode: 'request' | 'reset' = 'request';
  email: string = '';
  token: string = '';
  newPassword: string = '';
  message: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email'] && params['token']) {
        this.mode = 'reset';
        this.email = params['email'];
        this.token = encodeURIComponent(params['token']);
      } else {
        this.mode = 'request';
      }
    });
  }

  requestReset(): void {
    const payload = { email: this.email };

    this.http.post<any>('https://localhost:7299/api/Account/forgot-password', payload)
      .subscribe({
        next: () => {
          this.message = "Si l'email existe, un lien de réinitialisation vous a été envoyé.";
          this.errorMessage = '';
        },
        error: (error) => {
          console.error("Erreur lors de la demande de réinitialisation:", error);
          this.errorMessage = "Erreur lors de la demande de réinitialisation. Veuillez réessayer.";
          this.message = '';
        }
      });
  }

  resetPassword(): void {


    const payload = {
      email: this.email,
      token: this.token,
      newPassword: this.newPassword
    };


    this.http.post<any>('https://localhost:7299/api/Account/reset-password', payload)
      .subscribe({
        next: () => {
          this.message = "Votre mot de passe a été réinitialisé avec succès.";
          this.errorMessage = '';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error("Erreur de réinitialisation:", error);
          this.errorMessage = "Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.";
          this.message = '';
        }
      });
  }
}
