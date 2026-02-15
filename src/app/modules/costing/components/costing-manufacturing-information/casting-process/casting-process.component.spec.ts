import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastingProcessComponent } from './casting-process.component';

describe('CastingProcessComponent', () => {
  let component: CastingProcessComponent;
  let fixture: ComponentFixture<CastingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CastingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CastingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
