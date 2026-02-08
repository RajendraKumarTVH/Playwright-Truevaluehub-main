import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolingBopTableComponent } from './tooling-bop-table.component';

describe('ToolingBopTableComponent', () => {
  let component: ToolingBopTableComponent;
  let fixture: ComponentFixture<ToolingBopTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolingBopTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolingBopTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
