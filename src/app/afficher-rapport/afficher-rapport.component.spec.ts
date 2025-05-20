import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfficherRapportComponent } from './afficher-rapport.component';

describe('AfficherRapportComponent', () => {
  let component: AfficherRapportComponent;
  let fixture: ComponentFixture<AfficherRapportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfficherRapportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfficherRapportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
