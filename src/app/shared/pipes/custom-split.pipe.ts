import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customSplit',
  standalone: true,
})
@Injectable({ providedIn: 'root' })
export class CustomSplit implements PipeTransform {
  transform(val: any, splitParam: string): [] {
    return val.split(splitParam);
  }
}
