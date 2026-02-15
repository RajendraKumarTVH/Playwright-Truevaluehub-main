import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StraighteningOptionalForgingProcessComponent } from './straightening-optional-forging-process.component';

describe('StraighteningOptionalForgingProcessComponent', () => {
  let component: StraighteningOptionalForgingProcessComponent;
  let fixture: ComponentFixture<StraighteningOptionalForgingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StraighteningOptionalForgingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StraighteningOptionalForgingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
