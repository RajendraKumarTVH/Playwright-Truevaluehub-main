import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-confirmation-dialog-timeout',
  templateUrl: 'confirmation-dialog-timeout.component.html',
  styleUrls: ['confirmation-dialog-timeout.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
})
export class ConfirmationDialogtimeoutComponent {
  date: any;
  dialogMessage: string;
  dialogTitle: string;
  dialogAction: string;
  confirmButtonColor = 'accent';
  subscribeTimer: any = 10;
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogtimeoutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.timer();
    this.dialogTitle = data.title;
    this.dialogAction = data.action;
    // if (data.color) {
    //this.confirmButtonColor = 'green';
    // }
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  onConfirmButtonClicked() {
    this.dialogRef.close(true);
  }

  timer() {
    const minute = 1;
    let seconds: number = minute * 60;
    let textSec: any = '0';
    let statSec: number = 60;

    // const prefix = minute < 10 ? '0' : '';
    this.dialogMessage = 'Your session is about to expire in ' + `${statSec}` + ' seconds. Continue Session?';

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      textSec = statSec < 10 && statSec > 0 ? '0' + statSec : statSec;

      this.dialogMessage = 'Your session is about to expire in ' + `${textSec}` + ' seconds. Continue Session?';
      //`${prefix}${Math.floor(seconds / 60)}:${textSec}`;
      if (seconds == 0) {
        clearInterval(timer);
      }
    }, 1000);
  }
}
