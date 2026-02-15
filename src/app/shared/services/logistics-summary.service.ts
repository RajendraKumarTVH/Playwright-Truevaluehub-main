import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { ContainerSize } from '../models/container-size.model';
import { FreightCostRequestDto, ManualFreightCostRequestDto } from '../models/freight-cost-request';
import { FreightCostResponseDto } from '../models/freight-cost-response';
import { LogisticsCostRequest, LogisticsCostResponse, LogisticsRateCard, LogisticsSummaryDto } from '../models/logistics-summary.model';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { LogisticsMapDto } from '../models/logistics-map.model';

@Injectable({
  providedIn: 'root',
})
export class LogisticsSummaryService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  saveSummaryInfo(logisticsInfo: LogisticsSummaryDto) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/Logistics`;
    return this.postEx<LogisticsSummaryDto, LogisticsSummaryDto>(url, httpOptions, logisticsInfo).pipe(catchError(this.handleError<LogisticsSummaryDto>('saveSummaryInfo')));
  }

  fetchLogisticsrateCardCost(containerType: number, originCountryId: number, destinationCountryId: number) {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/Logistics/Rate/${containerType}/${originCountryId}/${destinationCountryId}`;
    return this.getMasterEx<string>(url, httpOptions).pipe(catchError(this.handleError<number>('fetchLogisticsrateCardCost')));
  }

  getFreightCost(request: FreightCostRequestDto): Observable<FreightCostResponseDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/Logistics/external`;
    return this.postMasterEx<FreightCostResponseDto, FreightCostRequestDto>(url, httpOptions, request).pipe(catchError(this.handleError<FreightCostResponseDto>('getFreightCost')));
  }
  calcLogisticsCost(box: any, isNoPalletization: boolean, partPerPallet: number, partWeight: number, containerType: string, lotSize: number): any {
    const length = Number(box[0]);
    const width = Number(box[1]);
    const height = Number(box[2]);
    let maxPallets = 0;
    let actualPartsPerPallet = 0;
    let o20FtCont = 0;
    let o40FtCont = 0;

    if (!isNoPalletization) {
      if (Math.floor(((5895 * 2350 * 2392.0001) / (length * width * (height + 100))) * 0.8) <= Math.floor(21000000 / (partPerPallet * partWeight))) {
        o20FtCont = Math.floor(((5895 * 2350 * 2392.000001) / (length * width * (height + 100))) * 0.8);
      } else {
        o20FtCont = Math.floor(21000000 / (partPerPallet * partWeight));
      }

      if (Math.floor(((12022 * 2350 * 2392.0001) / (length * width * (height + 100))) * 0.8) <= Math.floor(21000000 / (partPerPallet * partWeight))) {
        o40FtCont = Math.floor(((12022 * 2350 * 2392.000001) / (length * width * (height + 100))) * 0.8);
      } else {
        o40FtCont = Math.floor(21000000 / (partPerPallet * partWeight));
      }

      // let rndbatchQty = Math.ceil(lotSize / partPerPallet) * partPerPallet;

      if (containerType == '20') {
        maxPallets = o20FtCont;
      } else if (containerType == '40') {
        maxPallets = o40FtCont;
      } else {
        maxPallets = 1;
      }

      actualPartsPerPallet = Math.ceil(lotSize / partPerPallet);
    } else {
      if (Math.floor(((5895 * 2350 * 2392.0001) / (length * width * (height + 100))) * 0.8) <= Math.floor(21000000 / (partPerPallet * partWeight))) {
        o20FtCont = Math.floor(((5895 * 2350 * 2392.000001) / (length * width * (height + 100))) * 0.8);
      } else {
        o20FtCont = Math.floor(21000000 / (partPerPallet * partWeight));
      }

      if (Math.floor(((12022 * 2350 * 2392.0001) / (length * width * (height + 100))) * 0.8) <= Math.floor(21000000 / (partPerPallet * partWeight))) {
        o40FtCont = Math.floor(((12022 * 2350 * 2392.000001) / (length * width * (height + 100))) * 0.8);
      } else {
        o40FtCont = Math.floor(21000000 / (partPerPallet * partWeight));
      }

      if (containerType == '20') {
        maxPallets = o20FtCont;
      } else if (containerType == '40') {
        maxPallets = o40FtCont;
      } else {
        maxPallets = 1;
      }

      // let rndbatchQty = Math.ceil(lotSize / partPerPallet) * partPerPallet;
      actualPartsPerPallet = Math.ceil(lotSize / partPerPallet);

      actualPartsPerPallet = partPerPallet * maxPallets;
    }

    return Math.min(...[maxPallets, actualPartsPerPallet]);
  }

  // getDirections(originCity: string, destinationCity: string, originCountryId: number, destinationCountryId: number, modeOfTransportId?: number, srcCoord?: string, destCoord?: string) {
  //   const httpOptions = this.createOptions('get');
  //   const url =
  //     `/api/master/Logistics/distance-time?originCity=` +
  //     originCity +
  //     '&destinationCity=' +
  //     destinationCity +
  //     '&originCountryId=' +
  //     originCountryId +
  //     '&destinationCountryId=' +
  //     destinationCountryId +
  //     '&modeOfTransportId=' +
  //     modeOfTransportId +
  //     '&sourceCoord=' +
  //     srcCoord +
  //     '&destCoord=' +
  //     destCoord;
  //   return this.getMasterEx<LogisticsMapDto>(url, httpOptions).pipe(catchError(this.handleError<LogisticsMapDto>('getDirections')));
  // }
  getDirections(
    originCity: string,
    destinationCity: string,
    originCountryId: number,
    destinationCountryId: number,
    modeOfTransportId?: number,
    srcCoord?: string,
    destCoord?: string,
    supplierId?: number,
    buId?: number
  ) {
    const httpOptions = this.createOptions('get');
    const url =
      `/api/costing/Logistics/distance-time?originCity=` +
      originCity +
      '&destinationCity=' +
      destinationCity +
      '&originCountryId=' +
      originCountryId +
      '&destinationCountryId=' +
      destinationCountryId +
      '&modeOfTransportId=' +
      modeOfTransportId +
      '&sourceCoord=' +
      srcCoord +
      '&destCoord=' +
      destCoord +
      '&supplierId=' +
      supplierId +
      '&buId=' +
      buId;
    return this.getEx<LogisticsMapDto>(url, httpOptions).pipe(catchError(this.handleError<LogisticsMapDto>('getDirections')));
  }

  getOfflineFreightCost(request: ManualFreightCostRequestDto): Observable<FreightCostResponseDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/Logistics/freight-cost`;
    return this.postMasterEx<FreightCostResponseDto, ManualFreightCostRequestDto>(url, httpOptions, request).pipe(catchError(this.handleError<FreightCostResponseDto>('getOfflineFreightCost')));
  }

  getDefaultModeOfTransport(originCountryId: number, destinationCountryId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/Logistics/default-transport?originCountryId=` + originCountryId + `&destinationCountryId=` + destinationCountryId;
    return this.getMasterEx<number>(url, httpOptions).pipe(catchError(this.handleError<number>('getDefaultModeOfTransport')));
  }

  getContainerSize() {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/Logistics/container-size`;
    return this.getMasterEx<ContainerSize[]>(url, httpOptions).pipe(catchError(this.handleError<ContainerSize[]>('getContainerSize')));
  }
  getLogisticsSummary(partInfoId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/Logistics/` + partInfoId;
    return this.getEx<LogisticsSummaryDto>(url, httpOptions).pipe(catchError(this.handleError<LogisticsSummaryDto>('getLogisticsSummary')));
  }

  getLogisticsRateCards(originCountryId: number, destinationCountryId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/Logistics/rate-cards?originCountryId=` + originCountryId + `&destinationCountryId=` + destinationCountryId;
    return this.getMasterEx<LogisticsRateCard[]>(url, httpOptions).pipe(catchError(this.handleError<number>('getLogisticsRateCards')));
  }

  deleteLogisticInfo(partInfoId: number) {
    const httpOptions = this.createOptions('delete');
    const url = `/api/costing/Logistics/delete?partInfoId=${partInfoId}`;
    return this.deleteEx<LogisticsSummaryDto>(url, httpOptions).pipe(catchError(this.handleError<LogisticsSummaryDto>('deleteLogistics')));
  }

  getBulkLogisticsCost(request: LogisticsCostRequest): Observable<LogisticsCostResponse[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/Logistics/bulk-logistics-cost`;
    return this.postMasterEx<LogisticsCostResponse[], LogisticsCostRequest>(url, httpOptions, request).pipe(catchError(this.handleError<LogisticsCostResponse[]>('getBulkLogisticsCost')));
  }
}
