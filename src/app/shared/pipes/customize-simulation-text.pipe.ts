import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customizeSimulationText',
  standalone: true,
})
@Injectable({ providedIn: 'root' })
export class CustomizeSimulationTextPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    else if (value.includes('Esg')) {
      return value + ' (CO2 Kg)';
    } else if (value.includes('Cost')) {
      return value + ' ($)';
    }
    return value;
  }
}
