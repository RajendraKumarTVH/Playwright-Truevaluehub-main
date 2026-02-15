import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mmToMeters',
})
@Injectable({ providedIn: 'root' })
export class MmToMetersPipe implements PipeTransform {
  transform(value: number): number {
    // 1 millimeter = 0.001 meters
    // 1 meter = 1000 millimeters
    // return value * 0.001;
    return value / 1000;
  }
}
