import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-messaging-snackbar',
  templateUrl: './messaging-snackbar.component.html',
  styleUrls: ['./messaging-snackbar.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
})
export class MessagingSnackbarComponent {
  message: string;
  subMessages: string;
  action: string;
  isAlert: boolean;
  showSubMessages = false;
  constructor(
    public snackBarRef: MatSnackBarRef<MessagingSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {
    this.message = data.message;
    this.subMessages = data.subMessages;
    this.action = data.action;
    this.isAlert = data.isAlert;
    this.showSubMessages = this.subMessages ? this.subMessages.length > 0 : false;
  }

  closeSnackBar() {
    this.snackBarRef.dismissWithAction();
  }
}
