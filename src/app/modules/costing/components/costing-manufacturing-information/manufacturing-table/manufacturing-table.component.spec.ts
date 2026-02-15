import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingTableComponent } from './manufacturing-table.component';

describe('ManufacturingTableComponent', () => {
  let component: ManufacturingTableComponent;
  let fixture: ComponentFixture<ManufacturingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManufacturingTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManufacturingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
