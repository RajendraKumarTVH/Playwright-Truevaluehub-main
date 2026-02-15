import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftProjectListComponent } from './draft-project-list.component';

describe('DraftProjectListComponent', () => {
  let component: DraftProjectListComponent;
  let fixture: ComponentFixture<DraftProjectListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DraftProjectListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DraftProjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
