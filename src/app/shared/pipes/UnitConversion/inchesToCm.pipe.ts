import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inchesToCm',
})
@Injectable({ providedIn: 'root' })
export class InchesToCmPipe implements PipeTransform {
  transform(value: number): number {
    // 1 inch = 2.54 centimeters
    return value * 2.54;
  }
}
