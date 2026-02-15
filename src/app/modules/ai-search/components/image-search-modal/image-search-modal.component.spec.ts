import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSearchModalComponent } from './image-search-modal.component';

describe('ImageSearchModalComponent', () => {
  let component: ImageSearchModalComponent;
  let fixture: ComponentFixture<ImageSearchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageSearchModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageSearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
