import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inchesToMm',
})
@Injectable({ providedIn: 'root' })
export class InchesToMmPipe implements PipeTransform {
  transform(value: number): number {
    // 1 inch = 25.4 millimeters
    return value * 25.4;
  }
}
