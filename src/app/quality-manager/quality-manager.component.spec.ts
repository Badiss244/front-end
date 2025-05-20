import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityManagerComponent } from './quality-manager.component';

describe('QualityManagerComponent', () => {
  let component: QualityManagerComponent;
  let fixture: ComponentFixture<QualityManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualityManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualityManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
