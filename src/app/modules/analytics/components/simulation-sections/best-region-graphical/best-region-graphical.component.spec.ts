import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestRegionGraphicalComponent } from './best-region-graphical.component';

describe('BestRegionGraphicalComponent', () => {
  let component: BestRegionGraphicalComponent;
  let fixture: ComponentFixture<BestRegionGraphicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BestRegionGraphicalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BestRegionGraphicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
