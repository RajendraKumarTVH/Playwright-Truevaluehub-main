import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestProcessTableComponent } from './best-process-table.component';

describe('BestProcessTableComponent', () => {
  let component: BestProcessTableComponent;
  let fixture: ComponentFixture<BestProcessTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BestProcessTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BestProcessTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
