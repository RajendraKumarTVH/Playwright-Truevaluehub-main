import { DrillingCutting } from 'src/app/shared/models/drilling-cutting.model';
import { FacingDto } from 'src/app/shared/models/facing-info.model';
import { ForgingLookupDto } from 'src/app/shared/models/forging.model';
// import { GroovingLookupDto } from 'src/app/shared/models/grooving-lookup.model';
import { Boring, BoringDto } from 'src/app/shared/models/machining-boring.model';
import { EndMilling } from 'src/app/shared/models/machining-end-milling.model';
import { Milling } from 'src/app/shared/models/machining-milling.model';
import { GearCutting } from 'src/app/shared/models/machining-gearcutting.model';
import { Grinding } from 'src/app/shared/models/machining-grinding.model';
import { SlotMilling } from 'src/app/shared/models/machining-slotmilling.model';
import { TappingLookupDto } from 'src/app/shared/models/machining-tapping.model';
import { MigWeldingLookupDto } from 'src/app/shared/models/migLookup.model';
import { PartingCuttingDto } from 'src/app/shared/models/parting-cutting.modal';
import { FormingTime, ThermoForming } from 'src/app/shared/models/thermo-forming.models';
import { TurningInfoDto } from 'src/app/shared/models/turning-info.model';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';


export class MachiningService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getDrillingCuttingSpeed(): Observable<DrillingCutting[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/drillingspeedfeed`;
    return this.getMasterEx<DrillingCutting[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getDrillingCuttingSpeed')));
  }

  getCuttingSpeedForParting(typeId: number = 0): Observable<PartingCuttingDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/materialId/${typeId}/partinglookup`;
    return this.getMasterEx<PartingCuttingDto[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getCuttingSpeedForParting')));
  }

  getTurningLookupByMaterial(materialId: number = 0): Observable<TurningInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/materialId/${materialId}/turninglookup`;
    return this.getMasterEx<TurningInfoDto[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getTurningLookupByMaterial')));
  }

  getFacingLookupByMaterial(materialId: number = 0): Observable<FacingDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/materialId/${materialId}/facinglookup`;
    return this.getMasterEx<FacingDto[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getFacingLookupByMaterial')));
  }

  // getGroovingLookupByMaterial(materialId: number = 0): Observable<GroovingLookupDto[]> {
  //   const httpOptions = this.createOptions('get');
  //   const url = `/api/master/ProcessMaster/materialId/${materialId}/groovinglookup`;
  //   return this.getMasterEx<GroovingLookupDto[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getGroovingLookupByMaterial')));
  // }

  getMillingLookupByMaterial(): Observable<Milling[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/millinglookup`;
    return this.getMasterEx<Milling[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getMillingLookupByMaterial')));
  }

  getBoringLookupByMaterial(): Observable<Boring[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/boringlookup`;
    return this.getMasterEx<Boring[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getBoringLookupByMaterial')));
  }

  getSlotMillingLookupByMaterial(): Observable<SlotMilling[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/slotmillinglookup`;
    return this.getMasterEx<SlotMilling[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getSlotMillingLookupByMaterial')));
  }
  getEndMillingLookupByMaterial(): Observable<EndMilling[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/endmillinglookup`;
    return this.getMasterEx<EndMilling[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getEndMillingLookupByMaterial')));
  }

  getGrindingLookup(): Observable<Grinding[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/grindinglookup`;
    return this.getMasterEx<Grinding[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getGrindingLookup')));
  }

  getGearCuttingLookup(): Observable<GearCutting[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/gearcuttinglookup`;
    return this.getMasterEx<GearCutting[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getGearCuttingLookup')));
  }

  getGetMigLookup(): Observable<MigWeldingLookupDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/weldinglookup/GetMigLookup`;
    return this.getMasterEx<MigWeldingLookupDto[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getGetMigLookup')));
  }

  getForgingLookup(): Observable<ForgingLookupDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/forginglookup/GetForgingLookup`;
    return this.getMasterEx<ForgingLookupDto[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getForgingLookup')));
  }

  getBoringCuttingSpeed(): Observable<BoringDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/drillingspeedfeed`;
    return this.getMasterEx<BoringDto[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getBoringCuttingSpeed')));
  }

  getTappingCuttingSpeed(): Observable<TappingLookupDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/drillingspeedfeed`;
    return this.getMasterEx<TappingLookupDto[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getTappingCuttingSpeed')));
  }

  getThermoFormingLookup(): Observable<ThermoForming[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/thermoforminglookup`;
    return this.getMasterEx<ThermoForming[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getThermoFormingLookup')));
  }
  getFormingTimeLookup(): Observable<FormingTime[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/thermoformingtime`;
    return this.getMasterEx<FormingTime[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getFormingTimeLookup')));
  }

  updatePlaneOnModel(partInfo: number, projectId: number, shapeId: number) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/CNCPlaneModel/updatePlaneOnCNCModel/${partInfo}/${projectId}/${shapeId}`;
    return this.postEx<boolean, unknown>(url, httpOptions, {}).pipe(catchError(this.handleError<unknown>('UpdatePlaneOnModel')));
  }
}
