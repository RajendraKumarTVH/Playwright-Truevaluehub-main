import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mmToCm',
})
@Injectable({ providedIn: 'root' })
export class MmToCmPipe implements PipeTransform {
  transform(value: number): number {
    // 1 millimeter = 0.1 centimeters
    // 1 centimeter = 10 millimeters
    // return value * 0.1;
    return value / 10;
  }
}
