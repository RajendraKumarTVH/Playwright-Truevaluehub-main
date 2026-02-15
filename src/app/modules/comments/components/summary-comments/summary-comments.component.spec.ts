import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryCommentsComponent } from './summary-comments.component';

describe('SummaryCommentsComponent', () => {
  let component: SummaryCommentsComponent;
  let fixture: ComponentFixture<SummaryCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SummaryCommentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
