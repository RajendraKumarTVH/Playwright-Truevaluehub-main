import { Injectable } from '@angular/core';
import { FileFormat } from '../models/part-info.model';

@Injectable({
  providedIn: 'root',
})
export class FileValidatorService {
  isValidFileFormat(fileName: string): boolean {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return Object.values(FileFormat).includes(fileExtension as FileFormat);
  }
}
