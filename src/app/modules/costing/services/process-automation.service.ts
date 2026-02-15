import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { MedbMasterService } from 'src/app/shared/services';

@Injectable({
  providedIn: 'root',
})
export class ProcessAutomationService {
  constructor(
    private shareService: SharedService,
    private medbMasterService: MedbMasterService
  ) {}
}
