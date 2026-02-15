import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mToMm',
})
@Injectable({ providedIn: 'root' })
export class MToMmPipe implements PipeTransform {
  transform(value: number): number {
    // 1 meter = 1000 millimeters
    return value * 1000;
  }
}
