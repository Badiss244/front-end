import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChatBotTestingComponent } from '../chat-bot-testing/chat-bot-testing.component';

@Component({
  selector: 'app-aide',
  imports: [RouterLink, ChatBotTestingComponent],
  templateUrl: './aide.component.html',
  styleUrl: './aide.component.css'
})
export class AideComponent {

}
