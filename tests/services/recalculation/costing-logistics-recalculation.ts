import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { BuLocationDto, MaterialInfoDto, MaterialTypeDto, PartInfoDto } from 'src/app/shared/models';
import { FreightCostResponseDto } from 'src/app/shared/models/freight-cost-response';
import { LogisticsCostRequest, LogisticsCostResponse, LogisticsSummaryDto } from 'src/app/shared/models/logistics-summary.model';
import { LogisticsSummaryService } from 'src/app/shared/services/logistics-summary.service';
import { SharedService } from '../shared';
import { ScreeName } from 'src/app/modules/costing/costing.config';
import { ContainerSize } from 'src/app/shared/models/container-size.model';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { PackagingInfoDto } from 'src/app/shared/models/packaging-info.model';
import { Store } from '@ngxs/store';
import { MaterialTypeState } from 'src/app/modules/_state/material-type.state';
import { LogisticsSummaryState } from 'src/app/modules/_state/logistics-summary.state';
import { SupplierBuLocationState } from 'src/app/modules/_state/supplier-bu-location.state';
import { PackagingInfoState } from 'src/app/modules/_state/packaging-info.state';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import * as LogisticsSummaryActions from 'src/app/modules/_actions/logistics-summary.action';
import { MaterialCategory } from 'src/app/shared/enums';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { BuLocationService } from 'src/app/modules/data/Service/bu-location.service';
import { LogisticsSummaryCalculatorService } from 'src/app/modules/costing/services/logistics-summary-calculator.service';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';

@Injectable({
  providedIn: 'root',
})
export class CostingLogisticsRecalculationService {
  freightCost: FreightCostResponseDto;
  logisticsSummaryObj?: LogisticsSummaryDto;

  private logisticsSummaryService = inject(LogisticsSummaryService);
  private sharedService = inject(SharedService);
  private digitalFactoryService = inject(DigitalFactoryService);
  private _buLocationService = inject(BuLocationService);
  private _logisticsSummaryCalculatorService = inject(LogisticsSummaryCalculatorService);
  private materialInfoSignalService = inject(MaterialInfoSignalsService);
  private _store = inject(Store);
  dispatchMasterLoadingProgress = false;
  containerSize: ContainerSize[] = [];
  materialTypeMasterList: MaterialTypeDto[];
  materialTypeList: any[] = [];
  corrugatedBoxList: any[] = [];
  noCartonBoxId = 0;
  palletList: any[] = [];
  noPalletId = 0;
  vendorLocation: DigitalFactoryDtoNew[] = [];
  buLocation: BuLocationDto[] = [];

  _materialTypes$: Observable<MaterialTypeDto[]> = this._store.select(MaterialTypeState.getMaterialTypes);
  _containerSize$: Observable<ContainerSize[]> = this._store.select(LogisticsSummaryState.getContainerSize);
  _saveLogisticsSummary$: Observable<LogisticsSummaryDto> = this._store.select(LogisticsSummaryState.saveSummaryInfo);
  _supplierList$: Observable<DigitalFactoryDtoNew[]> = this._store.select(SupplierBuLocationState.getSupplierList);
  _buLocationList$: Observable<BuLocationDto[]> = this._store.select(SupplierBuLocationState.getBuLocationList);
  packgeInfoState$: Observable<PackagingInfoDto> = this._store.select(PackagingInfoState.getPackageInfo);

  constructor() {
    this.callDataInLoad();
  }

  callDataInLoad() {
    if (!this.dispatchMasterLoadingProgress) {
      this.dispatchMasterLoadingProgress = true;
      this.dispatchMasterData();
      // this.getMaterialInfoList();
      this.getContainerSize();
      this.getMaterial();
      this.getVendorLocation();
      this.getBuLocation();
      setTimeout(() => {
        this.dispatchMasterLoadingProgress = false;
      }, 6000);
    }
  }
  getVendorLocation() {
    this.digitalFactoryService.getAllDigitalFactorySuppliers().subscribe({
      next: (result: DigitalFactoryDtoNew[]) => {
        if (result && result?.length > 0) {
          this.vendorLocation = result;
        }
      },
    });

    this._supplierList$.subscribe((result) => {
      if (result && result?.length > 0) {
        this.vendorLocation = result;
      }
    });
  }

  getBuLocation() {
    this._buLocationService.getBuLocation().subscribe((result) => {
      if (result && result?.length) {
        this.buLocation = result;
      }
    });

    this._buLocationList$.subscribe((result) => {
      if (result && result?.length) {
        this.buLocation = result;
      }
    });
  }

