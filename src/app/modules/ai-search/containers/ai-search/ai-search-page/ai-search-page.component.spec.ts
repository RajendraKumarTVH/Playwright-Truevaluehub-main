import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSearchPageComponent } from './ai-search-page.component';

describe('AiSearchPageComponent', () => {
  let component: AiSearchPageComponent;
  let fixture: ComponentFixture<AiSearchPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AiSearchPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiSearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
