import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcbTimetestingComponent } from './pcb-timetesting.component';

describe('PcbTimetestingComponent', () => {
  let component: PcbTimetestingComponent;
  let fixture: ComponentFixture<PcbTimetestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PcbTimetestingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PcbTimetestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
