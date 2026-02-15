import { Component, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActiveFolderListComponent } from '../active-folder-list/active-folder-list.component';
import { ActiveProjectsComponent } from '../active-projects/active-projects.component';
import { AddFolderModalComponent } from '../add-folder-modal/add-folder-modal.component';
interface Folder {
  name: string;
  dateModified: Date;
  modifiedBy: string;
  subfolders?: Folder[];
}
@Component({
  selector: 'app-active-folder-project',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, ActiveFolderListComponent, ActiveProjectsComponent, MatDialogModule],
  templateUrl: './active-folder-project.component.html',
  styleUrl: './active-folder-project.component.scss',
})
export class ActiveFolderProjectComponent {
  matDialog = inject(MatDialog);
  folders: Folder[] = [
    {
      name: 'Automotive Folder',
      dateModified: new Date(1999, 10, 19),
      modifiedBy: 'Eleanor Pena',
      subfolders: [
        {
          name: 'Royal Engine',
          dateModified: new Date(1999, 10, 19),
          modifiedBy: 'Eleanor Pena',
          subfolders: [],
        },
      ],
    },
    {
      name: 'Plastic Parts - China',
      dateModified: new Date(1999, 10, 19),
      modifiedBy: 'Jacob Jones',
    },
    {
      name: 'Electronic Components - Schneider',
      dateModified: new Date(1999, 10, 19),
      modifiedBy: 'Cody Fisher',
    },
    {
      name: 'Steel Forging',
      dateModified: new Date(1999, 10, 19),
      modifiedBy: 'Ralph Edwards',
    },
  ];
  path: Folder[] = [];
  get currentFolders(): Folder[] {
    if (this.path.length === 0) return this.folders;
    return this.path[this.path.length - 1].subfolders || [];
  }

  get currentFolderName(): string {
    if (this.path.length === 0) return '';
    return this.path[this.path.length - 1].name;
  }

  onFolderClick(folder: Folder) {
    this.path.push(folder);
  }

  onBreadcrumbClick(index: number) {
    this.path = this.path.slice(0, index + 1);
  }

  onBreadcrumbRootClick() {
    this.path = [];
  }

  openAddFolderModal() {
    const dialogRef = this.matDialog.open(AddFolderModalComponent, {
      width: '413px',
      autoFocus: true,
      panelClass: 'add-folder-modal',
    });

    dialogRef.afterClosed().subscribe((folderName: string) => {
      if (folderName) {
        this.folders.push({
          name: folderName,
          dateModified: new Date(),
          modifiedBy: 'Current User', // Replace with actual user
          subfolders: [],
        });
      }
    });
  }
}
