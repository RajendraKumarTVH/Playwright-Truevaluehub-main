import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverheadInfoComponent } from './overhead-info.component';

describe('OverheadInfoComponent', () => {
  let component: OverheadInfoComponent;
  let fixture: ComponentFixture<OverheadInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OverheadInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverheadInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
