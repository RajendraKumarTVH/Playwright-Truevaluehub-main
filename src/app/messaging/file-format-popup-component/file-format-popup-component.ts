import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-file-format-popup-component',
  templateUrl: './file-format-popup.component.html',
  styleUrls: ['./file-format-popup-component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatCardModule],
})
export class FileFormatPopupComponent {
  supportedFormats: string[];
  width: string;
  constructor(
    public dialogRef: MatDialogRef<FileFormatPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.supportedFormats = data.supportFile;
    this.width = data.width;
  }

  close(): void {
    this.dialogRef.close();
  }
}
