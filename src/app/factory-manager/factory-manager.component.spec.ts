import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactoryManagerComponent } from './factory-manager.component';

describe('FactoryManagerComponent', () => {
  let component: FactoryManagerComponent;
  let fixture: ComponentFixture<FactoryManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactoryManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactoryManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
