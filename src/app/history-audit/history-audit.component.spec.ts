import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryAuditComponent } from './history-audit.component';

describe('HistoryAuditComponent', () => {
  let component: HistoryAuditComponent;
  let fixture: ComponentFixture<HistoryAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryAuditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
