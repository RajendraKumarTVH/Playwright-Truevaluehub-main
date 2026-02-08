import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
// import { MaterialInfoDto } from 'src/app/shared/models';

@Injectable({
  providedIn: 'root',
})
export class MaterialBrazingCalculatorService {
  constructor(private shareService: SharedService) {}
  // public calculationsForBrazing(materialInfo: MaterialInfoDto, fieldColorsList: any, selectedMaterialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
  //   return new Observable((obs) => {
  //     obs.next(materialInfo);
  //   });
  // }
}
