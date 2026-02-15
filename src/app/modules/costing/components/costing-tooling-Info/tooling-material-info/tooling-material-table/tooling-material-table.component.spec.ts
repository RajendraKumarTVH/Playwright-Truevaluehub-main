import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolingMaterialTableComponent } from './tooling-material-table.component';

describe('ToolingMaterialTableComponent', () => {
  let component: ToolingMaterialTableComponent;
  let fixture: ComponentFixture<ToolingMaterialTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolingMaterialTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolingMaterialTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
