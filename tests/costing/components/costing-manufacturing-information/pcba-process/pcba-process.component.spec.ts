import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcbaProcessComponent } from './pcba-process.component';

describe('PcbaProcessComponent', () => {
  let component: PcbaProcessComponent;
  let fixture: ComponentFixture<PcbaProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PcbaProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PcbaProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
