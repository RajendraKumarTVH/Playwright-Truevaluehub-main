import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolingManufacturingTableComponent } from './tooling-manufacturing-table.component';

describe('ToolingManufacturingTableComponent', () => {
  let component: ToolingManufacturingTableComponent;
  let fixture: ComponentFixture<ToolingManufacturingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolingManufacturingTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolingManufacturingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
