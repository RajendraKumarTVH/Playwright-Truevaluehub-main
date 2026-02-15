import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcbResultComponent } from './pcb-result.component';

describe('PcbResultComponent', () => {
  let component: PcbResultComponent;
  let fixture: ComponentFixture<PcbResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PcbResultComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PcbResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
