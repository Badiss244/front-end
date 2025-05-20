import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionSComponent } from './gestion-s.component';

describe('GestionSComponent', () => {
  let component: GestionSComponent;
  let fixture: ComponentFixture<GestionSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionSComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
