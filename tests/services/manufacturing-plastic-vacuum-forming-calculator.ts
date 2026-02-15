import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';


export class ManufacturingPlasticVacuumFormingCalculatorService {
  constructor(private shareService: SharedService) { }
  public doCostCalculationsForPlasticVacuumForming(manufactureInfo: ProcessInfoDto): ProcessInfoDto {
    return manufactureInfo;
  }
}
