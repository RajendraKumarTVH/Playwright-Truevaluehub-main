import { Injectable, signal } from '@angular/core';
import { DocumentConversion } from '../models/document-conversion.model';

@Injectable({
  providedIn: 'root',
})
export class SharedSignalsService {
  private _partImages = signal<DocumentConversion[]>([]);
  public openCadViewer = signal<{ [key: string]: string }>({ caller: 'bom-details' });
  // images = this._images.asReadonly();

  setImages(images: DocumentConversion[]): void {
    this._partImages.set(images);
  }
  getThumbnailByPartInfoId(partInfoId: number): string {
    const doc = this._partImages().find((d) => d.partInfoId === partInfoId);
    if (doc?.thumbnailImage) {
      return `data:image/jpeg;base64,${doc.thumbnailImage}`;
    }
    return 'assets/images/no-image-available.png';
  }
}