  dispatchMasterData() {
    this._store.dispatch(new LogisticsSummaryActions.GetContainerSize());
    this._store.dispatch(new MasterDataActions.GetSupplierList());
    this._store.dispatch(new MasterDataActions.GetBuLocation());
  }
  getContainerSize() {
    this._containerSize$.subscribe((result: ContainerSize[]) => {
      if (result?.length > 0) {
        this.containerSize = result;
      }
    });
  }

  getMaterial() {
    this._materialTypes$.subscribe((result: MaterialTypeDto[]) => {
      if (result?.length > 0) {
        this.materialTypeMasterList = result;
        this.materialTypeList = this.materialTypeMasterList?.filter((x) => x.materialGroupId === MaterialCategory.Packaging);
        const corrugatedBoxid = this.materialTypeList?.filter((s: any) => s.materialTypeName?.toLowerCase().includes('carton'));
        if (corrugatedBoxid.length > 0) {
          const index = this.corrugatedBoxList?.findIndex((item: any) => item.materialDescription?.toLowerCase().includes('no corrugatedbox'));
          if (index > -1) {
            this.noCartonBoxId = this.corrugatedBoxList[index].materialMasterId;
            this.corrugatedBoxList.splice(index, 1);
          }
        }
        const palletid = this.materialTypeList?.filter((s: any) => s.materialTypeName?.toLowerCase().includes('pallet'));
        if (palletid?.length > 0) {
          this.palletList = this.materialTypeMasterList?.filter((x) => x.materialTypeId == palletid[0].materialTypeId);
          if (this.palletList) {
            const index = this.palletList?.findIndex((item: any) => item.materialDescription?.toLowerCase().includes('no palletization'));
            if (index > -1) {
              this.noPalletId = this.palletList[index].materialMasterId;
              this.palletList.splice(index, 1);
            }
          }
        }
      }
    });
  }

  private checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList.filter((x) => x.formControlName == formCotrolName && x.isDirty == true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }
  mapDataToFreightCost(result: LogisticsSummaryDto) {
    this.freightCost = new FreightCostResponseDto();
    this.freightCost.sourceToPortCost = result.pickUpCost;
    this.freightCost.pickUpCost = result.pickUpCost;
    this.freightCost.portCost = result.portCost;
    this.freightCost.portToDestinationCost = result.deliveryCost;
    this.freightCost.deliveryCost = result.deliveryCost;
    this.freightCost.pickUpCo2 = result.pickUpCo2;
    this.freightCost.co2 = result.portCo2;
    this.freightCost.deliveryCo2 = result.deliveryCo2;
    this.freightCost.totalAnnualCost = result.freightCost;
    this.freightCost.totalCost = result.freightCost;
    this.freightCost.route = result.route;
  }

