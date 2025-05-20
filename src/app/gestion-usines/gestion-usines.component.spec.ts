import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionUsinesComponent } from './gestion-usines.component';

describe('GestionUsinesComponent', () => {
  let component: GestionUsinesComponent;
  let fixture: ComponentFixture<GestionUsinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionUsinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionUsinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
