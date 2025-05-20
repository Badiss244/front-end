import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBotTestingComponent } from './chat-bot-testing.component';

describe('ChatBotTestingComponent', () => {
  let component: ChatBotTestingComponent;
  let fixture: ComponentFixture<ChatBotTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatBotTestingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatBotTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
