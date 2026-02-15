import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mmToInches',
})
@Injectable({ providedIn: 'root' })
export class MmToInchesPipe implements PipeTransform {
  transform(value: number): number {
    // 1 millimeter = 0.0393701 inches
    // 1 inch = 25.4 millimeters
    // return value * 0.0393701;
    return value / 25.4;
  }
}
