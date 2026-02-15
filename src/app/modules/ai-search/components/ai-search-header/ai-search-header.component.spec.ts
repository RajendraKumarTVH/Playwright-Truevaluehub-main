import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSearchHeaderComponent } from './ai-search-header.component';

describe('AiSearchHeaderComponent', () => {
  let component: AiSearchHeaderComponent;
  let fixture: ComponentFixture<AiSearchHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSearchHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiSearchHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
