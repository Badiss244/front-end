import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { lastValueFrom } from 'rxjs';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-bot-testing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot-testing.component.html',
  styleUrls: ['./chat-bot-testing.component.css']
})
export class ChatBotTestingComponent implements OnInit {
  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  isMinimized: boolean = true;

  constructor(private geminiService: GeminiService) {}

  ngOnInit() {
    this.addBotMessage('Bonjour ! Je suis votre assistant 5S 🤖​👌🏻​ Comment puis-je vous aider ?');
  }

  toggleChat() {
    this.isMinimized = !this.isMinimized;
  }

  addUserMessage(text: string) {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
  }

  addBotMessage(text: string) {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date()
    });
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.addUserMessage(userMessage);
    this.userInput = '';
    this.isLoading = true;

    try {
      const response = await lastValueFrom(this.geminiService.generateResponse(userMessage));
      const botResponse = response.candidates[0].content.parts[0].text;
      this.addBotMessage(botResponse);
      this.geminiService.addModelResponse(botResponse);
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = 'Désolé, une erreur s\'est produite lors du traitement de votre demande. Veuillez réessayer.';
      this.addBotMessage(errorMessage);
      this.geminiService.addModelResponse(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
