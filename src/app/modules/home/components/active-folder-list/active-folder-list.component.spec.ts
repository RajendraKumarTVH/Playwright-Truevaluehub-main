import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveFolderListComponent } from './active-folder-list.component';

describe('ActiveFolderListComponent', () => {
  let component: ActiveFolderListComponent;
  let fixture: ComponentFixture<ActiveFolderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveFolderListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveFolderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
