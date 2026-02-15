import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AiSearchListTileDto } from 'src/app/modules/ai-search/models/ai-image-similarity-result';
import { UserModel } from 'src/app/modules/settings/models';
@Component({
  selector: 'app-similarity-search',
  imports: [CommonModule, MatIconModule],
  templateUrl: './similarity-search.component.html',
  styleUrls: ['./similarity-search.component.scss'],
})
export class SimilaritySearchComponent {
  @Input() similaritySearchPart?: AiSearchListTileDto;
  @Input() users: UserModel[] = [];
  @Output() closeSimilaritySearchEvent = new EventEmitter<void>();

  onImageViewChange(item: any, _dir: 'next' | 'prev' = 'next') {
    if (!item?.imgThumbnailData || !item.pdfThumbnailData) {
      return;
    }
    item.imageShowing = item.imageShowing === 'cad' ? 'pdf' : 'cad';
  }

  setImageView(item: any, view: 'cad' | 'pdf') {
    if (!item) {
      return;
    }
    item.imageShowing = view;
  }

  closeSimilaritySearch() {
    this.similaritySearchPart = undefined;
    this.closeSimilaritySearchEvent.emit();
  }

  getUserName(userId: number): string {
    const user = this.users.find((x) => x.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}
