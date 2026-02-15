import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'feetToMm',
})
@Injectable({ providedIn: 'root' })
export class FeetToMmPipe implements PipeTransform {
  transform(value: number): number {
    // 1 foot = 304.8 millimeters
    return value * 304.8;
  }
}
