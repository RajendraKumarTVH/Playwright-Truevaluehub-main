import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog-customized',
  templateUrl: 'confirmation-dialog-customized.component.html',
  styleUrls: ['confirmation-dialog-customized.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
})
export class ConfirmationDialogCustomizedComponent {
  dialogMessage: string;
  dialogTitle: string;
  dialogAction: string;
  confirmButtonColor = 'accent';
  cancelText: string;
  actionText: string;
  dialogActionClass: string;
  actionIcon: string;
  cancelIcon: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogCustomizedComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogMessage = data.message;
    this.dialogTitle = data.title;
    this.dialogAction = data.action;
    this.actionText = data.actionText;
    this.cancelText = data.cancelText ?? 'CANCEL';
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
