import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChatBotTestingComponent } from '../chat-bot-testing/chat-bot-testing.component';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterLink, ChatBotTestingComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements OnInit {
  isMaintenanceMode: boolean = false;
  

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkMaintenanceStatus();
  }

  checkMaintenanceStatus() {
    this.http.get<any>('https://localhost:7299/api/Account/ismaintenance')
      .subscribe({
        next: (response) => {
          this.isMaintenanceMode = response.isMaintenance;
        },
        error: (err) => {
          console.error('Error fetching maintenance status:', err);
        }
      });
  }

 
}
