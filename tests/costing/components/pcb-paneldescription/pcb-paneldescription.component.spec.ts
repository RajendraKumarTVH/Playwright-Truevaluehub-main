import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcbPaneldescriptionComponent } from './pcb-paneldescription.component';

describe('PcbPaneldescriptionComponent', () => {
  let component: PcbPaneldescriptionComponent;
  let fixture: ComponentFixture<PcbPaneldescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PcbPaneldescriptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PcbPaneldescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
