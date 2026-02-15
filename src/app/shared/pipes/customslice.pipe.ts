import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customslice',
})
@Injectable({ providedIn: 'root' })
export class CustomSlice implements PipeTransform {
  transform(val: any, length: number): string {
    return val.length > length ? `${val.substring(0, length)} ...` : val;
  }
}
