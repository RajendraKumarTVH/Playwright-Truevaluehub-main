import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelUtilizationComponent } from './panel-utilization.component';

describe('PanelUtilizationComponent', () => {
  let component: PanelUtilizationComponent;
  let fixture: ComponentFixture<PanelUtilizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelUtilizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelUtilizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
