import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcbThroughholeplacementComponent } from './pcb-throughholeplacement.component';

describe('PcbThroughholeplacementComponent', () => {
  let component: PcbThroughholeplacementComponent;
  let fixture: ComponentFixture<PcbThroughholeplacementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PcbThroughholeplacementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PcbThroughholeplacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
