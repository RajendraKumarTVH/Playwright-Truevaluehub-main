import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TubeBendingComponent } from './tube-bending.component';

describe('TubeBendingComponent', () => {
  let component: TubeBendingComponent;
  let fixture: ComponentFixture<TubeBendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TubeBendingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TubeBendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
