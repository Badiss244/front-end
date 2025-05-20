import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityHomeComponent } from './quality-home.component';

describe('QualityHomeComponent', () => {
  let component: QualityHomeComponent;
  let fixture: ComponentFixture<QualityHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualityHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualityHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
