import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
type FolderNode = { name: string; children?: FolderNode[] };
@Component({
  selector: 'app-move-projects-modal',
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './move-projects-modal.component.html',
  styleUrl: './move-projects-modal.component.scss',
})
export class MoveProjectsModalComponent {
  @Input() selectedCountLabel = '2 Projects selected to move';

  folders: FolderNode[] = [
    {
      name: 'Future Mobility Design Team',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'Car Aesthetics Research',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'User Experience in Automotive Design',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'Automotive Innovations',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'Advanced Safety Features Research',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'Automotive Materials Research',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'Future Mobility Design Team',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'Car Aesthetics Research',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'User Experience in Automotive Design',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'Automotive Innovations',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'Advanced Safety Features Research',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
    {
      name: 'Automotive Materials Research',
      children: [{ name: 'Sub Folder 1' }, { name: 'Sub Folder 2' }],
    },
  ];

  breadcrumb: FolderNode[] = [];
  currentList: FolderNode[] = this.folders;
  selectedFolderName = '';

  constructor(public dialogRef: MatDialogRef<MoveProjectsModalComponent>) {}

  onFolderClick(folder: FolderNode): void {
    if (folder.children?.length) {
      this.breadcrumb = [...this.breadcrumb, folder];
      this.currentList = folder.children;
      this.selectedFolderName = folder.name;
    } else {
      this.breadcrumb = [...this.breadcrumb, folder];
      this.currentList = [];
      this.selectedFolderName = folder.name;
    }
  }

  onBreadcrumbClick(index: number): void {
    const trail = this.breadcrumb.slice(0, index + 1);
    this.breadcrumb = trail;
    this.currentList = trail[trail.length - 1]?.children ?? this.folders;
  }

  goRoot(): void {
    this.breadcrumb = [];
    this.currentList = this.folders;
    this.selectedFolderName = '';
  }

  close(): void {
    this.dialogRef.close();
  }
}
