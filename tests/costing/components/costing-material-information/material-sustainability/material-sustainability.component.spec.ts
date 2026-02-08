import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialSustainabilityComponent } from './material-sustainability.component';

describe('MaterialSustainabilityComponent', () => {
  let component: MaterialSustainabilityComponent;
  let fixture: ComponentFixture<MaterialSustainabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MaterialSustainabilityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialSustainabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
