import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WiringHarnessProcessComponent } from './wiring-harness-process.component';

describe('WiringHarnessProcessComponent', () => {
  let component: WiringHarnessProcessComponent;
  let fixture: ComponentFixture<WiringHarnessProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WiringHarnessProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WiringHarnessProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
