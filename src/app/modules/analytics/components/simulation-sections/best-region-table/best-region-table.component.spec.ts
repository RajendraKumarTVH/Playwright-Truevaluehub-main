import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestRegionTableComponent } from './best-region-table.component';

describe('BestRegionTableComponent', () => {
  let component: BestRegionTableComponent;
  let fixture: ComponentFixture<BestRegionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BestRegionTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BestRegionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
