import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanActionFactoryComponent } from './plan-action-factory.component';

describe('PlanActionFactoryComponent', () => {
  let component: PlanActionFactoryComponent;
  let fixture: ComponentFixture<PlanActionFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanActionFactoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanActionFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
