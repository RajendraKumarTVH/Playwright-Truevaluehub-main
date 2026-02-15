import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MessagingSnackbarComponent } from './messaging-snackbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

describe('MessagingSnackbarComponent', () => {
  let component: MessagingSnackbarComponent;
  let fixture: ComponentFixture<MessagingSnackbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MessagingSnackbarComponent],
      imports: [MatSnackBarModule, MatIconModule],
      providers: [
        // Provide for tests
        { provide: MatSnackBarRef, useValue: {} },
        { provide: MAT_SNACK_BAR_DATA, useValue: [] },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagingSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
