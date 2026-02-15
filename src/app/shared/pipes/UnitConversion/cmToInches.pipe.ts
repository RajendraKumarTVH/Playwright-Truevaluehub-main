import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cmToInches',
})
@Injectable({ providedIn: 'root' })
export class CmToInchesPipe implements PipeTransform {
  transform(value: number): number {
    // 1 centimeter = 0.393701 inches
    // 1 inch = 2.54 centimeters
    // return value * 0.393701;
    return value / 2.54;
  }
}
