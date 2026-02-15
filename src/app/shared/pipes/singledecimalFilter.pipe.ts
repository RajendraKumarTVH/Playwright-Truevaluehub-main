import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'singledecimalFilter',
})
@Injectable({ providedIn: 'root' })
// export class DecimalFilterPipe implements PipeTransform {
//     transform(event: any) {
//          ;
//         const reg = /^-?\d*(\.\d{0,4})?$/;

//         let input = event.toFixed(2);
//         return input;
//         // if (!reg.test(input)) {
//         //     event.preventDefault();
//         // }
//     }
// }
export class SingleDecimalFilterPipe implements PipeTransform {
  transform(value: number) {
    let ret;
    if (value && !Number.isNaN(value) && value > 0) {
      ret = value.toFixed(1);
    } else {
      ret = value;
    }
    return ret;
  }
}
