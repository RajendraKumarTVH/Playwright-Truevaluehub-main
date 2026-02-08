import { Injectable } from '@angular/core';
import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingPlasticVacuumFormingCalculatorService {
  constructor(private shareService: SharedService) {}
  public doCostCalculationsForPlasticVacuumForming(manufactureInfo: ProcessInfoDto): ProcessInfoDto {
    return manufactureInfo;
  }
}
