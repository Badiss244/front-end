import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportFactoryComponent } from './rapport-factory.component';

describe('RapportFactoryComponent', () => {
  let component: RapportFactoryComponent;
  let fixture: ComponentFixture<RapportFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportFactoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapportFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
