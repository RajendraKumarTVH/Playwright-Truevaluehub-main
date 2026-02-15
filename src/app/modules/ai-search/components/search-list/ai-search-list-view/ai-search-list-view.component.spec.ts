import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSearchListViewComponent } from './ai-search-list-view.component';

describe('AiSearchListViewComponent', () => {
  let component: AiSearchListViewComponent;
  let fixture: ComponentFixture<AiSearchListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSearchListViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiSearchListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
