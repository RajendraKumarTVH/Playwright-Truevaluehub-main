import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';

@Injectable({
  providedIn: 'root',
})
export class RigidFlexMaterialConfigService {
  constructor(public sharedService: SharedService) {}

  getRigidFlexTechnologies() {
    return [
      { id: 1, name: '2 LAYER RF (1R+1F)' },
      { id: 2, name: '3 LAYER RF (1R+1F+1R)' },
      { id: 3, name: '3 LAYER (1R+2F)' },
      { id: 4, name: '4 LAYER RF (1R+2F+1R)' },
      { id: 5, name: '4 LAYER RF (1F+2R+1R)' },
      { id: 6, name: '5 LAYER RF (1R+3F+1R)' },
      { id: 7, name: '6 LAYER RF (2R+2F+2R)' },
      { id: 8, name: '6 LAYER RF (1R+1R+2F+1R+1R)' },
      { id: 9, name: '8 LAYER (2R+2F+2F+2R)' },
      { id: 10, name: '8 LAYER RF (1R+2R+2F+2R+1R)' },
      { id: 11, name: '8 LAYER RF (1R+1R+1R+2F+1R+1R+1R)' },
      { id: 12, name: '9 LAYER RF (2R+1R+3F+1R+2R)' },
      { id: 13, name: '10 LAYER RF (2R+2R+2F+2R+2R)' },
      { id: 14, name: '10 LAYER RF (1R+1R+1R+1F+1F+1F+1F+1R+1R+1R)' },
      { id: 15, name: '12 LAYER RF (1R+1R+2R+2F+2F+2R+1R+1R)' },
    ];
  }
}
