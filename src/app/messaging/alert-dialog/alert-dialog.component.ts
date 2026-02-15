import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: 'alert-dialog.component.html',
  styleUrls: ['alert-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
})
export class AlertDialogComponent {
  dialogMessage: string;
  dialogTitle: string;
  dialogButton: string;
  buttonColor = 'accent';

  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogMessage = data.message;
    this.dialogTitle = data.title;
    this.dialogButton = data.buttonText;
    if (data.buttonColor) {
      this.buttonColor = data.buttonColor;
    }
  }

  closeDialog() {
    this.dialogRef.close(true);
  }
}
