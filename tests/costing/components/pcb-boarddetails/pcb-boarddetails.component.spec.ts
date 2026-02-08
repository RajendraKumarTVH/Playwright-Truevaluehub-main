import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcbBoarddetailsComponent } from './pcb-boarddetails.component';

describe('PcbBoarddetailsComponent', () => {
  let component: PcbBoarddetailsComponent;
  let fixture: ComponentFixture<PcbBoarddetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PcbBoarddetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PcbBoarddetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
