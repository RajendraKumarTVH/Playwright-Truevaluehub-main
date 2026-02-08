import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgingSubProcessComponent } from './forging-sub-process.component';

describe('ForgingSubProcessComponent', () => {
  let component: ForgingSubProcessComponent;
  let fixture: ComponentFixture<ForgingSubProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForgingSubProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgingSubProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
