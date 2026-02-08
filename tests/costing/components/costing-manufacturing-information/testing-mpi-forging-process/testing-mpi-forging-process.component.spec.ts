import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingMpiForgingProcessComponent } from './testing-mpi-forging-process.component';

describe('TestingMpiForgingProcessComponent', () => {
  let component: TestingMpiForgingProcessComponent;
  let fixture: ComponentFixture<TestingMpiForgingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingMpiForgingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestingMpiForgingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
