import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SecondaryProcessNames, SecondaryProcessNamesMap, SelectModel } from 'src/app/shared/enums';
import { PartInfoDto, SecondaryProcessPowderMachineDto } from 'src/app/shared/models';
import { SecondaryProcessDto } from 'src/app/shared/models/secondary-process.model';
import { CostingCompletionPercentageCalculator } from '../../services';
import { Observable, Subject, Subscription } from 'rxjs';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { takeUntil, first } from 'rxjs/operators';
import { NotSavedService } from 'src/app/services/not-saved.service';
import { Router } from '@angular/router';
import { AppConfigurationService } from 'src/app/shared/services';
import * as SecondaryProcessInfoActions from 'src/app/modules/_actions/secondary-process.action';
import { Store } from '@ngxs/store';
import { SecondaryProcessInfoState } from 'src/app/modules/_state/secondary-process.state';
import { SecondaryProcessMachineState } from 'src/app/modules/_state/sec-machine-desc.state';
import { SecondaryProcessMaterialState } from 'src/app/modules/_state/sec-powder-coating-material.state';
import { SecondaryProcessDeburringMachineState } from 'src/app/modules/_state/sec-deburring-machine-desc.state';
import { SecondaryProcessPowderCoatingMachineState } from 'src/app/modules/_state/sec-powder-coating-machine.state';
import { SecondaryProcessPowderCoatingStockState } from 'src/app/modules/_state/sec-powder-coating-stock.state';
import { SecondaryProcessShotBlastingState } from 'src/app/modules/_state/sec-shot-blasting-machine-desc.state';
import { CostingConfig } from '../../costing.config';
import { SharedService } from '../../services/shared.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-costing-secondary-process',
  templateUrl: './costing-secondary-process.component.html',
  styleUrls: ['./costing-secondary-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
})
export class CostingSecondaryProcessComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() part: PartInfoDto;
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() recalculateSubject: Subject<PartInfoDto>;
  @Output() formLoaded = new EventEmitter<{ componentName: string; formName: string; loadTime?: number }>();
  dataCompletionPercentage: any;
  public currentPart: PartInfoDto;
  public secondaryProcessList: SecondaryProcessDto[];
  public costingSecProcessform: FormGroup;
  public secondaryProcessNamesList: SelectModel[] = [];
  public powderCoatingMaterialDescriptionListMaster: string[] = [];
  public paintingMaterialDescriptionListMaster: string[] = [];
  public secondaryProcessPlatingMachineDescListMaster: string[] = [];
  public secondaryProcessHTMachineDescListMaster: string[] = [];
  public secondaryProcessDeburringMachineDescListMaster: string[] = [];
  public powderCoatingMaterialDescriptionList: string[] = [];
  public paintingMaterialDescriptionList: string[] = [];
  public secondaryProcessPlatingMachineDescList: string[] = [];
  public secondaryProcessHTMachineDescList: string[] = [];
  public secondaryProcessDeburringMachineDescList: string[] = [];
  public isPlating = false;
  public isHeatTreat = false;
  public isShotBlasting = false;
  public isWelding = false;
  public isDeburring = false;
  public isPowdercoating = false;
  public isPainting = false;
  public selectedSecondaryProcessInfoId = 0;
  public isNewSecondaryinfo = false;
  public secondaryProcessNames = SecondaryProcessNames;
  public secondaryProcessNamesMap = SecondaryProcessNamesMap;
  afterChange = false;
  isEnableUnitConversion = false;
  conversionValue: any;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  nexturltonavigate: any;
  _secondaryProcessInfo$: Observable<SecondaryProcessDto[]>;
  _secondaryProcessMachine$: Observable<string[]>;
  _secondaryProcessMaterial$: Observable<string[]>;
  _secondaryProcessDeburringMachine$: Observable<string[]>;
  _secondaryProcessPowderCoatingMachine$: Observable<SecondaryProcessPowderMachineDto[]>;
  _secondaryProcessPowderCoatingStock$: Observable<string[]>;
  _secondaryProcessPowderCoatingBlasting$: Observable<string[]>;

  constructor(
    private _fb: FormBuilder,
    private messaging: MessagingService,
    private notSavedService: NotSavedService,
    private router: Router,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    private configservice: AppConfigurationService,
    private _store: Store,
    private _costingConfig: CostingConfig,
    public _shareService: SharedService
  ) {
    this._secondaryProcessInfo$ = this._store.select(SecondaryProcessInfoState.getSecondaryProcessInfos);
    this._secondaryProcessMachine$ = this._store.select(SecondaryProcessMachineState.getSecProcMachineDescription);
    this._secondaryProcessMaterial$ = this._store.select(SecondaryProcessMaterialState.getPowderCoatingMaterialDescription);
    this._secondaryProcessDeburringMachine$ = this._store.select(SecondaryProcessDeburringMachineState.getSecProcDeburringMachineDescription);
    this._secondaryProcessPowderCoatingMachine$ = this._store.select(SecondaryProcessPowderCoatingMachineState.getPowderCoatingMachineManufacture);
    this._secondaryProcessPowderCoatingStock$ = this._store.select(SecondaryProcessPowderCoatingStockState.getPowderCoatingStockForm);
    this._secondaryProcessPowderCoatingBlasting$ = this._store.select(SecondaryProcessShotBlastingState.getSecProcShotBlastingMachineDescription);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue?.partInfoId && changes['part'].currentValue != changes['part'].previousValue) {
      if (
        changes['part'].currentValue?.partInfoId != changes['part'].previousValue?.partInfoId ||
        changes['part'].currentValue?.commodityId != changes['part'].previousValue?.commodityId ||
        changes['part'].currentValue?.mfrCountryId != changes['part'].previousValue?.mfrCountryId ||
        changes['part'].currentValue?.mfrCountryId != changes['part'].previousValue?.eav
      ) {
        this.currentPart = changes['part'].currentValue;
        this.dispatchSecondaryProcessInfo(this.currentPart.partInfoId);
        this.reset();
        this.bindDataOnLoad();
      }
    }
  }

  dispatchSecondaryProcessInfo(partInfoId: number) {
    if (partInfoId) {
      this._store.dispatch(new SecondaryProcessInfoActions.GetSecondaryProcessInfosByPartInfoId(partInfoId));
    }
  }

  getSecondaryProcessInfo() {
    this._secondaryProcessInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: SecondaryProcessDto[]) => {
      if (result?.length > 0 && this.currentPart.partInfoId == result[0].partInfoId) {
        this.secondaryProcessList = result;

        if (this.isNewSecondaryinfo && this.secondaryProcessList.length > 0) {
          this.selectedSecondaryProcessInfoId = this.secondaryProcessList[this.secondaryProcessList.length - 1].secondaryProcessInfoId;
          this.isNewSecondaryinfo = false;
        }

        if (this.selectedSecondaryProcessInfoId == 0) {
          this.mapDataOnEdit(this.secondaryProcessList[0]);
        } else {
          this.mapDataOnEdit(this.secondaryProcessList.find((x) => x.secondaryProcessInfoId == this.selectedSecondaryProcessInfoId));
        }
      } else {
        this.secondaryProcessList = [];
        this.completionPercentageChange.emit(0);
      }
    });
  }

  ngOnInit() {
    this.setUnitMeasurement();
    this.getSecProcPlatingMachineDescriptionSubscribe();
    this.getPowderCoatingMaterialDescriptionSubscribe();
    this.getSecProcShotBlastingMachineDescriptionSubscribe();
    this.getSecProDeburringMachineDescriptionSubscribe();
    this.getSecondaryProcessInfo();
    this.costingSecProcessform = this._fb.group({
      secondaryProcessInfoId: [0],
      Secondary_Process: ['', [Validators.required]],
      InHouse_Outsourced: ['', [Validators.required]],
      platingMaterial: [''],
      Plating_area: [''],
      partWeight: [''],
      weldSize: [''],
      weldLength: [''],
      machineDescription: [''],
      platingMachineDescription: [''],
      shotBlastingMachineDescription: [''],
      deburringMachineDescription: [''],
      deburringCycleTime: [''],
      heatTreatMachineDescription: [''],
      Plating_Thick: [''],
      platingCost: [''],
      ProcessRemarks: [''],
      powderCoatingMaskingArea: [''],
      powderCoatingMethod: [''],
      coatingCoverage: [''],
      coatingThickness: [''],
      coatingArea: [''],
      powderCoatingMaterialDescription: [''],
      paintingMaterialDescription: [''],
      paintingCoatingArea: [''],
      paintingCoatingThickness: [''],
      paintingCoatingCoverage: [''],
      paintingCoatingMethod: [''],
      paintingMaskingArea: [''],
      htCycleTime: [''],
    });

    [...this.secondaryProcessNamesMap.keys()].forEach((x) => {
      const obj = new SelectModel();
      obj.id = x;
      obj.name = this.secondaryProcessNamesMap.get(x) || '';
      this.secondaryProcessNamesList.push(obj);
    });

    this.costingSecProcessform.valueChanges.subscribe((change) => {
      const value = this.percentageCalculator.secondaryProcess(change);
      this.completionPercentageChange.emit(value);
      this.dataCompletionPercentage = value;
    });

    this.recalculateSubject.subscribe(() => {
      this.recalculateSecondaryCost();
    });
  }

  ngAfterViewInit() {
    this.formLoaded.emit({
      componentName: 'costSecondaryProcessComponent',
      formName: 'costingSecProcessform',
      loadTime: 5000,
    });
  }

  recalculateSecondaryCost() {
    this.getSecondaryProcessInfo();
  }

  private getSecProcPlatingMachineDescriptionSubscribe() {
    this._secondaryProcessMachine$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: string[]) => {
      this.secondaryProcessPlatingMachineDescListMaster = result;
    });
  }

  private getPowderCoatingMaterialDescriptionSubscribe() {
    this._secondaryProcessMaterial$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: string[]) => {
      this.powderCoatingMaterialDescriptionListMaster = result;
      this.paintingMaterialDescriptionListMaster = result;
    });
  }

  private getSecProcShotBlastingMachineDescriptionSubscribe() {
    this._secondaryProcessPowderCoatingBlasting$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: string[]) => {
      this.secondaryProcessHTMachineDescListMaster = result;
    });
  }

  private getSecProDeburringMachineDescriptionSubscribe() {
    this._secondaryProcessDeburringMachine$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: string[]) => {
      this.secondaryProcessDeburringMachineDescListMaster = result;
    });
  }

  public get f() {
    return this.costingSecProcessform.controls;
  }

  public viewCTDetails(e: any) {
    const processvalueId = +e.currentTarget.value;
    this.mapViewCTDetails(processvalueId);
    this.resetPlatingCost();
  }

  private bindDataOnLoad() {
    if (this.secondaryProcessList?.length > 0 && this.costingSecProcessform) {
      this.mapDataOnEdit(this.secondaryProcessList[0]);
    }
  }

  private clearValidators() {
    this.costingSecProcessform.controls['platingMaterial'].clearValidators();
    this.costingSecProcessform.controls['Plating_area'].clearValidators();
    this.costingSecProcessform.controls['platingMachineDescription'].clearValidators();
    this.costingSecProcessform.controls['Plating_Thick'].clearValidators();
    this.costingSecProcessform.controls['htCycleTime'].clearValidators();
    this.costingSecProcessform.controls['heatTreatMachineDescription'].clearValidators();
    this.costingSecProcessform.controls['shotBlastingMachineDescription'].clearValidators();
    this.costingSecProcessform.controls['deburringMachineDescription'].clearValidators();
    this.costingSecProcessform.controls['deburringCycleTime'].clearValidators();
    this.costingSecProcessform.controls['partWeight'].clearValidators();
    this.costingSecProcessform.controls['weldSize'].clearValidators();
    this.costingSecProcessform.controls['weldLength'].clearValidators();
  }

  private platingDetails(obj: SecondaryProcessDto | null = null) {
    this.isPlating = true;
    this.clearValidators();
    this.makeEmpty();

    this.costingSecProcessform.controls['platingMaterial'].setValidators(Validators.required);
    this.costingSecProcessform.controls['Plating_area'].setValidators(Validators.required);
    this.costingSecProcessform.controls['platingMachineDescription'].setValidators(Validators.required);
    this.costingSecProcessform.controls['Plating_Thick'].setValidators(Validators.required);

    //this.costingSecProcessform.controls['platingCost'].disable();

    // others
    this.isHeatTreat = false;
    this.isShotBlasting = false;
    this.isWelding = false;
    this.isDeburring = false;
    this.isPowdercoating = false;
    this.isPainting = false;

    if (obj) {
      this.costingSecProcessform.controls['platingMaterial'].setValue(obj.materialDescription);
      this.costingSecProcessform.controls['Plating_area'].setValue(this.convertUomInUI(Number(obj.platingArea)));
      this.costingSecProcessform.controls['platingMachineDescription'].setValue(obj.machineDescription);
      this.costingSecProcessform.controls['Plating_Thick'].setValue(obj.platingThick);
    }

    this.updateFields();
  }

  private otherDetails() {
    this.isPlating = false;
    this.isHeatTreat = false;
    this.isShotBlasting = false;
    this.isWelding = false;
    this.isDeburring = false;
    this.isPowdercoating = false;
    this.isPainting = false;
    this.clearValidators();

    this.makeEmpty();
    this.costingSecProcessform.controls['platingCost'].setValidators(Validators.required);

    this.updateFields();
  }

  private powderCoatingDetails(obj: SecondaryProcessDto | null = null) {
    this.isPowdercoating = true;
    this.clearValidators();
    this.makeEmpty();

    this.costingSecProcessform.controls['powderCoatingMaskingArea'].setValidators(Validators.required);
    this.costingSecProcessform.controls['powderCoatingMethod'].setValidators(Validators.required);
    this.costingSecProcessform.controls['coatingCoverage'].setValidators(Validators.required);
    this.costingSecProcessform.controls['coatingThickness'].setValidators(Validators.required);
    this.costingSecProcessform.controls['coatingArea'].setValidators(Validators.required);
    this.costingSecProcessform.controls['powderCoatingMaterialDescription'].setValidators(Validators.required);

    // others
    this.isPlating = false;
    this.isShotBlasting = false;
    this.isWelding = false;
    this.isDeburring = false;
    this.isHeatTreat = false;
    this.isPainting = false;

    if (obj) {
      this.costingSecProcessform.controls['powderCoatingMaskingArea'].setValue(this.convertUomInUI(obj.maskPerimeter));
      this.costingSecProcessform.controls['powderCoatingMethod'].setValue(obj.paintingMethod);
      this.costingSecProcessform.controls['coatingCoverage'].setValue(obj.paintCoverage);
      this.costingSecProcessform.controls['coatingThickness'].setValue(obj.platingThick);
      this.costingSecProcessform.controls['coatingArea'].setValue(this.convertUomInUI(obj.platingArea));
      this.costingSecProcessform.controls['powderCoatingMaterialDescription'].setValue(obj.materialDescription);
    }

    this.updateFields();
  }

  private paintingDetails(obj: SecondaryProcessDto | null = null) {
    this.isPainting = true;

    this.clearValidators();
    this.makeEmpty();

    this.costingSecProcessform.controls['paintingMaterialDescription'].setValidators(Validators.required);
    this.costingSecProcessform.controls['paintingCoatingArea'].setValidators(Validators.required);
    this.costingSecProcessform.controls['paintingCoatingThickness'].setValidators(Validators.required);
    this.costingSecProcessform.controls['paintingCoatingCoverage'].setValidators(Validators.required);
    this.costingSecProcessform.controls['paintingCoatingMethod'].setValidators(Validators.required);
    this.costingSecProcessform.controls['paintingMaskingArea'].setValidators(Validators.required);

    // others
    this.isPlating = false;
    this.isShotBlasting = false;
    this.isWelding = false;
    this.isDeburring = false;
    this.isHeatTreat = false;
    this.isPowdercoating = false;

    if (obj) {
      this.costingSecProcessform.controls['paintingMaterialDescription'].setValue(obj.materialDescription);
      this.costingSecProcessform.controls['paintingCoatingArea'].setValue(this.convertUomInUI(obj.platingArea));
      this.costingSecProcessform.controls['paintingCoatingThickness'].setValue(obj.platingThick);
      this.costingSecProcessform.controls['paintingCoatingCoverage'].setValue(obj.paintCoverage);
      this.costingSecProcessform.controls['paintingCoatingMethod'].setValue(obj.paintingMethod);
      this.costingSecProcessform.controls['paintingMaskingArea'].setValue(this.convertUomInUI(obj.maskPerimeter));
    }

    this.updateFields();
  }

  private heatTreatmentDetails(obj: SecondaryProcessDto | null = null) {
    this.isHeatTreat = true;
    this.clearValidators();
    this.makeEmpty();
    this.costingSecProcessform.controls['htCycleTime'].setValidators(Validators.required);
    this.costingSecProcessform.controls['heatTreatMachineDescription'].setValidators(Validators.required);

    // others
    this.isPlating = false;
    this.isShotBlasting = false;
    this.isWelding = false;
    this.isDeburring = false;
    this.isPowdercoating = false;
    this.isPainting = false;

    if (obj) {
      this.costingSecProcessform.controls['htCycleTime'].setValue(obj.htcycletime);
      this.costingSecProcessform.controls['heatTreatMachineDescription'].setValue(obj.machineDescription);
    }

    this.updateFields();
  }

  private shotBlastingDetails(obj: SecondaryProcessDto | null = null) {
    this.isShotBlasting = true;
    this.clearValidators();
    this.makeEmpty();

    this.costingSecProcessform.controls['shotBlastingMachineDescription'].setValidators(Validators.required);
    this.costingSecProcessform.controls['partWeight'].setValidators(Validators.required);

    // others
    this.isPlating = false;
    this.isHeatTreat = false;
    this.isWelding = false;
    this.isDeburring = false;
    this.isPowdercoating = false;
    this.isPainting = false;

    if (obj) {
      this.costingSecProcessform.controls['shotBlastingMachineDescription'].setValue(obj.machineDescription);
      this.costingSecProcessform.controls['partWeight'].setValue(obj.platingArea);
    }

    this.updateFields();
  }

  private deburringDetails(obj: SecondaryProcessDto | null = null) {
    this.isDeburring = true;
    this.clearValidators();
    this.makeEmpty();

    this.costingSecProcessform.controls['deburringMachineDescription'].setValidators(Validators.required);
    this.costingSecProcessform.controls['deburringCycleTime'].setValidators(Validators.required);

    // others
    this.isPlating = false;
    this.isHeatTreat = false;
    this.isShotBlasting = false;
    this.isWelding = false;
    this.isPowdercoating = false;
    this.isPainting = false;

    if (obj) {
      this.costingSecProcessform.controls['deburringMachineDescription'].setValue(obj.machineDescription);
      this.costingSecProcessform.controls['deburringCycleTime'].setValue(obj.htcycletime);
    }

    this.updateFields();
  }

  private weldingDetails(obj: SecondaryProcessDto | null = null) {
    this.isWelding = true;
    this.clearValidators();
    this.makeEmpty();

    this.costingSecProcessform.controls['weldSize'].setValidators(Validators.required);
    this.costingSecProcessform.controls['weldLength'].setValidators(Validators.required);

    // others
    this.isPlating = false;
    this.isHeatTreat = false;
    this.isShotBlasting = false;
    this.isDeburring = false;
    this.isPowdercoating = false;
    this.isPainting = false;

    if (obj) {
      this.costingSecProcessform.controls['weldSize'].setValue(this.convertUomInUI(obj.platingThick));
      this.costingSecProcessform.controls['weldLength'].setValue(this.convertUomInUI(obj.platingArea));
    }

    this.updateFields();
  }

  private updateFields() {
    this.costingSecProcessform.controls['platingMaterial'].updateValueAndValidity();
    this.costingSecProcessform.controls['Plating_area'].updateValueAndValidity();
    this.costingSecProcessform.controls['platingMachineDescription'].updateValueAndValidity();
    this.costingSecProcessform.controls['Plating_Thick'].updateValueAndValidity();
    this.costingSecProcessform.controls['htCycleTime'].updateValueAndValidity();
    this.costingSecProcessform.controls['heatTreatMachineDescription'].updateValueAndValidity();
    this.costingSecProcessform.controls['platingCost'].updateValueAndValidity();
    this.costingSecProcessform.controls['shotBlastingMachineDescription'].updateValueAndValidity();
    this.costingSecProcessform.controls['deburringMachineDescription'].updateValueAndValidity();
    this.costingSecProcessform.controls['deburringCycleTime'].updateValueAndValidity();
    this.costingSecProcessform.controls['partWeight'].updateValueAndValidity();
    this.costingSecProcessform.controls['weldSize'].updateValueAndValidity();
    this.costingSecProcessform.controls['weldLength'].updateValueAndValidity();
    this.costingSecProcessform.controls['powderCoatingMaskingArea'].updateValueAndValidity();
    this.costingSecProcessform.controls['powderCoatingMethod'].updateValueAndValidity();
    this.costingSecProcessform.controls['coatingCoverage'].updateValueAndValidity();
    this.costingSecProcessform.controls['coatingThickness'].updateValueAndValidity();
    this.costingSecProcessform.controls['coatingArea'].updateValueAndValidity();
    this.costingSecProcessform.controls['powderCoatingMaterialDescription'].updateValueAndValidity();
    this.costingSecProcessform.controls['paintingMaterialDescription'].updateValueAndValidity();
    this.costingSecProcessform.controls['paintingCoatingArea'].updateValueAndValidity();
    this.costingSecProcessform.controls['paintingCoatingThickness'].updateValueAndValidity();
    this.costingSecProcessform.controls['paintingCoatingCoverage'].updateValueAndValidity();
    this.costingSecProcessform.controls['paintingCoatingMethod'].updateValueAndValidity();
    this.costingSecProcessform.controls['paintingMaskingArea'].updateValueAndValidity();
  }

  private makeEmpty() {
    this.costingSecProcessform.controls['platingMaterial'].setValue('');
    this.costingSecProcessform.controls['Plating_area'].setValue('');
    this.costingSecProcessform.controls['platingMachineDescription'].setValue('');
    this.costingSecProcessform.controls['Plating_Thick'].setValue('');
    this.costingSecProcessform.controls['htCycleTime'].setValue('');
    this.costingSecProcessform.controls['heatTreatMachineDescription'].setValue('');
    this.costingSecProcessform.controls['shotBlastingMachineDescription'].setValue('');
    this.costingSecProcessform.controls['deburringMachineDescription'].setValue('');
    this.costingSecProcessform.controls['deburringCycleTime'].setValue('');
    this.costingSecProcessform.controls['partWeight'].setValue('');
    this.costingSecProcessform.controls['weldSize'].setValue('');
    this.costingSecProcessform.controls['weldLength'].setValue('');
    this.costingSecProcessform.controls['powderCoatingMaskingArea'].setValue('');
    this.costingSecProcessform.controls['powderCoatingMethod'].setValue('');
    this.costingSecProcessform.controls['coatingCoverage'].setValue('');
    this.costingSecProcessform.controls['coatingThickness'].setValue('');
    this.costingSecProcessform.controls['coatingArea'].setValue('');
    this.costingSecProcessform.controls['powderCoatingMaterialDescription'].setValue('');
    this.costingSecProcessform.controls['paintingMaterialDescription'].setValue('');
    this.costingSecProcessform.controls['paintingCoatingArea'].setValue('');
    this.costingSecProcessform.controls['paintingCoatingThickness'].setValue('');
    this.costingSecProcessform.controls['paintingCoatingCoverage'].setValue('');
    this.costingSecProcessform.controls['paintingCoatingMethod'].setValue('');
    this.costingSecProcessform.controls['paintingMaskingArea'].setValue('');
  }

  private mapViewCTDetails(processvalueId: number, obj: SecondaryProcessDto | null = null) {
    this.isPlating = processvalueId == SecondaryProcessNames.Plating ? true : false;
    this.isHeatTreat = processvalueId == SecondaryProcessNames.HeatTreatment ? true : false;
    this.isShotBlasting = processvalueId == SecondaryProcessNames.ShotBlasting ? true : false;
    this.isWelding = processvalueId == SecondaryProcessNames.MIGWelding ? true : false;
    this.isDeburring = processvalueId == SecondaryProcessNames.Deburring ? true : false;
    this.isPowdercoating = processvalueId == SecondaryProcessNames.PowderCoating ? true : false;
    this.isPainting = processvalueId == SecondaryProcessNames.Painting ? true : false;
    this.clearValidators();
    this.makeEmpty();
    this.updateFields();

    if (processvalueId == SecondaryProcessNames.Plating) {
      if (this.secondaryProcessPlatingMachineDescListMaster && this.secondaryProcessPlatingMachineDescListMaster.length > 0) {
        this.secondaryProcessPlatingMachineDescList = this.secondaryProcessPlatingMachineDescListMaster.filter(function (elem: any, index: any, self: any) {
          return index === self.indexOf(elem);
        });
        this.platingDetails(obj);
      }
    }

    if (processvalueId == SecondaryProcessNames.Other) {
      this.otherDetails();
    }

    if (processvalueId == SecondaryProcessNames.HeatTreatment) {
      this.heatTreatmentDetails(obj);
    }

    if (processvalueId == SecondaryProcessNames.MIGWelding) {
      this.weldingDetails(obj);
    }

    if (processvalueId == SecondaryProcessNames.ShotBlasting) {
      if (this.secondaryProcessHTMachineDescListMaster && this.secondaryProcessHTMachineDescListMaster.length > 0) {
        this.secondaryProcessHTMachineDescList = this.secondaryProcessHTMachineDescListMaster.filter(function (elem: any, index: any, self: any) {
          return index === self.indexOf(elem);
        });
        this.shotBlastingDetails(obj);
      }
    }

    if (processvalueId == SecondaryProcessNames.Deburring) {
      if (this.secondaryProcessDeburringMachineDescListMaster && this.secondaryProcessDeburringMachineDescListMaster.length > 0) {
        this.secondaryProcessDeburringMachineDescList = this.secondaryProcessDeburringMachineDescListMaster.filter(function (elem: any, index: any, self: any) {
          return index === self.indexOf(elem);
        });
        this.deburringDetails(obj);
      }
    }

    if (processvalueId == SecondaryProcessNames.PowderCoating) {
      if (this.powderCoatingMaterialDescriptionListMaster && this.powderCoatingMaterialDescriptionListMaster.length > 0) {
        this.powderCoatingMaterialDescriptionList = this.powderCoatingMaterialDescriptionListMaster.filter(function (elem: any, index: any, self: any) {
          return index === self.indexOf(elem);
        });
        this.powderCoatingDetails(obj);
      }
    }

    if (processvalueId == SecondaryProcessNames.Painting) {
      if (this.paintingMaterialDescriptionListMaster && this.paintingMaterialDescriptionListMaster.length > 0) {
        this.paintingMaterialDescriptionList = this.paintingMaterialDescriptionListMaster.filter(function (elem: any, index: any, self: any) {
          return index === self.indexOf(elem);
        });
        this.paintingDetails(obj);
      }
    }

    this.costingSecProcessform.updateValueAndValidity();
  }

  onDeleteClick(e: any, _nextIndex: number, _prevIndex: number) {
    const id = +e.currentTarget.name;
    // const obj = this.secondaryProcessList[nextIndex] ? this.secondaryProcessList[nextIndex] : this.secondaryProcessList[prevIndex];

    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Confirm Delete',
        message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .pipe(first())
      .subscribe((result) => {
        if (result) {
          if (id) {
            this._store.dispatch(new SecondaryProcessInfoActions.DeleteSecondaryProcessInfo(id, this.currentPart.partInfoId));
            this.secondaryProcessList = this.secondaryProcessList.filter((x) => x.secondaryProcessInfoId != id);
            this.messaging.openSnackBar(`Secondary Process has been deleted successfully..`, '', { duration: 5000 });
            if (this.secondaryProcessList != null && this.secondaryProcessList.length > 0) {
              this.selectedSecondaryProcessInfoId = this.secondaryProcessList[this.secondaryProcessList.length - 1].secondaryProcessInfoId;
            } else {
              this.selectedSecondaryProcessInfoId = 0;
            }
            if (this.selectedSecondaryProcessInfoId > 0) {
              this.mapDataOnEdit(this.secondaryProcessList.find((x) => x.secondaryProcessInfoId == this.selectedSecondaryProcessInfoId));
            } else {
              this.reset();
            }
          }
        }
      });
  }

  onEditClick(secondaryProcessDto: SecondaryProcessDto) {
    if (secondaryProcessDto) {
      this.costingSecProcessform.markAsPristine();
      this.mapDataOnEdit(secondaryProcessDto);
    }
  }

  setUnitMeasurement() {
    const user = localStorage.getItem('user');
    if (JSON.parse(user)) {
      this.conversionValue = 'mm';
      const users = JSON.parse(user);
      if (users.client.uomId) {
        this.isEnableUnitConversion = true;
        this.conversionValue = this._costingConfig.getUnitOfMeasure()?.find((x) => x.id == users.client.uomId)?.convertionValue;
      }
    }
  }

  convertUomInUI(value: number) {
    return this._shareService.convertUomInUI(value, this.conversionValue, this.isEnableUnitConversion);
  }

  convertUomToSaveAndCalculation(value: number) {
    return this._shareService.convertUomToSaveAndCalculation(value, this.conversionValue, this.isEnableUnitConversion);
  }

  private mapDataOnEdit(secondaryProcessDto: SecondaryProcessDto) {
    const obj = secondaryProcessDto;
    this.selectedSecondaryProcessInfoId = obj.secondaryProcessInfoId;
    this.mapViewCTDetails(obj.secondaryProcessId || 0, obj);

    if (this.costingSecProcessform) {
      this.costingSecProcessform.controls['secondaryProcessInfoId'].setValue(secondaryProcessDto.secondaryProcessInfoId);
      this.costingSecProcessform.controls['InHouse_Outsourced'].setValue(obj.inHouseOutsource);
      this.costingSecProcessform.controls['Secondary_Process'].setValue(obj.secondaryProcessId);
      this.costingSecProcessform.controls['platingCost'].setValue(this._shareService.isValidNumber(obj.platingCost));
      this.costingSecProcessform.controls['ProcessRemarks'].setValue(obj.processRemarks);
      this.costingSecProcessform.controls['platingMaterial'].setValue(obj.partComplexity);
      this.costingSecProcessform.controls['platingMaterial'].setValue(obj.materialDescription);
      this.costingSecProcessform.controls['Plating_area'].setValue(this.convertUomInUI(obj.platingArea));
      this.costingSecProcessform.controls['Plating_Thick'].setValue(obj.platingThick);
      this.costingSecProcessform.controls['htCycleTime'].setValue(obj.htcycletime);
      this.costingSecProcessform.controls['htCycleTime'].setValue(obj.htcycletime);
      if (obj.secondaryProcessId == this.secondaryProcessNames.Plating) {
        this.costingSecProcessform.controls['platingMachineDescription'].setValue(obj.machineDescription);
      } else if (obj.secondaryProcessId == this.secondaryProcessNames.HeatTreatment) {
        this.costingSecProcessform.controls['heatTreatMachineDescription'].setValue(obj.machineDescription);
      } else if (obj.secondaryProcessId == this.secondaryProcessNames.ShotBlasting) {
        this.costingSecProcessform.controls['shotBlastingMachineDescription'].setValue(obj.machineDescription);
        this.costingSecProcessform.controls['partWeight'].setValue(this.convertUomInUI(obj.platingArea));
      } else if (obj.secondaryProcessId == this.secondaryProcessNames.MIGWelding) {
        this.costingSecProcessform.controls['weldSize'].setValue(this.convertUomInUI(obj.platingThick));
        this.costingSecProcessform.controls['weldLength'].setValue(this.convertUomInUI(obj.platingArea));
      } else if (obj.secondaryProcessId == this.secondaryProcessNames.Deburring) {
        this.costingSecProcessform.controls['deburringMachineDescription'].setValue(obj.machineDescription);
        this.costingSecProcessform.controls['deburringCycleTime'].setValue(obj.htcycletime);
      } else if (obj.secondaryProcessId == this.secondaryProcessNames.PowderCoating) {
        this.costingSecProcessform.controls['powderCoatingMethod'].setValue(obj.paintingMethod);
        this.costingSecProcessform.controls['coatingThickness'].setValue(obj.platingThick);
        this.costingSecProcessform.controls['coatingArea'].setValue(obj.platingArea);
        this.costingSecProcessform.controls['coatingCoverage'].setValue(this.convertUomInUI(obj.paintCoverage));
        this.costingSecProcessform.controls['powderCoatingMaterialDescription'].setValue(obj.materialDescription);
        this.costingSecProcessform.controls['powderCoatingMaskingArea'].setValue(this.convertUomInUI(obj.maskPerimeter));
      } else if (obj.secondaryProcessId == this.secondaryProcessNames.Painting) {
        this.costingSecProcessform.controls['paintingCoatingMethod'].setValue(obj.paintingMethod);
        this.costingSecProcessform.controls['paintingCoatingCoverage'].setValue(obj.paintCoverage);
        this.costingSecProcessform.controls['paintingCoatingThickness'].setValue(obj.platingThick);
        this.costingSecProcessform.controls['paintingCoatingArea'].setValue(this.convertUomInUI(obj.platingArea));
        this.costingSecProcessform.controls['paintingMaterialDescription'].setValue(obj.materialDescription);
        this.costingSecProcessform.controls['paintingMaskingArea'].setValue(this.convertUomInUI(obj.maskPerimeter));
      }
    }
  }

  private mapModel(): SecondaryProcessDto {
    const model = new SecondaryProcessDto();
    model.secondaryProcessInfoId = this.costingSecProcessform.controls['secondaryProcessInfoId'].value || 0;
    model.secondaryProcessId = +(this.costingSecProcessform.controls['Secondary_Process'].value || undefined);
    model.platingCost = +(this.costingSecProcessform.controls['platingCost'].value || 0);
    model.inHouseOutsource = +(this.costingSecProcessform.controls['InHouse_Outsourced'].value || undefined);
    model.partComplexity = this.costingSecProcessform.controls['platingMaterial'].value || '';
    model.materialDescription = this.costingSecProcessform.controls['platingMaterial'].value || '';
    model.platingArea = +(this.convertUomToSaveAndCalculation(this.costingSecProcessform.controls['Plating_area'].value) || 0);
    model.platingThick = +(this.costingSecProcessform.controls['Plating_Thick'].value || 0);
    model.htcycletime = +(this.costingSecProcessform.controls['htCycleTime'].value || 0);
    model.processRemarks = this.costingSecProcessform.controls['ProcessRemarks'].value || '';
    model.dataCompletionPercentage = this.dataCompletionPercentage;
    if (model.secondaryProcessId == this.secondaryProcessNames.Plating) {
      model.machineDescription = this.costingSecProcessform.controls['platingMachineDescription'].value || '';
    } else if (model.secondaryProcessId == this.secondaryProcessNames.HeatTreatment) {
      model.machineDescription = this.costingSecProcessform.controls['heatTreatMachineDescription'].value || '';
    } else if (model.secondaryProcessId == this.secondaryProcessNames.ShotBlasting) {
      model.machineDescription = this.costingSecProcessform.controls['shotBlastingMachineDescription'].value || '';
      model.platingArea = this.costingSecProcessform.controls['partWeight'].value || 0;
    } else if (model.secondaryProcessId == this.secondaryProcessNames.MIGWelding) {
      model.platingThick = +this.convertUomToSaveAndCalculation(this.costingSecProcessform.controls['weldSize'].value || 0);
      model.platingArea = +this.convertUomToSaveAndCalculation(this.costingSecProcessform.controls['weldLength'].value || 0);
    } else if (model.secondaryProcessId == this.secondaryProcessNames.Deburring) {
      model.machineDescription = this.costingSecProcessform.controls['deburringMachineDescription'].value || '';
      model.htcycletime = +(this.costingSecProcessform.controls['deburringCycleTime'].value || 0);
    } else if (model.secondaryProcessId == this.secondaryProcessNames.PowderCoating) {
      model.paintingMethod = this.costingSecProcessform.controls['powderCoatingMethod'].value || '';
      model.paintCoverage = +(this.costingSecProcessform.controls['coatingCoverage'].value || 0);
      model.platingThick = +(this.costingSecProcessform.controls['coatingThickness'].value || 0);
      model.platingArea = +(this.costingSecProcessform.controls['coatingArea'].value || 0);
      model.materialDescription = this.costingSecProcessform.controls['powderCoatingMaterialDescription'].value || '';
      model.maskPerimeter = +this.convertUomToSaveAndCalculation(this.costingSecProcessform.controls['powderCoatingMaskingArea'].value || 0);
    } else if (model.secondaryProcessId == this.secondaryProcessNames.Painting) {
      model.paintingMethod = this.costingSecProcessform.controls['paintingCoatingMethod'].value || '';
      model.paintCoverage = +(this.costingSecProcessform.controls['paintingCoatingCoverage'].value || 0);
      model.platingThick = +(this.costingSecProcessform.controls['paintingCoatingThickness'].value || 0);
      model.platingArea = +(this.costingSecProcessform.controls['paintingCoatingArea'].value || 0);
      model.materialDescription = this.costingSecProcessform.controls['paintingMaterialDescription'].value || '';
      model.maskPerimeter = +this.convertUomToSaveAndCalculation(this.costingSecProcessform.controls['paintingMaskingArea'].value || 0);
    }

    model.partInfoId = this.currentPart.partInfoId;
    model.finishingOn = '';
    model.finishLayer = '';
    model.machineMfr2 = '';
    model.paymentTerms = '';
    model.machineDescription2 = '';
    model.countryId = this.currentPart.mfrCountryId;
    if (!model.machineRunningMode) model.machineRunningMode = 'Semi-Auto';

    return model;
  }
  public onFormSubmit(): Observable<SecondaryProcessDto> {
    const model = this.mapModel();
    if (model.secondaryProcessInfoId > 0) {
      this._store.dispatch(new SecondaryProcessInfoActions.UpdateSecondaryProcessInfo(model));
      this.navigatetoNextUrl();
      this.costingSecProcessform.markAsPristine();
      this.messaging.openSnackBar(`Data updated successfully.`, '', { duration: 5000 });
      this.percentageCalculator.dispatchHasPartSectionDataUpdateEvent({});
      this.selectedSecondaryProcessInfoId = model.secondaryProcessInfoId;
      this.isNewSecondaryinfo = false;
    } else {
      this.saveSecondaryProcess(model);
    }

    return new Observable((obs) => {
      obs.next(model);
    });
  }

  public onAddSecondaryProcess() {
    const model = new SecondaryProcessDto();
    model.secondaryProcessInfoId = 0;
    model.secondaryProcessId = undefined;
    model.platingCost = 0;
    model.inHouseOutsource = undefined;
    model.partComplexity = '';
    model.materialDescription = '';
    model.platingArea = 0;
    model.platingThick = 0;
    model.htcycletime = 0;
    model.processRemarks = '';
    model.machineDescription = '';
    model.platingArea = 0;
    model.platingThick = 0;
    model.platingArea = 0;
    model.htcycletime = 0;
    model.paintCoverage = 0;
    model.maskPerimeter = 0;
    model.setupCost = 0;
    model.materialStockForm = '';
    model.partInfoId = this.currentPart.partInfoId;
    model.countryId = this.currentPart.mfrCountryId;

    if (!model.machineRunningMode) model.machineRunningMode = 'Semi-Auto';

    this.saveSecondaryProcess(model);
  }

  private saveSecondaryProcess(model: SecondaryProcessDto) {
    this._store.dispatch(new SecondaryProcessInfoActions.CreateSecondaryProcessInfo(model));
    this.messaging.openSnackBar(`Data saved successfully.`, '', { duration: 5000 });
    if (model?.secondaryProcessInfoId > 0) {
      this.isNewSecondaryinfo = false;
      this.selectedSecondaryProcessInfoId = model?.secondaryProcessInfoId;
    } else {
      this.isNewSecondaryinfo = true;
      this.selectedSecondaryProcessInfoId = 0;
    }
    this.navigatetoNextUrl();
    this.costingSecProcessform.markAsPristine();
    this.percentageCalculator.dispatchHasPartSectionDataUpdateEvent({});
  }

  private reset() {
    if (this.costingSecProcessform) {
      this.costingSecProcessform.reset({
        secondaryProcessInfoId: 0,
        Secondary_Process: '',
        InHouse_Outsourced: '',
        platingMaterial: '',
        Plating_area: '',
        platingMachineDescription: '',
        shotBlastingMachineDescription: '',
        deburringMachineDescription: '',
        deburringCycleTime: '',
        heatTreatMachineDescription: '',
        powderCoatingMaskingArea: '',
        paintingMaterialDescription: '',
        paintingCoatingArea: '',
        paintingCoatingThickness: '',
        paintingCoatingCoverage: '',
        paintingCoatingMethod: '',
        paintingMaskingArea: '',
        powderCoatingMethod: '',
        coatingCoverage: '',
        coatingThickness: '',
        coatingArea: '',
        powderCoatingMaterialDescription: '',
        Plating_Thick: '',
        platingCost: '',
        ProcessRemarks: '',
        htCycleTime: '',
        partWeight: '',
        weldSize: '',
        weldLength: '',
      });

      this.isPlating = false;
      this.isHeatTreat = false;
      this.isWelding = false;
      this.isDeburring = false;
      this.isPowdercoating = false;
      this.isPainting = false;
      this.selectedSecondaryProcessInfoId = 0;
    }
  }
  public checkIfFormDirty() {
    return this.costingSecProcessform.dirty;
  }
  public resetform() {
    return this.costingSecProcessform.reset();
  }

  public getFormData() {
    return this.costingSecProcessform.value;
  }

  onFormValueChange() {
    this.afterChange = true;
    this.dirtyCheckEvent.emit(this.afterChange);
  }

  resetPlatingCost() {
    this.costingSecProcessform.controls['platingCost'].setValue('0');
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  private navigatetoNextUrl() {
    if (this.nexturltonavigate != '' && this.nexturltonavigate != undefined) {
      const tempUrl = this.nexturltonavigate + '?ignoreactivate=1';
      this.nexturltonavigate = '';
      this.router.navigateByUrl(tempUrl);
    }
  }
}
