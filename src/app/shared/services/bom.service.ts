import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { BillOfMaterialDto } from '../models';
import { BomTreeModel } from '../models/bom-tree-viewmodel';
import { CostPriceBookDto } from '../models/costPrice-book.model';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { AddBomDto } from '../models/add-bom.model';
import { ViewCostingCompletion } from '../models/view-costing-completion';
import { BomCostSummaryDto } from '../models/bom-cost-summary-dto';
import { DocumentConversion } from '../models/document-conversion.model';

@Injectable({ providedIn: 'root' })
export class BomService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getBomsByProjectId(projectInfoId: number): Observable<BillOfMaterialDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/BillOfMaterial/${projectInfoId}/bomdetails`;
    return this.getEx<BillOfMaterialDto[]>(url, httpOptions).pipe(catchError(this.handleError<BillOfMaterialDto[]>('getBomsByProjectId')));
  }
  getPercentageCompletionByPartInfoId(partInfoId: number): Observable<ViewCostingCompletion> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/BillOfMaterial/partInfo/${partInfoId}/percentageCompletion`;
    return this.getEx<ViewCostingCompletion>(url, httpOptions).pipe(catchError(this.handleError<ViewCostingCompletion>('getPercentageCompletionByPartInfoId')));
  }

  getBomsTreeByProjectId(projectInfoId: number, scenarioId: number): Observable<BomTreeModel[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/BillOfMaterial/${projectInfoId}/bomTreedetails/${scenarioId}`;
    return this.getEx<BomTreeModel[]>(url, httpOptions).pipe(catchError(this.handleError<BomTreeModel[]>('getBomsTreeByProjectId')));
  }

  getBomsTreeCostSummaryByProjectId(projectInfoId: number, scenarioId: number): Observable<BomCostSummaryDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/BillOfMaterial/${projectInfoId}/bomCostSummary/${scenarioId}`;
    return this.getEx<BomCostSummaryDto>(url, httpOptions).pipe(catchError(this.handleError<BomCostSummaryDto>('getBomsTreeCostSummaryByProjectId')));
  }

  updateBom(bomId: number, bom: BillOfMaterialDto): Observable<BillOfMaterialDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/BillOfMaterial/${bomId}/update`;
    return this.putEx<BillOfMaterialDto, BillOfMaterialDto>(url, httpOptions, bom).pipe(catchError(this.handleError<BillOfMaterialDto>('updateBom')));
  }

  getBoardLoadedComponents(projecttInfoId: number, partInfoId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/BillOfMaterial/${projecttInfoId}/getBoardLoadedComponents/${partInfoId}`;
    return this.getEx<BillOfMaterialDto[]>(url, httpOptions).pipe(catchError(this.handleError<BillOfMaterialDto[]>('getBoardLoadedComponents')));
  }

  bulkUpdateOrCreateBOMInfo(bomInfo: BillOfMaterialDto[]): Observable<BillOfMaterialDto[]> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/BillOfMaterial/BulkUpdate`;
    return this.putEx<BillOfMaterialDto[], BillOfMaterialDto[]>(url, httpOptions, bomInfo).pipe(catchError(this.handleError<BillOfMaterialDto[]>('bulkUpdateOrCreateBOMInfo')));
  }

  createOrUpdateCostPriceBook(cPDto: CostPriceBookDto): Observable<CostPriceBookDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/CotsPriceBook/create`;
    return this.postEx<CostPriceBookDto, CostPriceBookDto>(url, httpOptions, cPDto).pipe(catchError(this.handleError<CostPriceBookDto>('updateCostPriceBook')));
  }

  addBillOfMaterial(addPartInfoDto: AddBomDto): Observable<AddBomDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/BillOfMaterial/addBillOfMaterial`;
    return this.postEx<AddBomDto, AddBomDto>(url, httpOptions, addPartInfoDto).pipe(catchError(this.handleError<AddBomDto>('addBillOfMaterial')));
  }

  addNewBillOfMaterial(addPartInfoDto: AddBomDto): Observable<AddBomDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/BillOfMaterial/addNewBillOfMaterial`;
    return this.postEx<AddBomDto, AddBomDto>(url, httpOptions, addPartInfoDto).pipe(catchError(this.handleError<AddBomDto>('addNewBillOfMaterial')));
  }

  removeBillOfMaterial(bomId: number) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/BillOfMaterial/deletebom/${bomId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<boolean>('deletebom')));
  }

  removeSingleBillOfMaterial(bomId: number) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/BillOfMaterial/deletesinglebom/${bomId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<boolean>('deletesinglebom')));
  }

  getImageViewByMultiplePartInfoIds(partInfoIds: number[]): Observable<DocumentConversion[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/DocumentConversion/byPartIds`;
    return this.postEx<DocumentConversion[], number[]>(url, httpOptions, partInfoIds).pipe(catchError(this.handleError<DocumentConversion[]>('getImageViewByMultiplePartInfoIds')));
  }

  bulkDeleteBOMInfo(bomInfo: number[]): Observable<number[]> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/BillOfMaterial/BulkDelete`;
    return this.putEx<number[], number[]>(url, httpOptions, bomInfo).pipe(catchError(this.handleError<number[]>('bulkUpdateOrCreateBOMInfo')));
  }
}
