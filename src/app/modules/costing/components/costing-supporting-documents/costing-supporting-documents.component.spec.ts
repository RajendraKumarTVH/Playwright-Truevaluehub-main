import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostingSupportingDocumentsComponent } from './costing-supporting-documents.component';

describe('CostingSupportingDocumentsComponent', () => {
  let component: CostingSupportingDocumentsComponent;
  let fixture: ComponentFixture<CostingSupportingDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostingSupportingDocumentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostingSupportingDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
