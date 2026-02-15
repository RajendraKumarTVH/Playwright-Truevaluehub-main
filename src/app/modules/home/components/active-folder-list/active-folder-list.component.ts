import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ButtonModule } from 'primeng/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogCustomizedComponent } from 'src/app/messaging/confirmation-dialog/confirmation-dialog-customized/confirmation-dialog-customized.component';
import { AddFolderModalComponent, FolderModalData } from '../add-folder-modal/add-folder-modal.component';

interface Folder {
  name: string;
  dateModified: Date;
  modifiedBy: string;
  subfolders?: Folder[];
}
@Component({
  selector: 'app-active-folder-list',
  imports: [TableModule, CommonModule, MatIconModule, MatMenuModule, ButtonModule],
  templateUrl: './active-folder-list.component.html',
  styleUrl: './active-folder-list.component.scss',
})
export class ActiveFolderListComponent {
  @Input() folders: Folder[] = [];
  @Output() folderClick = new EventEmitter<Folder>();
  constructor(private dialog: MatDialog) {}

  onRowClick(folder: Folder) {
    this.folderClick.emit(folder);
  }
  openMenu(event: MouseEvent) {
    event.stopPropagation();
  }
  renameFolder(event: MouseEvent) {
    event.stopPropagation();
    this.dialog.open(AddFolderModalComponent, {
      width: '413px',
      autoFocus: true,
      panelClass: 'add-folder-modal',
      data: {
        mode: 'rename',
      } as FolderModalData,
    });
  }
  confirmDelete(folder: Folder) {
    const dialogRef = this.dialog.open(ConfirmationDialogCustomizedComponent, {
      data: {
        title: 'Delete Folder',
        message: `Are you sure you want to delete <strong>“${folder.name}”</strong> and all its contents?`,
        cancelText: 'Cancel',
        actionText: 'Delete',
      },
      panelClass: 'custom-folder-delete-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // Call your delete logic here
      }
    });
  }
}
