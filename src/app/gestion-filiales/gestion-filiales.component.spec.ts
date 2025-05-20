import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionFilialesComponent } from './gestion-filiales.component';

describe('GestionFilialesComponent', () => {
  let component: GestionFilialesComponent;
  let fixture: ComponentFixture<GestionFilialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionFilialesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionFilialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
