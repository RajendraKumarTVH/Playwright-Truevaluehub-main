import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BilletHeatingForgingProcessComponent } from './billet-heating-forging-process.component';

describe('BilletHeatingForgingProcessComponent', () => {
  let component: BilletHeatingForgingProcessComponent;
  let fixture: ComponentFixture<BilletHeatingForgingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BilletHeatingForgingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BilletHeatingForgingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
