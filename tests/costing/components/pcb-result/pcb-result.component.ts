import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { Assumption, AssumptionEnum, CountryDataMasterDto, ElectronicsResult, PartInfoDto, ResultData } from 'src/app/shared/models';
import { EeConversionCostResult } from 'src/app/shared/models/ee-conversion-cost.model';
import { ElectronicsService } from '../../services';
import { EECoversionCostCalculatorService } from '../../services/eecoversion-cost-calculator.service';
// import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pcb-result',
  templateUrl: './pcb-result.component.html',
  styleUrls: ['./pcb-result.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class PcbResultComponent implements OnInit, OnDestroy, OnChanges {
  @Input() part: PartInfoDto;
  public currentPart: PartInfoDto;
  grandTotal: number = 0;
  resultTableData: ElectronicsResult[] = ResultData;
  public annualOrderQty: number;
  public lotsize: number;
  public countryName = '';
  assumptionData: Assumption[] = [];
  number: any;
  //Input parameters
  @Input() paneldescriptionformdata: any;
  @Input() smdPlacementFormData: any;
  @Input() throughHolePlacementFormData: any;
  @Input() timeTestingFormData: any;

  @Input() conversionCostId: number;

  //end of input
  @Output() loaded = new EventEmitter();

  _countryMaster$: Observable<CountryDataMasterDto[]>;

  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  constructor(
    private electronicService: ElectronicsService,
    private eeCoversionCostCalculatorService: EECoversionCostCalculatorService,
    private _store: Store
  ) {
    this.number = Number;
    this._countryMaster$ = this._store.select(CountryDataState.getCountryData);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue != changes['part'].previousValue) {
      this.currentPart = changes['part'].currentValue;
      this.annualOrderQty = Number(this.currentPart.eav || 0);
      this.lotsize = this.eeCoversionCostCalculatorService.getLotSizeConfiguration(this.annualOrderQty);
      // this.getConversionCostResult();
    }
  }

  ngOnInit(): void {
    this.getConversionCostResult(this.conversionCostId);
  }

  getConversionCostResult(conversionCostId: number) {
    if (conversionCostId) {
      this.electronicService
        .getConversionCostResult(conversionCostId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((response) => {
          if (response) {
            this.resultTableData = response.map((x) => {
              const item = new ElectronicsResult();

              const data: ElectronicsResult[] = ResultData.filter((r) => r.description == x.process);
              if (data && data[0]) {
                item.no = data[0].no;
              }
              item.description = x.process;
              item.time = x.time;
              item.mhr = x.mhr;
              item.lhr = x.lhr;
              item.numberofOperator = x.noOfOperators;
              item.conversionCost = x.conversionCost;
              return item;
            });
            this.calculateTotal();
          } else {
            this.getAssumptionData();
          }
        });
    }
  }

  getAssumptionData() {
    this._countryMaster$
      .pipe(takeUntil(this.unsubscribe$))
      .pipe(
        switchMap((res) => {
          this.countryName = res.find((x) => x.countryId == this.currentPart.mfrCountryId)?.countryName || '';
          return this.electronicService.getAssumptionData();
        })
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((x) => {
        this.assumptionData = x;
        this.loaded.emit(true);
        setTimeout(() => {
          document.getElementById('resultTable')!.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
        this.updateUserInputs();
        this.calIQCInspectionValue();
        this.calMaterialKittingValue();
        this.calChangeOverSMDTopSide();
        this.calChangeOverSMDBottomSide();
        this.calSMDCellOperationTopSide();
        this.calSMDCellOperationBottomSide();
        this.calPCBPreparationMasking();
        this.calThroughHoleComponentForming();
        this.calThroughHoleComponentStuffing();
        this.calWaveSoldering();
        this.calHandSoldering();
        this.calSelectiveSoldering();
        this.calPemFixing();
        this.calConnectorPressFitting();
        this.calICT();
        this.calConFormalMasking();
        this.calConversionCost();
        this.calculateTotal();
        this.saveConversionCostResult();
      });
  }

  calIQCInspectionValue() {
    let _iqcinspection =
      Number(this.smdPlacementFormData.controls['topSideComponentForm'].value.totalSMDParts || 0) + Number(this.smdPlacementFormData.controls['bottomSideForm'].value.totalSMDParts || 0);
    _iqcinspection += Number(this.throughHolePlacementFormData.controls.waveSolderedPartTypes.value || 0) + Number(this.throughHolePlacementFormData.controls.manualSolderedPartTypes.value || 0);
    _iqcinspection += Number(this.throughHolePlacementFormData.controls.noofPems.value || 0) + Number(this.throughHolePlacementFormData.controls.pressFitConnectorCount.value || 0);
    _iqcinspection += Number(this.throughHolePlacementFormData.controls.highLevelAssemblyparts.value || 0) + Number(this.throughHolePlacementFormData.controls.selectiveSolderedPartTypes.value || 0);
    const iqcAssumption = this.assumptionData.filter((x) => x.assumptionEnum == AssumptionEnum.IQCInspection);
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no === 1) {
        item.time = (_iqcinspection * Number(iqcAssumption[0].value || 0)) / (this.annualOrderQty / this.lotsize);
      }
    });
  }

  calMaterialKittingValue() {
    let _materialKitting =
      Number(this.smdPlacementFormData.controls['topSideComponentForm'].value.totalSMDParts || 0) + Number(this.smdPlacementFormData.controls['bottomSideForm'].value.totalSMDParts || 0);
    _materialKitting += Number(this.throughHolePlacementFormData.controls.waveSolderedPartTypes.value || 0) + Number(this.throughHolePlacementFormData.controls.manualSolderedPartTypes.value || 0);
    _materialKitting += Number(this.throughHolePlacementFormData.controls.noofPems.value || 0) + Number(this.throughHolePlacementFormData.controls.pressFitConnectorCount.value || 0);
    _materialKitting += Number(this.throughHolePlacementFormData.controls.highLevelAssemblyparts.value || 0) + Number(this.throughHolePlacementFormData.controls.selectiveSolderedPartTypes.value || 0);
    const materialKittingAssumption = this.assumptionData.filter((x) => x.assumptionEnum == AssumptionEnum.MaterialKitting);
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no === 2) {
        item.time = (_materialKitting * Number(materialKittingAssumption[0].value || 0)) / (this.annualOrderQty / this.lotsize); //to be checked with b17
      }
    });
  }

  calChangeOverSMDTopSide() {
    let changeOverValue = 0;
    //check top side selected
    if (Number(this.smdPlacementFormData.controls.smdSelection.value || 0) == 1 || Number(this.smdPlacementFormData.controls.smdSelection.value || 0) == 2) {
      this.assumptionData.forEach((item) => {
        if (
          item.assumptionEnum == AssumptionEnum.OperationStopthemachine ||
          item.assumptionEnum == AssumptionEnum.OperationSqueegeeHeightCalibration ||
          item.assumptionEnum == AssumptionEnum.OperationStencilLoadingandParameterSetting ||
          item.assumptionEnum == AssumptionEnum.OperationPCBLoading ||
          item.assumptionEnum == AssumptionEnum.OperationConveyorAdjustment
        ) {
          //70,75,76,77,81
          changeOverValue += Number(item.value || 0);
        } else if (
          item.assumptionEnum == AssumptionEnum.OperationUnloadthefeeders ||
          item.assumptionEnum == AssumptionEnum.OperationUnloadthereels ||
          item.assumptionEnum == AssumptionEnum.OpeartionFeederLoading
        ) {
          //71,72,79
          changeOverValue += (Number(item.value || 0) * Number(this.smdPlacementFormData.controls['topSideComponentForm'].value.totalSMDParts || 0)) / 2;
        } else if (
          item.assumptionEnum == AssumptionEnum.OperationUnloadthestencilandcleanit ||
          item.assumptionEnum == AssumptionEnum.OperationSqueegeeCleaning ||
          item.assumptionEnum == AssumptionEnum.OperationStartmachineandtakeproduction
        ) {
          //73,74,82
          changeOverValue += Number(item.value || 0) / 2;
        } else if (item.assumptionEnum == AssumptionEnum.OpeartionCrosscheckthefeederpositions || item.assumptionEnum == AssumptionEnum.OperationReelloadingontofeeder) {
          //78,80
          changeOverValue += Number(item.value || 0) * Number(this.smdPlacementFormData.controls['topSideComponentForm'].value.totalSMDParts || 0);
        }
      });
      changeOverValue = changeOverValue / (this.annualOrderQty / this.lotsize);
      this.resultTableData.forEach((item: ElectronicsResult) => {
        if (item.no == 3) {
          item.time = changeOverValue;
        }
      });
    }
  }

  calChangeOverSMDBottomSide() {
    let changeOverValue = 0;
    //check bottom side selected
    if (Number(this.smdPlacementFormData.controls.smdSelection.value || 0) == 2) {
      this.assumptionData.forEach((item) => {
        if (
          item.assumptionEnum == AssumptionEnum.OperationStopthemachine ||
          item.assumptionEnum == AssumptionEnum.OperationSqueegeeHeightCalibration ||
          item.assumptionEnum == AssumptionEnum.OperationStencilLoadingandParameterSetting ||
          item.assumptionEnum == AssumptionEnum.OperationPCBLoading ||
          item.assumptionEnum == AssumptionEnum.OperationConveyorAdjustment
        ) {
          //70,75,76,77,81
          changeOverValue += Number(item.value || 0);
        } else if (
          item.assumptionEnum == AssumptionEnum.OperationUnloadthefeeders ||
          item.assumptionEnum == AssumptionEnum.OperationUnloadthereels ||
          item.assumptionEnum == AssumptionEnum.OpeartionFeederLoading
        ) {
          //71,72,79
          changeOverValue += (Number(item.value || 0) * Number(this.smdPlacementFormData.controls['bottomSideForm'].value.totalSMDParts || 0)) / 2;
        } else if (
          item.assumptionEnum == AssumptionEnum.OperationUnloadthestencilandcleanit ||
          item.assumptionEnum == AssumptionEnum.OperationSqueegeeCleaning ||
          item.assumptionEnum == AssumptionEnum.OperationStartmachineandtakeproduction
        ) {
          //73,74,82
          changeOverValue += Number(item.value || 0) / 2;
        } else if (item.assumptionEnum == AssumptionEnum.OpeartionCrosscheckthefeederpositions || item.assumptionEnum == AssumptionEnum.OperationReelloadingontofeeder) {
          //78,80
          changeOverValue += Number(item.value || 0) * Number(this.smdPlacementFormData.controls['bottomSideForm'].value.totalSMDParts || 0);
        }
      });
      changeOverValue = changeOverValue / (this.annualOrderQty / this.lotsize);
      this.resultTableData.forEach((item: ElectronicsResult) => {
        if (item.no == 5) {
          item.time = changeOverValue;
        }
      });
    }
  }

  calSMDCellOperationTopSide() {
    if (Number(this.smdPlacementFormData.controls.smdSelection.value || 0) == 1 || Number(this.smdPlacementFormData.controls.smdSelection.value || 0) == 2) {
      this.resultTableData.forEach((item: ElectronicsResult) => {
        if (item.no == 4) {
          item.time = (60 * Number(this.smdPlacementFormData.controls['topSideComponentForm'].value.totalSMDPlacements || 0)) / Number(this.smdPlacementFormData.controls.machineTopSideCPH.value || 0);
        }
      });
    }
  }

  calSMDCellOperationBottomSide() {
    if (Number(this.smdPlacementFormData.controls.smdSelection.value || 0) == 2) {
      this.resultTableData.forEach((item: ElectronicsResult) => {
        if (item.no == 6) {
          item.time = (60 * Number(this.smdPlacementFormData.controls['bottomSideForm'].value.totalSMDPlacements || 0)) / Number(this.smdPlacementFormData.controls.machineBottomSideCPH.value || 0);
        }
      });
    }
  }

  calPCBPreparationMasking() {
    //noofMechHoles
    let pcbPrePartion = 0;
    this.assumptionData.forEach((item) => {
      if (item.assumptionEnum == AssumptionEnum.MechanicalHoleMaskingTime) {
        pcbPrePartion = (Number(this.timeTestingFormData.controls.noofMechHoles.value || 0) * Number(item.value || 0)) / 60;
      }
    });
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no == 7) {
        item.time = pcbPrePartion;
      }
    });
  }

  calThroughHoleComponentForming() {
    // const throughHoleComponentForming = 0;
    let percentageofthroughHoleComponentFormed = 0;
    let formingTimeManualPerComponent = 0;
    this.assumptionData.forEach((item) => {
      if (item.assumptionEnum == AssumptionEnum.PercentageofthroughHoleComponentFormed) {
        percentageofthroughHoleComponentFormed = Number(item.value || 0);
      } else if (item.assumptionEnum == AssumptionEnum.FormingTimeManualPerComponent) {
        formingTimeManualPerComponent = Number(item.value || 0);
      }
    });
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no == 8) {
        item.time =
          (((Number(this.throughHolePlacementFormData.controls.thPlacements.value || 0) + Number(this.throughHolePlacementFormData.controls.manualSolderPlacements.value || 0)) /
            Number(percentageofthroughHoleComponentFormed)) *
            this.number(formingTimeManualPerComponent)) /
          60;
      }
    });
  }

  calThroughHoleComponentStuffing() {
    let stuffingTimePerComponent = 0;
    this.assumptionData.forEach((item) => {
      if (item.assumptionEnum == AssumptionEnum.StuffingTimePerComponent) {
        stuffingTimePerComponent = Number(item.value);
      }
    });
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no == 9) {
        item.time = (Number(this.throughHolePlacementFormData.controls.thPlacements.value || 0) * stuffingTimePerComponent) / 60;
      }
    });
  }

  calWaveSoldering() {
    let waveSoldering = 0;
    // let deRating = 0; //147
    let conveyorLength = 0; //148
    let conveyorSpeed = 0; //149
    let lotQTY = 0; //150
    let throughHoleComponentStuffing = 0;
    if (this.throughHolePlacementFormData.controls.waveSolderedPartTypes.value == 0) {
      this.resultTableData.forEach((item: ElectronicsResult) => {
        if (item.no == 10) {
          item.time = 0;
        }
      });
    } else {
      this.resultTableData.forEach((item: ElectronicsResult) => {
        if (item.no == 9) {
          throughHoleComponentStuffing = Number(item.time || 0) / 60;
        }
      });
      if (this.throughHolePlacementFormData.controls.thPlacements.value >= 1) {
        this.assumptionData.forEach((item) => {
          // if (item.assumptionEnum == AssumptionEnum.DeRating) {
          //   deRating = Number(item.value);
          // } else
          if (item.assumptionEnum == AssumptionEnum.ConveyorLength) {
            conveyorLength = Number(item.value);
          } else if (item.assumptionEnum == AssumptionEnum.ConveyorSpeed) {
            conveyorSpeed = Number(item.value);
          } else if (item.assumptionEnum == AssumptionEnum.LotQty) {
            lotQTY = Number(item.value);
          }
        });
        waveSoldering =
          (conveyorLength / conveyorSpeed + (Number(this.paneldescriptionformdata.controls.panelLength.value || 0) / conveyorSpeed) * lotQTY) /
          lotQTY /
          Number(this.paneldescriptionformdata.controls.panelLength.value) /
          0.7;
      }
      //to be implemented
      this.resultTableData.forEach((item: ElectronicsResult) => {
        if (item.no == 10) {
          item.time = Math.max(waveSoldering, throughHoleComponentStuffing);
        }
      });
    }
  }

  calHandSoldering() {
    let rohs = 0;
    this.assumptionData.forEach((item) => {
      if (item.assumptionEnum == AssumptionEnum.HandSolderingTimeforROHSJoints) {
        rohs = item.value;
      }
    });
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no == 11) {
        item.time = (Number(this.throughHolePlacementFormData.controls.manualSolderJoints.value || 0) * rohs) / 60;
      }
    });
  }

  calSelectiveSoldering() {
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no == 13) {
        item.time = (Number(this.throughHolePlacementFormData.controls.selectiveSolderJoints.value || 0) * 3) / 60;
      }
    });
  }

  calPemFixing() {
    let pemFixingTime = 0;
    this.assumptionData.forEach((item) => {
      if (item.assumptionEnum == AssumptionEnum.PemFixingTime) {
        pemFixingTime = Number(item.value || 0);
      }
    });
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no == 16) {
        item.time = (Number(this.throughHolePlacementFormData.controls.noofPems.value || 0) * pemFixingTime) / 60;
      }
    });
  }

  calConnectorPressFitting() {
    let pressFitConnectorFixingTime = 0;
    this.assumptionData.forEach((item) => {
      if (item.assumptionEnum == AssumptionEnum.PressFitConnectorFixingTime) {
        pressFitConnectorFixingTime = Number(item.value || 0);
      }
    });
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no == 17) {
        item.time = (Number(this.throughHolePlacementFormData.controls.pressFitConnectorCount.value || 0) * pressFitConnectorFixingTime) / 60;
      }
    });
  }

  calICT() {
    let changeOverTime = 0;
    let pcbAssemblyLoadUnloadTime = 0;
    let testingTime = 0;
    if (this.throughHolePlacementFormData.controls.nodeCount.value >= 50) {
      this.assumptionData.forEach((item) => {
        if (item.assumptionEnum == AssumptionEnum.ChangeOverTime) {
          changeOverTime = Number(item.value || 0);
        } else if (item.assumptionEnum == AssumptionEnum.PCBAssemblyLoadingandUnloadingTime) {
          pcbAssemblyLoadUnloadTime = Number(item.value || 0);
        } else if (item.assumptionEnum == AssumptionEnum.TestingtimedividedbyNode) {
          testingTime = Number(item.value || 0);
        }
      });
      this.resultTableData.forEach((item: ElectronicsResult) => {
        if (item.no == 22) {
          item.time =
            (changeOverTime + ((pcbAssemblyLoadUnloadTime + this.throughHolePlacementFormData.controls.nodeCount.value * testingTime) / 60) * (this.annualOrderQty / this.lotsize)) /
            (this.annualOrderQty / this.lotsize);
        }
      });
    }
  }

  calConFormalMasking() {
    let machineHoleMaskingTime = 0;
    this.assumptionData.forEach((item) => {
      if (item.assumptionEnum == AssumptionEnum.MechanicalHoleMaskingTime) {
        machineHoleMaskingTime = Number(item.value || 0);
      }
    });
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no == 28) {
        item.time = (Number(this.timeTestingFormData.controls.noofMechHoles.value || 0) * machineHoleMaskingTime) / 60;
      }
    });
  }

  getLHRRate() {
    let semiSkilledOperatorLHRRate = 0;
    let skilledOperatorLHRRate = 0;
    this.electronicService
      .getLHRRate(this.countryName, 4)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((x) => {
        semiSkilledOperatorLHRRate = Number(x || 0);
        this.resultTableData.forEach((item: ElectronicsResult) => {
          if (item.skillLevel == 'Semi Skilled Machine operator') {
            item.lhr = semiSkilledOperatorLHRRate;
          }
        });
      });
    this.electronicService
      .getLHRRate(this.countryName, 5)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((x) => {
        skilledOperatorLHRRate = Number(x || 0);
        this.resultTableData.forEach((item: ElectronicsResult) => {
          if (item.skillLevel == 'Skilled Machine operator') {
            item.lhr = skilledOperatorLHRRate;
          }
        });
      });
  }

  getMHRRate() {
    this.resultTableData.forEach((item: ElectronicsResult) => {
      const inputp = {
        machineDesc: item.description,
        country: this.countryName,
        shift: 3,
      };
      switch (item.no) {
        case 4:
        case 3:
          // let input = {
          //   "machineDesc": this.smdPlacementFormData.controls.selectedMachineTopSide.value,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          inputp.machineDesc = this.smdPlacementFormData.controls.selectedMachineTopSide.value;
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 5:
        case 6:
          // let input = {
          //   "machineDesc": this.smdPlacementFormData.controls.selectedMachineBottomSide.value,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          inputp.machineDesc = this.smdPlacementFormData.controls.selectedMachineBottomSide.value;
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 10:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 13:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 20:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 21:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 22:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 23:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 24:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 27:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 29:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 30:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
        case 31:
          // let inputp = {
          //   "machineDesc": item.description,
          //   "country": this.countryName,
          //   "shift": 3
          // }
          this.electronicService
            .getMHRRate(inputp.machineDesc, inputp.country, inputp.shift)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((x) => {
              item.mhr = Number(x || 0);
            });
          break;
      }
    });
  }

  calConversionCost() {
    this.getMHRRate();
    this.getLHRRate();
    this.resultTableData.forEach((item: ElectronicsResult) => {
      item.conversionCost = (Number(item.time || 0) / 60) * Number(item.mhr || 0) + (Number(item.time || 0) / 60) * Number(item.lhr || 0) * Number(item.numberofOperator || 0);
    });

    // let GrandTotalValue = 0;
    // ResultData.forEach((item: ElectronicsResult) => {
    //   if (item.no == 36) {
    //     item.conversionCost = GrandTotalValue * 0.05;
    //   }
    //   else if (item.no == 37) {
    //     //item.conversionCost
    //   }
    //   else {
    //     GrandTotalValue += Number(item.conversionCost || 0);
    //   }
    // })

    let reworkContent = 0;
    this.resultTableData.forEach((item: ElectronicsResult) => {
      if (item.no != 36) {
        reworkContent += Number(item.conversionCost);
      } else if (item.no == 36) {
        item.conversionCost = reworkContent * 0.05;
      }
    });
  }

  calculateTotal() {
    this.resultTableData.forEach((item: ElectronicsResult) => {
      this.grandTotal += item.conversionCost;
    });
  }

  updateUserInputs() {
    ResultData.forEach((item: ElectronicsResult) => {
      switch (
        item.no //s.no check
      ) {
        case 14:
          item.time = Number(this.timeTestingFormData.controls.inspectionAfterHoleOperations.value || 0);
          break;
        case 18:
          //Gluing
          item.time = Number(this.timeTestingFormData.controls.gluingOperation.value || 0);
          break;
        case 19:
          item.time = Number(this.timeTestingFormData.controls.Modification.value || 0);
          break;
        case 20:
          item.time = Number(this.timeTestingFormData.controls.automaticOpticalInspection.value || 0);
          break;
        case 21:
          item.time = Number(this.timeTestingFormData.controls.AXI.value || 0);
          break;
        // case 22:
        //item.time=t
        //to be calculated
        case 23:
          item.time = Number(this.timeTestingFormData.controls.ICProgramming.value || 0);
          break;
        case 24:
          item.time = Number(this.timeTestingFormData.controls.flyingProbeTest.value || 0);
          break;
        case 25:
          item.time = Number(this.timeTestingFormData.controls.hotBarSoldering.value || 0);
          break;
        case 26:
          item.time = Number(this.timeTestingFormData.controls.manualConformalCoating.value || 0);
          break;
        case 27:
          item.time = Number(this.timeTestingFormData.controls.machineConformalCoating.value || 0);
          break;
        // case 28:
        //to be implemented
        case 29:
          item.time = Number(this.timeTestingFormData.controls.manualXrayInspection.value || 0);
          break;
        case 30:
          item.time = Number(this.paneldescriptionformdata.controls.mouseBite.value || 0);
          break;
        case 31:
          item.time = Number(this.paneldescriptionformdata.controls.vgrove.value || 0);
          break;
        case 32:
          item.time = Number(this.timeTestingFormData.controls.mechanicIntegration.value || 0);
          break;
        case 33:
          item.time = Number(this.timeTestingFormData.controls.finalTesting.value || 0);
          break;
        case 34:
          item.time = Number(this.timeTestingFormData.controls.finalInspection.value || 0);
          break;
        case 35:
          item.time = Number(this.timeTestingFormData.controls.packing.value || 0);
          break;
        case 36:
        //to be implemented
      }
    });
  }

  saveConversionCostResult() {
    const request: EeConversionCostResult[] = [];
    this.resultTableData.forEach((item) => {
      const ccResult: EeConversionCostResult = {
        conversionCost: !isFinite(item.conversionCost) || item.conversionCost == null || !item.conversionCost ? 0 : item.conversionCost,
        lhr: item.lhr || 0,
        mhr: item.mhr || 0,
        noOfOperators: item.numberofOperator || 0,
        process: item.description,
        time: !isFinite(item.time) || item.time == null || !item.time ? 0 : item.time,

        conversionCostId: this.currentPart?.conversionCosts?.length > 0 ? this.currentPart.conversionCosts[0].conversionCostId : null,
        conversionCostResultId: null,
        partInfoId: this.currentPart.partInfoId,
        projectInfoId: this.currentPart.projectInfoId,
      };
      request.push(ccResult);
    });

    this.electronicService
      .saveEeConversionCostResult(request)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {});
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
