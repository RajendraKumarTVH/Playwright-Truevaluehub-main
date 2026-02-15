import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AiSearchHelperService } from '../../services/ai-search-helper-service';

@Component({
  selector: 'app-image-search-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, ProgressSpinnerModule],
  templateUrl: './image-search-modal.component.html',
  styleUrl: './image-search-modal.component.scss',
})
export class ImageSearchModalComponent {
  selectedFile?: File;
  imagePreview: boolean = false;
  isUploading = false;
  isDragOver = true;
  supportedFormats = ['image/jpeg', 'image/png'];
  hasUploadError = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  constructor(
    public dialogRef: MatDialogRef<ImageSearchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly aiSearchHelper: AiSearchHelperService
  ) {}

  onCancel() {
    this.dialogRef.close();
  }

  removeSelectedFile() {
    this.selectedFile = null;
    this.imagePreview = null;
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      if (!this.supportedFormats.includes(file.type)) {
        this.selectedFile = null;
        this.hasUploadError = true;
        return;
      }
      this.hasUploadError = false;
      this.isUploading = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      setTimeout(() => {
        this.isUploading = false;
      }, 2000);
    }
  }

  openFileExplorer() {
    this.fileInput?.nativeElement?.click();
  }

  onSearchClicked() {
    if (this.selectedFile && !this.hasUploadError) {
      this.aiSearchHelper.$imageUploadSearch.next([this.selectedFile] as unknown as FileList);
      this.dialogRef.close(true);
    }
  }
}
