import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { catchError, combineLatest, filter, forkJoin, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { PackagingInfoDto } from 'src/app/shared/models/packaging-info.model';
import { SimulationEmit } from 'src/app/shared/models/simulation-emit.model';
import { SimulationTotalCostDto } from 'src/app/modules/analytics/models/simulationTotalCostDto.model';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { IMaterialCalculationByCommodity } from 'src/app/modules/costing/services/IMaterialCalculationByCommodity';
import { MaterialCalculationByCommodityFactory } from 'src/app/modules/costing/services/MaterialCalculationByCommodityFactory';
import { CountryDataMasterDto, CountryFormMatrixDto, MaterialInfoDto, MaterialMasterDto, PartInfoDto, ProcessInfoDto, ReCalculateContext, StockFormDto } from 'src/app/shared/models';
import { MaterialInfoService, MaterialMasterService, MedbMasterService, ProcessInfoService } from 'src/app/shared/services';
import { MachiningTypes, ScreeName } from 'src/app/modules/costing/costing.config';
import { CountryFormMatrixState } from 'src/app/modules/_state/country-form-matrix-state';
import { StockFormsState } from 'src/app/modules/_state/stock-forms.state';
import { MaterialSustainabilityCalculationService } from 'src/app/modules/costing/services/material-sustainability-calculator.service';
import { LaborService } from 'src/app/shared/services/labor.service';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { CostManufacturingRecalculationService } from 'src/app/modules/costing/services/recalculation/cost-manufacturing-recalculation.service';
import { FormBuilder } from '@angular/forms';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { CostingToolingRecalculationService } from 'src/app/modules/costing/services/recalculation/costing-tooling-recalculation.service';
import { CostOverheadProfitRecalculationService } from 'src/app/modules/costing/services/recalculation/cost-overhead-profit-recalculation.service';
import { CostingOverheadProfitCalculatorService } from 'src/app/modules/costing/services/costing-overhead-profit-calculator.service';
import { CostToolingDto } from 'src/app/shared/models/tooling.model';
import { CostOverHeadProfitDto, MedbFgiccMasterDto, MedbIccMasterDto, MedbOverHeadProfitDto, MedbPaymentMasterDto } from '../../../../../shared/models/overhead-Profit.model';
import { PackagingInfoService } from 'src/app/shared/services/packaging-info.service';
import { CostPackagingingRecalculationService } from 'src/app/modules/costing/services/recalculation/cost-packaging-recalculation.service';
import { CostingLogisticsRecalculationService } from 'src/app/modules/costing/services/recalculation/costing-logistics-recalculation.service';
import { LogisticsSummaryDto } from 'src/app/shared/models/logistics-summary.model';

@Injectable({
  providedIn: 'root',
})
export class SimulationCalculationService {
  private _fb = inject(FormBuilder);
  private sharedService = inject(SharedService);
  private _materialFactory = inject(MaterialCalculationByCommodityFactory);
  private _materialService = inject(MaterialInfoService);
  private materialMasterService = inject(MaterialMasterService);
  public _materialSustainabilityCalcService = inject(MaterialSustainabilityCalculationService);
  public _costingLogisticsRecalculationService = inject(CostingLogisticsRecalculationService);
  private _store = inject(Store);
  private laborService = inject(LaborService);
  private medbMasterService = inject(MedbMasterService);
  private _processService = inject(ProcessInfoService);
  private _manufacturingConfig = inject(ManufacturingConfigService);
  private costManufacturingRecalculationService = inject(CostManufacturingRecalculationService);
  private costingToolingRecalculationService = inject(CostingToolingRecalculationService);
  private costOverheadRecalculationService = inject(CostOverheadProfitRecalculationService);
  private _costingOverheadProfitCalculatorService = inject(CostingOverheadProfitCalculatorService);
  private PackgSvc = inject(PackagingInfoService);
  private costPackagingRecalculationService = inject(CostPackagingingRecalculationService);

  public medbFgiccMasterList: MedbFgiccMasterDto | undefined;
  public medbIccMasterList: MedbIccMasterDto | undefined;
  public medbMohList: MedbOverHeadProfitDto | undefined;
  public medbFohList: MedbOverHeadProfitDto | undefined;
  public medbSgaList: MedbOverHeadProfitDto | undefined;
  public medbProfitList: MedbOverHeadProfitDto | undefined;
  public medbPaymentList: MedbPaymentMasterDto | undefined;

  private _materialCommodityService: IMaterialCalculationByCommodity = null;
  private materialmasterDatas: MaterialMasterDto[] = [];
  private _stockFormData$: Observable<StockFormDto[]> = this._store.select(StockFormsState.getStockForms);
  private _countryFormMatrixData$: Observable<CountryFormMatrixDto[]> = this._store.select(CountryFormMatrixState.getCountryFormMatrixs);
  private stockFormDtos: StockFormDto[] = [];
  private countryFormMatixDtos: CountryFormMatrixDto[] = [];
  private defaultValues = this._manufacturingConfig.defaultValues;
  MachiningFlags = this._manufacturingConfig._machining.getMachiningFlags();

  formIdentifier: CommentFieldFormIdentifierModel = {
    partInfoId: 0,
    screenId: ScreeName.Manufacturing,
    primaryId: 0,
    secondaryID: 0,
  };
  constructor() {
    this._stockFormData$.subscribe((result: StockFormDto[]) => {
      if (result) {
        this.stockFormDtos = result;
      }
    });
    this._countryFormMatrixData$.subscribe((result: CountryFormMatrixDto[]) => {
      if (result && result.length > 0) {
        this.countryFormMatixDtos = result;
      }
    });
  }
  private getMarketMonthByDate(createDate: Date) {
    const mon = (createDate.getMonth() + 1).toString().padStart(2, '0');
    const year = createDate.getFullYear();
    return mon + year.toString();
  }
  runSimulation(selectedData: SimulationEmit): Observable<SimulationTotalCostDto[]> {
    const selectedPart = selectedData.selectedPart;
    const selectedProject = selectedData.selectedProject;
    let marketMonth: string = selectedProject?.marketMonth;
    const marketQuarter = selectedProject?.marketQuarter;
    if (!selectedPart || !selectedProject) {
      return of([]);
    }
    this.costingToolingRecalculationService.setCurrentPart(selectedPart);
    if (!marketMonth) {
      if (marketQuarter) {
        marketMonth = this.sharedService.getMarketMonth(marketQuarter);
      } else {
        marketMonth = this.getMarketMonthByDate(new Date(selectedProject?.createDate));
      }
    }

    this._materialCommodityService = this._materialFactory.getCalculatorServiveByCommodity(selectedPart);
    const tasks = selectedData.selectedCountries.map((country) => {
      const countryObj = structuredClone(country);
      const currentPart = { ...structuredClone(selectedPart), mfrCountryId: countryObj.countryId };
      return this.runSimulationForCountry(countryObj, currentPart, structuredClone(selectedProject), marketMonth);
    });

    return forkJoin(tasks).pipe(
      tap((results) => {
        console.log('ALL SIMULATIONS COMPLETED', results);
      })
    );
  }
  private runSimulationForCountry(country, selectedPart: PartInfoDto, selectedProject, marketMonth): Observable<SimulationTotalCostDto> {
    const summary = this.createSummary(country, selectedPart, selectedProject);
    return this.runMaterialSimulation(structuredClone(selectedPart), country, marketMonth).pipe(
      take(1),
      map((materialResult) => {
        this.populateMaterial(summary, materialResult);
        return structuredClone(materialResult);
      }),
      switchMap((materialResult) => this.runProcessSimulation(structuredClone(selectedPart), country, materialResult, marketMonth).pipe(take(1))),
      switchMap((processResult) => this.handleProcessAndNextSteps(summary, structuredClone(processResult), marketMonth).pipe(take(1)))
    );
  }

  private populateMaterial(summary: SimulationTotalCostDto, materialResult) {
    summary.materialTotalCost = materialResult.reduce((t, m) => t + this.sharedService.isValidNumber(m.netMatCost), 0);
    summary.totalESGMaterial = materialResult.reduce((t, m) => t + this.sharedService.isValidNumber(m.totalEsgImpactCO2Kg), 0);
  }

  private handleProcessAndNextSteps(summary: SimulationTotalCostDto, processResult, marketMonth): Observable<SimulationTotalCostDto> {
    const processFlat = processResult.flatMap((x) => structuredClone(x.calculateResults));
    summary.processTotalCost = processFlat.reduce((t, p) => t + this.sharedService.isValidNumber(p.directProcessCost), 0);
    summary.totalESGManufacturing = processFlat.reduce((t, p) => t + this.sharedService.isValidNumber(p.esgImpactAnnualKgCO2Part), 0);
    summary.totalCostESG = summary.totalESGMaterial + summary.totalESGManufacturing;
    const safeCurrentPart = structuredClone(processResult[0].currentPart);
    const safeMaterialList = structuredClone(processResult[0].materialInfoList);

    return processResult[0].isToolingNeedToRun
      ? this.runWithTooling(summary, safeCurrentPart, safeMaterialList, processFlat, marketMonth).pipe(take(1))
      : this.runWithoutTooling(summary, safeCurrentPart, safeMaterialList, processFlat).pipe(take(1));
  }

  private runWithTooling(summary, currentPart, materialInfoList, processFlat, marketMonth): Observable<SimulationTotalCostDto> {
    return this.runToolingSimulation(
      {
        materialInfoList: structuredClone(materialInfoList),
        calculateResults: structuredClone(processFlat),
        currentPart: structuredClone(currentPart),
        isToolingNeedToRun: true,
      },
      marketMonth
    ).pipe(
      take(1),
      tap((toolingResult) => {
        summary.toolingTotalCost = toolingResult.reduce((t, tool) => t + this.sharedService.isValidNumber(tool.toolCostPerPart), 0);
        summary.toolingAmortizationCost = summary.toolingTotalCost / toolingResult[0].toolLifeInParts;
      }),

      switchMap(() => this.runOHP(structuredClone(currentPart)).pipe(take(1))),

      tap((ohp) => {
        summary.OHPTotalCost = ohp.profitCost + ohp.mohCost + ohp.fohCost + ohp.sgaCost;
      }),

      switchMap(() =>
        this.runPackagingSimulation(structuredClone(currentPart), structuredClone(processFlat[0]), structuredClone(materialInfoList[0])).pipe(
          take(1),
          tap((pkg) => {
            summary.packagingTotalCost = pkg?.adnlProtectPkgs.reduce((total, pkg) => total + pkg.costPerUnit, 0);
            summary.totalESGPackaging = pkg?.totalESGImpactperPart || 0;
            summary.totalCostESG += summary.totalESGPackaging;
          }),
          switchMap((pkg) => this.runlogisticsSimulation(structuredClone(currentPart), materialInfoList, pkg).pipe(take(1))),
          map((logistics) => {
            summary.logisticsTotalCost = logistics.freightCost || 0;
            summary.totalCostESG += logistics.totalCarbonFootPrint || 0;
            return summary;
          })
        )
      )
    );
  }
  private runWithoutTooling(summary, currentPart, materialInfoList, processFlat): Observable<SimulationTotalCostDto> {
    return combineLatest({
      ohp: this.runOHP(structuredClone(currentPart)).pipe(take(1)),
      pkg: this.runPackagingSimulation(structuredClone(currentPart), structuredClone(processFlat[0]), structuredClone(materialInfoList[0])).pipe(take(1)),
    }).pipe(
      take(1),
      tap(({ ohp, pkg }) => {
        summary.OHPTotalCost = ohp.profitCost + ohp.mohCost + ohp.fohCost + ohp.sgaCost;
        summary.packagingTotalCost = pkg?.adnlProtectPkgs.reduce((total, pkg) => total + pkg.costPerUnit, 0);
        summary.totalESGPackaging = pkg?.totalESGImpactperPart || 0;
        summary.totalCostESG += summary.totalESGPackaging;
      }),
      switchMap(({ pkg }) => this.runlogisticsSimulation(structuredClone(currentPart), materialInfoList, pkg).pipe(take(1))),
      map((logistics) => {
        summary.logisticsTotalCost = logistics.freightCost || 0;
        summary.totalCostESG += logistics.totalCarbonFootPrint || 0;
        return summary;
      })
    );
  }
  private finalizePackaging(summary: SimulationTotalCostDto, pkg: PackagingInfoDto): SimulationTotalCostDto {
    summary.packagingTotalCost = pkg?.adnlProtectPkgs.reduce((total, pkg) => total + pkg.costPerUnit, 0);
    summary.totalESGPackaging = pkg?.totalESGImpactperPart || 0;
    summary.totalCostESG += summary.totalESGPackaging;
    return summary;
  }

  runMaterialSimulation(selectedPart: PartInfoDto, country: CountryDataMasterDto, marketMonth: string): Observable<MaterialInfoDto[]> {
    return this._materialService.getMaterialInfosByPartInfoId(selectedPart?.partInfoId).pipe(
      switchMap((materialList: MaterialInfoDto[]) => {
        if (!materialList || materialList.length === 0) {
          return of([new MaterialInfoDto()]).pipe(take(1));
        }
        const observables = materialList.map((selectedMaterial, idx) => {
          return this.sharedService.getColorInfos(selectedPart?.partInfoId, ScreeName.Material, selectedMaterial?.materialInfoId).pipe(
            take(1),
            switchMap((materialDirtyFields) => {
              const marketDataId = selectedMaterial?.materialMarketId;
              if (!marketDataId || marketDataId <= 0) {
                return of(new MaterialInfoDto());
              }
              return this.materialMasterService.getMaterialMasterByMaterialMarketDataId(marketDataId).pipe(
                take(1),
                switchMap((response) => {
                  const materialMaster = response?.materialMarketData?.materialMaster;
                  const materialMasterId = materialMaster?.materialMasterId || 0;
                  if (!materialMasterId) {
                    return of(new MaterialInfoDto());
                  }
                  if (materialMaster) {
                    this.materialmasterDatas.push(materialMaster);
                  }

                  return this.materialMasterService.getMaterialMarketDataByMarketQuarter(country.countryId, materialMasterId, marketMonth).pipe(
                    take(1),
                    switchMap((marketData) => {
                      if (!materialMaster?.materialTypeId) {
                        return of(new MaterialInfoDto());
                      }
                      const typeId = materialMaster?.materialTypeId;
                      const materialGroupId = materialMaster?.materialType?.materialGroupId;

                      return this.materialMasterService.getmaterialsByMaterialTypeId(typeId).pipe(
                        take(1),
                        switchMap((materialDescriptionList) => {
                          const materialInfo: MaterialInfoDto = { ...selectedMaterial };
                          materialInfo.materialMasterId = materialMasterId;
                          materialInfo.materialFamily = typeId;
                          materialInfo.sandCost = this.sharedService.isValidNumber(materialMaster?.sandCost);
                          materialInfo.eav = selectedPart?.eav;
                          materialInfo.materialDescriptionList = materialDescriptionList;
                          materialInfo.materialGroupId = materialGroupId;
                          materialInfo.materialMarketData = marketData?.length > 0 ? marketData[0] : null;

                          if (marketData?.length > 0) {
                            const data = marketData[0];
                            materialInfo.materialMarketId = data.materialMarketId;
                            const stockForm = materialInfo?.stockForm;
                            if (stockForm) {
                              const stockFormId = this.stockFormDtos.find((x) => x.formName === stockForm)?.stockFormId;
                              const multiplier = this.countryFormMatixDtos.find((x) => x.countryId === selectedPart.mfrCountryId && x.stockFormId === stockFormId)?.multiplier || 1;
                              materialInfo.materialPricePerKg = data.price * multiplier;
                            } else {
                              materialInfo.materialPricePerKg = data.price;
                            }
                            materialInfo.scrapPricePerKg = data?.generalScrapPrice;
                            materialInfo.machiningScrapPrice = Number(data?.machineScrapPrice || 0);
                          }
                          materialInfo.machiningIsRod = selectedMaterial.processId == MachiningTypes.Rod;
                          materialInfo.machiningIsBlock = selectedMaterial.processId == MachiningTypes.Block;
                          materialInfo.machiningIsWire = selectedMaterial.processId == MachiningTypes.Wire;
                          materialInfo.machiningIsTube = selectedMaterial.processId == MachiningTypes.Tube;
                          materialInfo.machiningIsSquareBar = selectedMaterial.processId == MachiningTypes.SquareBar;
                          materialInfo.machiningIsRectangularBar = selectedMaterial.processId == MachiningTypes.RectangularBar;
                          materialInfo.machiningIsHexagonalBar = selectedMaterial.processId == MachiningTypes.HexagonalBar;
                          materialInfo.machiningIsOtherShapes = selectedMaterial.processId == MachiningTypes.OtherShapes;

                          materialInfo.countryId = country.countryId;
                          materialInfo.countryName = country.countryName;

                          if (selectedPart?.mfrCountryId != country.countryId) {
                            materialDirtyFields = [];
                          }
                          const calcResult = this._materialCommodityService.CalculateMaterialCost(materialInfo.processId, materialInfo, materialDirtyFields, selectedMaterial);
                          const result = this._materialSustainabilityCalcService.calculationsForMaterialSustainability(calcResult, materialDirtyFields, selectedMaterial);
                          return of(result).pipe(take(1));
                        })
                      );
                    })
                  );
                })
              );
            }),
            catchError((err) => {
              console.error(`✖ [${idx}] error in material observable:`, err);
              return of(null);
            })
          );
        });
        return forkJoin(observables).pipe(map((results) => results.filter((x) => x != null)));
      })
    );
  }

  runProcessSimulation(selectedPart: PartInfoDto, country: CountryDataMasterDto, materialInfoList: MaterialInfoDto[], marketMonth: string): Observable<ReCalculateContext[]> {
    const processIds = materialInfoList
      ?.filter((x) => x.processId)
      .map((x) => x.processId)
      .join(',');

    return combineLatest([
      this.laborService.getLaborRatesByCountry(country.countryId, marketMonth, country?.regionId).pipe(take(1)),
      this._processService.getProcessInfoByPartInfoId(selectedPart?.partInfoId).pipe(take(1)),
      this.medbMasterService.getProcessTypeList(processIds).pipe(take(1)),
      this.laborService.getLaborCountByCountry(country.countryId).pipe(take(1)),
    ]).pipe(
      take(1),
      switchMap(([laborRate, processList, processTypeOriginalList, laborCountByMachineType]) => {
        if (!laborRate || !processList?.length) {
          return of([]);
        }
        materialInfoList = [
          ...materialInfoList.filter((x) => !(this._manufacturingConfig.secondaryProcesses.includes(x.processId) || this._manufacturingConfig.weldingProcesses.includes(x.processId))),
          ...materialInfoList.filter((x) => this._manufacturingConfig.secondaryProcesses.includes(x.processId) || this._manufacturingConfig.weldingProcesses.includes(x.processId)),
        ];

        this.costManufacturingRecalculationService.setLookupLists({
          fieldColorsList: [],
          processTypeOrginalList: processTypeOriginalList,
        });

        return this.costManufacturingRecalculationService.recalculateExistingProcessCosts(
          selectedPart,
          materialInfoList,
          laborRate,
          processList,
          structuredClone(this.materialmasterDatas[0]),
          laborCountByMachineType,
          structuredClone(processList[0]),
          this._fb.array([]),
          this._fb.array([]),
          this._fb.group({}),
          processList[0].processInfoId,
          (this.formIdentifier = { ...this.formIdentifier, primaryId: processList[0].processInfoId }),
          this.defaultValues,
          this.MachiningFlags
        );
      })
    );
  }

  runToolingSimulation(info: any, marketMonth: string): Observable<CostToolingDto[]> {
    const changeFlags = { isSupplierCountryChanged: false, isCountryChanged: true, isToollifeChanged: false, lifeTimeRemainingChange: true, complexityChanged: false, surfaceFinishChanged: false };
    return this.costingToolingRecalculationService.getToolEntries().pipe(
      take(1),
      switchMap(() => this.costingToolingRecalculationService.recalculateToolingCost(info, marketMonth, null, changeFlags, null, null, null, null, null, null, null))
    );
  }

  runOHP(currentPart: PartInfoDto): Observable<CostOverHeadProfitDto> {
    return this.costOverheadRecalculationService.getMasterData(currentPart).pipe(
      filter(Boolean),
      switchMap(() => this.costOverheadRecalculationService.recalculateOverHeadAndProfit(currentPart)),
      map((result) => result)
    );
  }

  runPackagingSimulation(currentPart: PartInfoDto, processInfoDtoOut: ProcessInfoDto, materialInfo: MaterialInfoDto): Observable<PackagingInfoDto> {
    return this.PackgSvc.getPackagingDetails(currentPart?.partInfoId).pipe(
      take(1),
      switchMap((pkgInfoState: PackagingInfoDto) => {
        return this.costPackagingRecalculationService.recalculatePackagingCost(currentPart, processInfoDtoOut, materialInfo, pkgInfoState);
      })
    );
  }

  runlogisticsSimulation(currentPart: PartInfoDto, materialList: MaterialInfoDto[], packagingObj: PackagingInfoDto): Observable<LogisticsSummaryDto> {
    return this._costingLogisticsRecalculationService.recalculateLogisticsCost(currentPart, materialList, packagingObj, false).pipe(
      take(1),
      map((result) => (result.isSuccess ? result.LogisticsSummaryDto : new LogisticsSummaryDto()))
    );
  }

  private createSummary(country, selectedPart, selectedProject): SimulationTotalCostDto {
    const summary = new SimulationTotalCostDto();
    summary.countryId = country.countryId;
    summary.countryName = country.countryName;
    summary.projectInfoId = selectedProject.projectInfoId;
    summary.partInfoId = selectedPart.partInfoId;
    summary.mfrCountryId = selectedPart.mfrCountryId;
    return summary;
  }
}
