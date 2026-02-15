import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestRegionSourceComponent } from './best-region-source.component';

describe('BestRegionSourceComponent', () => {
  let component: BestRegionSourceComponent;
  let fixture: ComponentFixture<BestRegionSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BestRegionSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BestRegionSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
