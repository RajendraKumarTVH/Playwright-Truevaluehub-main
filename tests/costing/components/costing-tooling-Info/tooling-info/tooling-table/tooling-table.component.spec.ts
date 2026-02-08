import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolingTableComponent } from './tooling-table.component';

describe('ToolingTableComponent', () => {
  let component: ToolingTableComponent;
  let fixture: ComponentFixture<ToolingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolingTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
