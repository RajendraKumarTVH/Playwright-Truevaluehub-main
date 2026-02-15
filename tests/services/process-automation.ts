
import { SharedService } from './shared';
import { MedbMasterService } from 'src/app/shared/services';


export class ProcessAutomationService {
  constructor(
    private shareService: SharedService,
    private medbMasterService: MedbMasterService
  ) { }
}
