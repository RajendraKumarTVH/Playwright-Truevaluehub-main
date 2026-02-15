import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newlineBr',
  standalone: true,
})
@Injectable({ providedIn: 'root' })
export class NewlineBrPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/\n/g, '<br />');
  }
}
