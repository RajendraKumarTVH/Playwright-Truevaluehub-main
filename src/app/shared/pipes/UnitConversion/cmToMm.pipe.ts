import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cmToMm',
})
@Injectable({ providedIn: 'root' })
export class CmToMmPipe implements PipeTransform {
  transform(value: number): number {
    // 1 centimeter = 10 millimeters
    return value * 10;
  }
}
