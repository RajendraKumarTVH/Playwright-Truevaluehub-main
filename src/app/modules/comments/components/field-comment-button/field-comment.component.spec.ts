import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldCommentComponent } from './field-comment.component';

describe('FieldCommentComponent', () => {
  let component: FieldCommentComponent;
  let fixture: ComponentFixture<FieldCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FieldCommentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
