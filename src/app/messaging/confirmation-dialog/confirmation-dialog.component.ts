import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: 'confirmation-dialog.component.html',
  styleUrls: ['confirmation-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
})
export class ConfirmationDialogComponent {
  dialogMessage: string;
  dialogTitle: string;
  dialogAction: string;
  confirmButtonColor = 'accent';

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogMessage = data.message;
    this.dialogTitle = data.title;
    this.dialogAction = data.action;
    if (data.color) {
      this.confirmButtonColor = data.color;
    }
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  onConfirmButtonClicked() {
    this.dialogRef.close(true);
  }
}
