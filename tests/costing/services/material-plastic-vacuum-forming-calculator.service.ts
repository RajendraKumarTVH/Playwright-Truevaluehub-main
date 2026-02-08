import { Injectable } from '@angular/core';
import { MaterialInfoDto } from 'src/app/shared/models';

@Injectable({
  providedIn: 'root',
})
export class MaterialPlasticVacuumFormingCalculatorService {
  public calculationsForPlasticVacuumForming(materialInfo: MaterialInfoDto): MaterialInfoDto {
    return materialInfo;
  }
}
