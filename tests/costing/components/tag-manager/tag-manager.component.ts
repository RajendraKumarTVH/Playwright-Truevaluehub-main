import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-simple-dialog',
  standalone: true,
  templateUrl: './tag-manager.component.html',
  styleUrls: ['./tag-manager.component.scss'],
  imports: [MatDialogModule, MatButtonModule, MatIconModule, AutoCompleteModule, FormsModule, MatTooltip, ChipModule],
})
export class TagManagerComponent {
  // Initialize with some sample existing tags
  selectedTags: string[] = ['Tag A', 'Tag B', 'Plastic'];
  availableTags: string[] = [];
  allTags: string[] = ['Tag A', 'Tag B', 'Tag C', 'Plastic', 'Metal', 'Rubber', 'Wood', 'Glass'];

  constructor(public dialogRef: MatDialogRef<TagManagerComponent>) {
    // Show available tags that are not already selected
    this.showAvailableTags();
  }

  close(): void {
    this.dialogRef.close();
  }

  showAvailableTags() {
    this.availableTags = this.allTags.filter((tag) => !this.selectedTags.includes(tag));
  }

  searchTags(event: any) {
    const query = event.query.toLowerCase().trim();

    if (!query) {
      this.showAvailableTags();
      return;
    }

    // Filter existing tags that match the query and are not already selected
    this.availableTags = this.allTags.filter((tag) => tag.toLowerCase().includes(query) && !this.selectedTags.includes(tag));

    // Check if the query exactly matches any existing tag
    const exactMatch = this.allTags.some((tag) => tag.toLowerCase() === query);

    // If no exact match exists and query is not empty and not already selected, add the new tag option
    if (!exactMatch && !this.selectedTags.includes(event.query)) {
      this.availableTags.push(event.query);
    }
  }

  clearAllTags() {
    this.selectedTags = [];
    this.showAvailableTags();
  }
}
