import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartCopySliderContentComponent } from './part-copy-slider-content.component';

describe('PartCopySliderContentComponent', () => {
  let component: PartCopySliderContentComponent;
  let fixture: ComponentFixture<PartCopySliderContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PartCopySliderContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PartCopySliderContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
