import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveFolderProjectComponent } from './active-folder-project.component';

describe('ActiveFolderProjectComponent', () => {
  let component: ActiveFolderProjectComponent;
  let fixture: ComponentFixture<ActiveFolderProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveFolderProjectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveFolderProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
