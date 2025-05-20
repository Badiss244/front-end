import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactoryHomeComponent } from './factory-home.component';

describe('FactoryHomeComponent', () => {
  let component: FactoryHomeComponent;
  let fixture: ComponentFixture<FactoryHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactoryHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactoryHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
