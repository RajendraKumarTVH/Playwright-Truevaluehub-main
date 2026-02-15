import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NumberConversionService {
  transformNumberToFourDecimal(value: number) {
    if (value && !Number.isNaN(value)) return value.toFixed(4);
    else {
      return 0;
    }
  }

  transformNumberTwoDecimal(value: number) {
    if (value && !Number.isNaN(value) && value > 0) return value.toFixed(2);
    else {
      return 0;
    }
  }

  transformNumberRemoveDecimals(value: number) {
    if (value && !Number.isNaN(value) && value > 0) return Number(value.toFixed(0));
    else {
      return 0;
    }
  }

  isValidNumber(value: any): number {
    return !value || Number.isNaN(value) || !Number.isFinite(Number(value)) || value < 0 ? 0 : value;
  }

  roundUp = (num: number): number => Math.ceil(num);
  roundDnNum = (num: number): number => Math.round(num);
}
