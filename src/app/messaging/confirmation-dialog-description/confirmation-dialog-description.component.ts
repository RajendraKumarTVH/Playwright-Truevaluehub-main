import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog-description',
  templateUrl: 'confirmation-dialog-description.component.html',
  styleUrls: ['confirmation-dialog-description.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatCardModule],
})
export class ConfirmationDialogdescriptionComponent {
  date: any;
  dialogMessage: string;
  dialogTitle: string;
  dialogAction: string;
  confirmButtonColor = 'accent';
  subscribeTimer: any = 10;
  url: any;
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogdescriptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogTitle = data.title;
    this.dialogAction = data.action;
    this.dialogMessage = data.message;
    //this.url = 'assets/images/marker-gr.png';

    // if (!data.imageUrl) {
    //   this.url = 'assets/images/NoImage.png';

    // }
    // else {
    //   this.url = data.imageUrl;
    // }
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  onConfirmButtonClicked() {
    this.dialogRef.close(true);
  }
}
