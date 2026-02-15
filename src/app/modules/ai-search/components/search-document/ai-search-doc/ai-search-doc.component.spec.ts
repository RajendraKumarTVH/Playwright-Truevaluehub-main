import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSearchDocComponent } from './ai-search-doc.component';

describe('AiSearchDocComponent', () => {
  let component: AiSearchDocComponent;
  let fixture: ComponentFixture<AiSearchDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AiSearchDocComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiSearchDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
