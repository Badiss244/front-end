import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ChatBotTestingComponent } from '../chat-bot-testing/chat-bot-testing.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatBotTestingComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  email: string = '';
  username: string = '';
  phone: string = '';
  
  originalEmail: string = '';
  originalUsername: string = '';
  originalPhone: string = '';
  errorMessage: string = '';
  message: string = '';
  profileImage: string = ''; 
  selectedFile: File | null = null;

 
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private location : Location
  ) {}

  ngOnInit(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    // Retrieve profile information
    this.http.get<any>('https://localhost:7299/api/Account/profile', { headers })
      .subscribe({
        next: (data) => {
          this.email = data.email;
          this.username = data.username;
          this.phone = data.phone;
          // Store original values
          this.originalEmail = data.email;
          this.originalUsername = data.username;
          this.originalPhone = data.phone;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du profil :', err);
          this.errorMessage = 'Erreur lors de la récupération du profil. Veuillez réessayer.';
        }
      });

    // Retrieve profile picture 
    this.http.get('https://localhost:7299/api/Account/get-picture', { headers, responseType: 'text' })
      .subscribe({
        next: (res: string) => {
          this.profileImage = res;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération de la photo :', err);
          
        }
      });
  }

  // new photo selected
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile!);
    }
  }

  updateProfile(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }
    // Reset messages
    this.message = '';
    this.errorMessage = '';
    
    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');

    //payload with new info 
    const payload: any = {};
    
    if (this.username !== this.originalUsername) {
      payload.username = this.username;
    }
    if (this.email !== this.originalEmail) {
      payload.email = this.email;
    }
    if (this.phone !== this.originalPhone) {
      payload.phone = this.phone;
    }

    // Check if anything has actually changed
    if (Object.keys(payload).length === 0) {
      this.message = 'Aucune modification détectée.';
      return;
    }



    this.http.put<any>('https://localhost:7299/api/Account/profile', payload, { headers })
      .subscribe({
        next: (response) => {
          this.message = 'Profil mis à jour avec succès.';
          // Update original values after successful update
          if (payload.username) this.originalUsername = this.username;
          if (payload.email) this.originalEmail = this.email;
          if (payload.phone) this.originalPhone = this.phone;
          // Navigate back after a short delay
          setTimeout(() => {
            window.history.back();
          }, 1500);
        },
        error: (err) => {

          
          if (err.error && typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.error && err.error.errors) {
            const errorMessages = Object.values(err.error.errors).flat();
            this.errorMessage = errorMessages.join(', ');
          } else {
            this.errorMessage = 'Erreur lors de la mise à jour du profil. Veuillez réessayer.';
          }
        }
      });
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) {
      return;
    }

    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    
    const uploadHeaders = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);

    this.http.post<any>('https://localhost:7299/api/Account/upload-picture', formData, { 
      headers: uploadHeaders,
      responseType: 'text' as 'json'
    })
    .subscribe({
      next: (response) => {
        this.message = 'Photo de profil mise à jour avec succès.';
        // Navigate back after a short delay
        setTimeout(() => {
          window.history.back();
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la photo :', err);
        this.errorMessage = 'Erreur lors de la mise à jour de la photo. Veuillez réessayer.';
      }
    });
  }

  changePassword(): void {
    // Reset messages
    this.message = '';
    this.errorMessage = '';

    // Validate passwords
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs de mot de passe.';
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');

    const payload = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword
    };

    this.http.post<any>('https://localhost:7299/api/Account/change-password', payload, { headers })
      .subscribe({
        next: (response) => {
          this.message = 'Mot de passe mis à jour avec succès.';
          // Clear password fields after successful change
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
          // Navigate back after a short delay
          setTimeout(() => {
            window.history.back();
          }, 1500);
        },
        error: (err) => {
          console.error('Error changing password:', err);
          if (err.error && typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.error && err.error.errors) {
            const errorMessages = Object.values(err.error.errors).flat();
            this.errorMessage = errorMessages.join(', ');
          } else {
            this.errorMessage = 'Erreur lors du changement de mot de passe. Veuillez réessayer.';
          }
        }
      });
  }

  // Update both profile and picture if needed
  updateProfileEtImage(): void {
    // First update profile
    this.updateProfile();
    
    // Then update password if any password fields are filled
    if (this.currentPassword || this.newPassword || this.confirmNewPassword) {
      this.changePassword();
    }
    
    // Finally upload picture if selected
    if (this.selectedFile) {
      this.uploadProfilePicture();
    }
  }

  retour() : void {
    this.location.back();
  }
}
