import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssemblyProcessComponent } from './assembly-process.component';

describe('AssemblyProcessComponent', () => {
  let component: AssemblyProcessComponent;
  let fixture: ComponentFixture<AssemblyProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssemblyProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssemblyProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
