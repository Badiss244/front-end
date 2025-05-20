import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChatBotTestingComponent } from '../chat-bot-testing/chat-bot-testing.component';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink, ChatBotTestingComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

}

