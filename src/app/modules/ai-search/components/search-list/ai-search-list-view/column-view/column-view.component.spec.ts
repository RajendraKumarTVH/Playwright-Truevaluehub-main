import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnViewComponent } from './column-view.component';

describe('ColumnViewComponent', () => {
  let component: ColumnViewComponent;
  let fixture: ComponentFixture<ColumnViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
