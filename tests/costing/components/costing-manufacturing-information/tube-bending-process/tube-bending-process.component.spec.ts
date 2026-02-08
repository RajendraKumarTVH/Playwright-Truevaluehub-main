import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TubeBendingProcessComponent } from './tube-bending-process.component';

describe('TubeBendingProcessComponent', () => {
  let component: TubeBendingProcessComponent;
  let fixture: ComponentFixture<TubeBendingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TubeBendingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TubeBendingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
