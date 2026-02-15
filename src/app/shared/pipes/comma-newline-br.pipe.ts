import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commaNewlineBr',
  standalone: true,
})
export class CommaNewlineBrPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/,/g, '<br>');
  }
}
