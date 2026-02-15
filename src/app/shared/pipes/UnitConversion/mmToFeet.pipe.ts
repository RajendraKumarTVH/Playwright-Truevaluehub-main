import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mmToFeet',
})
@Injectable({ providedIn: 'root' })
export class MmToFeetPipe implements PipeTransform {
  transform(value: number): number {
    // 1 millimeter = 0.00328084 feet
    // 1 foot = 304.8 millimeters
    // return value * 0.00328084;
    return value / 304.8;
  }
}
