import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealiserRapportComponent } from './realiser-rapport.component';

describe('RealiserRapportComponent', () => {
  let component: RealiserRapportComponent;
  let fixture: ComponentFixture<RealiserRapportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealiserRapportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealiserRapportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
