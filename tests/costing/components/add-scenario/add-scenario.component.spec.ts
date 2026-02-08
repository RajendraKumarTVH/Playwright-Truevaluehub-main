import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddScenarioComponent } from './add-scenario.component';

describe('AddScenarioComponent', () => {
  let component: AddScenarioComponent;
  let fixture: ComponentFixture<AddScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddScenarioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
