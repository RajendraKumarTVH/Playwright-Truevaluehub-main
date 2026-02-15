import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackupDiagramComponent } from './stackup-diagram.component';

describe('StackupDiagramComponent', () => {
  let component: StackupDiagramComponent;
  let fixture: ComponentFixture<StackupDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StackupDiagramComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StackupDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
