import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChatBotTestingComponent } from '../chat-bot-testing/chat-bot-testing.component';
@Component({
  selector: 'app-unauthorized',
  imports: [RouterModule, ChatBotTestingComponent],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    const userRole = this.authService.getUserRole().toLowerCase();
    
    switch(userRole) {
      case 'admin':
        this.router.navigate(['/admin/admin-home']);
        break;
      case 'auditor':
        this.router.navigate(['/auditor/auditor-home']);
        break;
      case 'qualitym':
        this.router.navigate(['/quality-manager/quality-home']);
        break;
      case 'factorym':
        this.router.navigate(['/factory-manager/factory-home']);
        break;
    }
  }
}
