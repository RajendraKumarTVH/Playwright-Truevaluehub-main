import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessInfoComponent } from './process-info.component';

describe('ProcessInfoComponent', () => {
  let component: ProcessInfoComponent;
  let fixture: ComponentFixture<ProcessInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
