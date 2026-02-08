import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachiningProcessComponent } from './machining-process.component';

describe('MachiningProcessComponent', () => {
  let component: MachiningProcessComponent;
  let fixture: ComponentFixture<MachiningProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachiningProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MachiningProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
