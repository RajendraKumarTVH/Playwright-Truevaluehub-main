import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderShellComponent } from './slider-shell.component';

describe('SliderShellComponent', () => {
  let component: SliderShellComponent;
  let fixture: ComponentFixture<SliderShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SliderShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SliderShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
