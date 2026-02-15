import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelcaseToWords',
  standalone: true,
})
@Injectable({ providedIn: 'root' })
export class CamelcaseToWordsPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    // Replace uppercase letters with a space followed by the lowercase letter
    const spaced = value.replace(/([A-Z])/g, ' $1');
    // Capitalize the first letter and trim any leading/trailing spaces
    const capitalized = spaced.charAt(0).toUpperCase() + spaced.slice(1).trim();
    return capitalized;
  }
}
