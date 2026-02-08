import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CleaningForgingProcessComponent } from './cleaning-forging-process.component';

describe('CleaningForgingProcessComponent', () => {
  let component: CleaningForgingProcessComponent;
  let fixture: ComponentFixture<CleaningForgingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CleaningForgingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CleaningForgingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
