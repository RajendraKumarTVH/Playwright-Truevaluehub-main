import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectPartsSliderComponent } from './project-parts-slider.component';

describe('ProjectPartsSliderComponent', () => {
  let component: ProjectPartsSliderComponent;
  let fixture: ComponentFixture<ProjectPartsSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectPartsSliderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectPartsSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
