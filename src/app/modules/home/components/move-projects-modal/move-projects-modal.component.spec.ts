import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveProjectsModalComponent } from './move-projects-modal.component';

describe('MoveProjectsModalComponent', () => {
  let component: MoveProjectsModalComponent;
  let fixture: ComponentFixture<MoveProjectsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveProjectsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoveProjectsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
