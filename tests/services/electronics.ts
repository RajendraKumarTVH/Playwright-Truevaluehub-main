
import { ResultData } from 'src/app/shared/models';
import { CPHMachineData } from 'src/app/shared/models/cost-cphplacemachine.model';
import { Assumption } from 'src/app/shared/models/costing-assumption.model';
import { EeConversionCost, EeConversionCostResult } from 'src/app/shared/models/ee-conversion-cost.model';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';


export class ElectronicsService extends BaseHttpService {
  constructor(

    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getMouseBite(area: any) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/Electronics/GetMouseBiteValue?area=${area}`;
    return this.getMasterEx<number>(url, httpOptions).pipe(catchError(this.handleError<number>('getMouseBite')));
  }

  getMachineData() {
    //to be implemented
    const httpOptions = this.createOptions('get');
    const url = `/api/master/Electronics`;
    return this.getMasterEx<CPHMachineData[]>(url, httpOptions).pipe(catchError(this.handleError<CPHMachineData[]>('getMachineData')));
  }

  getAssumptionData() {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/Electronics/GetAssumptions`;
    return this.getMasterEx<Assumption[]>(url, httpOptions).pipe(catchError(this.handleError<Assumption[]>('getAssumptionData')));
  }

  getMHRRate(machineDesc: any, country: any, shift: any) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/Electronics/GetMHRByCountryandDesc?MachinDescription=${machineDesc}&Country=${country}&Shift=${shift}`;
    return this.getMasterEx<number>(url, httpOptions).pipe(catchError(this.handleError<number>('getMHRRate')));
  }

  getLHRRate(region: any, labourTypeId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/LaborRate/GetLaborRateByRegionAsync?region=${region}&labourTypeId=${labourTypeId}`;
    return this.getMasterEx<number>(url, httpOptions).pipe(catchError(this.handleError<number>('getLHRRate')));
  }

  getResultData() {
    return from(ResultData);
  }

  saveEeConversionCost(request: EeConversionCost) {
    const httpOptions = this.createOptions('post');
    const url = `/api/Costing/ConversionCost/save`;
    return this.postEx<EeConversionCost, EeConversionCost>(url, httpOptions, request).pipe(catchError(this.handleError<EeConversionCost>('saveEeConversionCost')));
  }

  getConversionCostResult(conversionCostId: number): Observable<EeConversionCostResult[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/Costing/ConversionCost/GetResult/` + conversionCostId;
    return this.getEx<EeConversionCostResult[]>(url, httpOptions).pipe(catchError(this.handleError<EeConversionCostResult[]>('getConversionCostResult')));
  }

  saveEeConversionCostResult(request: EeConversionCostResult[]) {
    const httpOptions = this.createOptions('post');
    const url = `/api/Costing/ConversionCost/SaveResult`;
    return this.postEx<EeConversionCostResult[], EeConversionCostResult[]>(url, httpOptions, request).pipe(catchError(this.handleError<EeConversionCostResult[]>('saveEeConversionCostResult')));
  }
}
