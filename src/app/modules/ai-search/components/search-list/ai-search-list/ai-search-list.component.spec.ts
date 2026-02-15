import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSearchListComponent } from './ai-search-list.component';

describe('AiSearchListComponent', () => {
  let component: AiSearchListComponent;
  let fixture: ComponentFixture<AiSearchListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AiSearchListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiSearchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
