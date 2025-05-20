import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportQualityComponent } from './rapport-quality.component';

describe('RapportQualityComponent', () => {
  let component: RapportQualityComponent;
  let fixture: ComponentFixture<RapportQualityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportQualityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapportQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
