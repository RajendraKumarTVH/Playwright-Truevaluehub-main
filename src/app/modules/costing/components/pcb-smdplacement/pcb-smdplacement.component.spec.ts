import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcbSmdplacementComponent } from './pcb-smdplacement.component';

describe('PcbSmdplacementComponent', () => {
  let component: PcbSmdplacementComponent;
  let fixture: ComponentFixture<PcbSmdplacementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PcbSmdplacementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PcbSmdplacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
