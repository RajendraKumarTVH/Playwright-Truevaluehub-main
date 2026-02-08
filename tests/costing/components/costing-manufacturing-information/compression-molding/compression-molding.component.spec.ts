import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressionMoldingComponent } from './compression-molding.component';

describe('CompressionMoldingComponent', () => {
  let component: CompressionMoldingComponent;
  let fixture: ComponentFixture<CompressionMoldingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompressionMoldingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompressionMoldingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
