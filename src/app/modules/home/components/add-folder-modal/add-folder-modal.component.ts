import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface FolderModalData {
  mode?: 'create' | 'rename';
}

@Component({
  selector: 'app-add-folder-modal',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './add-folder-modal.component.html',
  styleUrl: './add-folder-modal.component.scss',
})
export class AddFolderModalComponent {
  folderName: string = '';
  modalTitle: string = 'Create New Folder';

  constructor(
    private dialogRef: MatDialogRef<AddFolderModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: FolderModalData
  ) {
    // Set title based on mode
    if (data?.mode === 'rename') {
      this.modalTitle = 'Rename Folder';
    } else {
      this.modalTitle = 'Create New Folder';
    }
  }

  save() {
    if (this.folderName.trim()) {
      this.dialogRef.close(this.folderName.trim());
    }
  }

  close() {
    this.dialogRef.close();
  }
}
