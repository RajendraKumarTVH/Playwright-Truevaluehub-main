import { Injectable } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';

@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  constructor(private imageCompress: NgxImageCompressService) {}

  compressImageFile(image: any) {
    return this.imageCompress
      .compressFile(image, -1, 100, 100, 400, 400)
      .then((result: any) => {
        return result;
      })
      .catch(() => {
        // this.logger.error('image inable to compress' + " "+ x);
        return image;
      });
  }
}
