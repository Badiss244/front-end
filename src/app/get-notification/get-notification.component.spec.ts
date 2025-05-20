import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetNotificationComponent } from './get-notification.component';

describe('GetNotificationComponent', () => {
  let component: GetNotificationComponent;
  let fixture: ComponentFixture<GetNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
