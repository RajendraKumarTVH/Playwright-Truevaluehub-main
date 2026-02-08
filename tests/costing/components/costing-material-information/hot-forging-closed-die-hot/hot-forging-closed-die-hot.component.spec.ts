import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotForgingClosedDieHotComponent } from './hot-forging-closed-die-hot.component';

describe('HotForgingClosedDieHotComponent', () => {
  let component: HotForgingClosedDieHotComponent;
  let fixture: ComponentFixture<HotForgingClosedDieHotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HotForgingClosedDieHotComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HotForgingClosedDieHotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
