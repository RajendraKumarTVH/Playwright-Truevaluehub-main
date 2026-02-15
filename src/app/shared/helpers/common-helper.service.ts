import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonHelperService {
  public isNotEmpty(res: any): boolean {
    if (Array.isArray(res)) {
      return res.length > 0;
    }
    if (res != null && typeof res === 'object') {
      return Object.keys(res).length > 0;
    }
    if (typeof res === 'string') {
      return res.trim().length > 0;
    }
    return !!res && res !== undefined;
  }
}
