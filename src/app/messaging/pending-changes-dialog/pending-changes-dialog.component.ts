import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pending-changes-dialog',
  templateUrl: './pending-changes-dialog.component.html',
  styleUrls: ['./pending-changes-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
})
export class PendingChangesDialogComponent {
  constructor(public dialogRef: MatDialogRef<PendingChangesDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  onContinueButtonClick(): void {
    this.dialogRef.close(true);
  }
}
