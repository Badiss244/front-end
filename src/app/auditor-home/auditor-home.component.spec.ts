import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditorHomeComponent } from './auditor-home.component';

describe('AuditorHomeComponent', () => {
  let component: AuditorHomeComponent;
  let fixture: ComponentFixture<AuditorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditorHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