  recalculateLogisticsCost(
    currentPart: PartInfoDto,
    materialList: MaterialInfoDto[],
    packagingObj: PackagingInfoDto,
    isCountryChanged: boolean
  ): Observable<{ LogisticsSummaryDto: LogisticsSummaryDto; isSuccess: boolean }> {
    if (currentPart.packingModeId != null && currentPart.packingModeId == 2) {
      packagingObj = new PackagingInfoDto();
    }

    return this.logisticsSummaryService.getLogisticsSummary(currentPart.partInfoId).pipe(
      take(1),
      switchMap((logisticSummary: LogisticsSummaryDto) => {
        this.mapDataToFreightCost(logisticSummary);
        this.logisticsSummaryObj = logisticSummary;
        const logistic = { ...logisticSummary };
        const logisticsId = logisticSummary?.costingLogisticsId || 0;

        return this.sharedService.getColorInfos(currentPart.partInfoId, ScreeName.Logistic, logisticsId).pipe(
          take(1),
          switchMap((logisticDirtyFields) => {
            if (isCountryChanged) {
              logisticDirtyFields = [];
            }

            const bulkRequest: LogisticsCostRequest = {
              originCountryId: currentPart.mfrCountryId,
              destinationCountryId: currentPart.deliveryCountryId,
              vendor: currentPart?.supplierInfoId ? this.vendorLocation.find((v) => v.supplierId === currentPart.supplierInfoId) : undefined,
              buLocation: currentPart?.buId ? this.buLocation.find((b) => b.buId === currentPart.buId) : undefined,
              containerSizes: this.containerSize,
              part: currentPart,
              materials: materialList,
              packaging: packagingObj,
              defaultMode: 1,
            };

            return this.logisticsSummaryService.getBulkLogisticsCost(bulkRequest).pipe(
              take(1),
              switchMap((bulkResults: LogisticsCostResponse[]) => {
                if (!bulkResults || bulkResults.length === 0) {
                  return of({ LogisticsSummaryDto: logisticSummary, isSuccess: false });
                }

                const validResults = bulkResults.filter((r) => r.freightCost?.totalCost > 0).sort((a, b) => a.freightCost.freightCostPerShipment - b.freightCost.freightCostPerShipment);

                if (validResults.length === 0) {
                  return of({ LogisticsSummaryDto: logisticSummary, isSuccess: false });
                }
                // pick first
                let lowCostTransportMode = validResults[0];
                const freightResult = lowCostTransportMode.freightCost;

                // TRANSPORT CHANGE LOGIC
                const shipmentType = logistic?.shipmentType;
                const containerType = logistic?.containerType;
                let isTransportChanged = false;

                if (isCountryChanged) {
                  isTransportChanged = true;
                } else {
                  const canFindMatch = !!shipmentType && !!containerType;

                  if (canFindMatch) {
                    const matched = lowCostTransportMode.rateCard && shipmentType === lowCostTransportMode.rateCard.shipmentTypeId && containerType === lowCostTransportMode.rateCard.containerTypeId;

                    if (!matched) {
                      isTransportChanged = true;
                    }
                  } else {
                    isTransportChanged = true;
                  }
                }
                const lowCostTransport: LogisticsSummaryDto = new LogisticsSummaryDto();

                if (!isTransportChanged) {
                  lowCostTransport.modeOfTransport = this.checkDirtyProperty('ModeOfTransport', logisticDirtyFields) ? logistic?.modeOfTransport : lowCostTransportMode.rateCard.modeOfTransportTypeId;

                  lowCostTransport.shipmentType = this.checkDirtyProperty('ShipmentType', logisticDirtyFields) ? logistic?.shipmentType : lowCostTransportMode.rateCard.shipmentTypeId;

                  lowCostTransport.containerType = this.checkDirtyProperty('ContainerType', logisticDirtyFields) ? logistic?.containerType : lowCostTransportMode.rateCard.containerTypeId;
                } else {
                  lowCostTransport.modeOfTransport = lowCostTransportMode.rateCard.modeOfTransportTypeId;
                  lowCostTransport.shipmentType = lowCostTransportMode.rateCard.shipmentTypeId;
                  lowCostTransport.containerType = lowCostTransportMode.rateCard.containerTypeId;
                }
                // MAP AVAILABLE FREIGHT COST FIELDS
                lowCostTransport.containerCost = freightResult.containerCost;
                lowCostTransport.containerPercent = freightResult.percentageOfShipment;
                lowCostTransport.freightCostPerShipment = freightResult.freightCostPerShipment;
                lowCostTransport.freightCost = freightResult.freightCostPerPart;

                lowCostTransport.pickUpCost = freightResult.sourceToPortCost;
                lowCostTransport.portCost = freightResult.portCost;
                lowCostTransport.deliveryCost = freightResult.portToDestinationCost;

                lowCostTransport.pickUpCo2 = freightResult.pickUpCo2;
                lowCostTransport.portCo2 = freightResult.co2;
                lowCostTransport.deliveryCo2 = freightResult.deliveryCo2;

                lowCostTransport.totalCarbonFootPrint = freightResult.totalCo2;
                lowCostTransport.carbonFootPrint = freightResult.totalCo2;
                lowCostTransport.carbonFootPrintPerUnit = freightResult.totalCo2 && freightResult.partsPerShipment ? freightResult.totalCo2 / freightResult.partsPerShipment : 0;

                lowCostTransport.route = freightResult.route;
                lowCostTransport.currentPart = currentPart;
                lowCostTransport.packagingInfo = packagingObj;

                // this.isRecalculate = true;
                this.freightCost = freightResult;
                // CONTINUE WITH CALCULATOR
                return this._logisticsSummaryCalculatorService.calculateLogisticsCost(lowCostTransport, logisticDirtyFields, logistic).pipe(
                  take(1),
                  map((calculationResult: LogisticsSummaryDto) => {
                    return { LogisticsSummaryDto: calculationResult, isSuccess: true };
                  })
                );
              })
            );
          })
        );
      })
    );
  }
}
