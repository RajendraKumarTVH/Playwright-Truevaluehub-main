import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CastingConfigService {
  castingConstants = {
    finalCavitiesPerTree: 8,
    dipTimePerCoating: 40,
  };
}
