import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MaterialPCBConfigService, PCBLayer } from 'src/app/shared/config/material-pcb-config';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { RoutingScoring } from 'src/app/shared/config/manufacturing-pcb-config';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { MatIconModule } from '@angular/material/icon';
import { StackupDiagramComponent } from '../stackup-diagram/stackup-diagram.component';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import { PartInfoDto } from 'src/app/shared/models';
import { SharedService } from '../../../services/shared.service';
import { MaterialPCBMappingService } from 'src/app/shared/mapping/material-pcb-mapping.service';
import { PanelUtilizationComponent } from './panel-utilization/panel-utilization.component';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { MatTooltip } from '@angular/material/tooltip';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { PCBAService } from 'src/app/shared/services/pcba-.service';

@Component({
  selector: 'app-pcb-material',
  templateUrl: './pcb-material.component.html',
  styleUrls: ['./pcb-material.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, FieldCommentComponent, MatIconModule, MatTooltip, AutoTooltipDirective],
})
export class PCBMaterialComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() passivationVals;
  @Input() currentPart: PartInfoDto;
  @Input() processFlag;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  public popoverHook: NgbPopover;
  popupName: any;
  popupUrl;
  lstdescriptions: any = (DescriptionJson as any).default;
  copperLayers: any[] = [];
  prepregTypeList: any[] = [];
  copperThicknessList: any[] = [];
  coreThicknessList: any[] = [];
  surfaceFInishList: any[] = [];
  showMinRouterBit: boolean = false;
  showImpedenceFields: boolean = false;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  laminatesList: any[] = [];
  prepregList: any[] = [];

  laminateCoreThicknessList: any[] = [];
  laminateCopperThicknessList: any[] = [];
  laminateMaterialTypeList: any[] = [];
  laminateMaterialGradeList: any[] = [];
  laminateCategoryList: any[] = [];

  fullLaminateCoreThicknessList: any[] = [];
  fullLaminateCopperThicknessList: any[] = [];
  fullLaminateMaterialTypeList: any[] = [];
  fullLaminateMaterialGradeList: any[] = [];
  fullLaminateCategoryList: any[] = [];

  prepregCodeList: any[] = [];
  prepregTypesList: any[] = [];
  prepregGradeList: any[] = [];

  fullPrepregCodeList: any[] = [];
  fullPrepregTypesList: any[] = [];
  fullPrepregGradeList: any[] = [];
  calculatedUtilizationList: any[] = [];
  rigidLayerConstructionList: any[] = [];

  constructor(
    private pcbconfigService: MaterialPCBConfigService,
    private modalService: NgbModal,
    private _store: Store,
    public sharedService: SharedService,
    private _pcbaInfoService: PCBAService,
    private pcbcmapperService: MaterialPCBMappingService,
    private messaging: MessagingService
  ) {}

  ngOnInit(): void {
    this.getPrepregMaterialMaster();
    this.copperLayers = this.pcbconfigService.getCopperLayersList();
    this.copperThicknessList = this.pcbconfigService.getCopperThicknessList();
    this.surfaceFInishList = this.pcbconfigService.getSurfaceFInish();
    this.showMinRouterBit = this.f.cavityEnvelopWidth?.value === RoutingScoring.Routing || this.f.beadSize?.value > 0;
    this.showImpedenceFields = this.f.typeOfCable?.value === 1;
    this.rigidLayerConstructionList = this.pcbconfigService.getRigidLayerConstruction();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['passivationVals'] && changes['passivationVals'].currentValue) {
      if (this.sandForCoreFormArray?.controls?.length <= 0) {
        this.addDefaultEntries();
      }
    }
  }

  addDefaultEntries() {
    this.sandForCoreFormArray?.clear();
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.Copper));
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.Core));
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.Prepreg));
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.Drilling));
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.Drilling));
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.Drilling));
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.Drilling));
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.CoreCost));
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.PrepregCost));
  }

  calculateCost(fieldName = '', index = 0) {
    this.getUtilizationList();
    this.rigidLayerConstructionList = this.pcbconfigService.getRigidLayerConstruction(Number(this.f.typeOfWeld?.value));
    setTimeout(() => {
      this.doCalculateCost.emit({ fieldName, index, dataItems: { laminatesList: this.laminatesList, prepregList: this.prepregList } });
      this.manageFlags();
      this.validateMatixValues();
    }, 100);
  }

  manageFlags() {
    this.showMinRouterBit = this.f.cavityEnvelopWidth?.value === RoutingScoring.Routing;
    this.showImpedenceFields = this.f.typeOfCable?.value === 1;
  }

  getUtilizationList() {
    if (this.formGroup?.controls?.closingTime?.value > 0 && this.formGroup?.controls?.injectionTime?.value > 0) {
      const arraySizeXInch = this.sharedService.isValidNumber(this.formGroup?.controls?.closingTime?.value / 25.4);
      const arraySizeYInch = this.sharedService.isValidNumber(this.formGroup?.controls?.injectionTime?.value / 25.4);
      const utilizationList = this.pcbconfigService.getLinXList(arraySizeXInch, arraySizeYInch)?.panelInfo ?? [];
      this.calculatedUtilizationList = utilizationList.sort((a, b) => b.percent - a.percent);
    }
  }

  loadMarketData() {
    this._store.dispatch(new MasterDataActions.GetMaterialMasterByCountryId(this.currentPart?.mfrCountryId));
  }

  validateMatixValues() {
    if (this.sharedService.hasFraction(Number(this.f.runnerDia?.value)) || this.sharedService.hasFraction(Number(this.f.runnerLength?.value))) {
      this.messaging.openSnackBar(`Incorrect Matrix Values!! Please correct Inputs.`, '', {
        duration: 5000,
      });
    }
  }

  get f() {
    return this.formGroup?.controls ?? ({} as { [key: string]: any });
  }
  setDropdownValues() {
    const coreEntries = this.getControlsByCore(PCBLayer.Core);
    coreEntries?.forEach((core, index) => {
      if (index > 0) {
        this.fullLaminateCoreThicknessList.push(this.laminateCoreThicknessList);
        this.fullLaminateCopperThicknessList.push(this.laminateCopperThicknessList);
        this.fullLaminateMaterialTypeList.push(this.laminateMaterialTypeList);
        this.fullLaminateMaterialGradeList.push(this.laminateMaterialGradeList);
        this.fullLaminateCategoryList.push(this.laminateCategoryList);
      }
      this.setCoreThicknessChange(core?.value?.coreLength, index);
      this.setCopperThicknessChange(index, core?.value?.coreHeight);
      this.categoryChange(index, true);
      this.setMterialTypeChange(core?.value?.coreShape, index);
    });
    this.patchCorePrepregSelections(coreEntries);
    const prepregEntries = this.getControlsByCore(PCBLayer.Prepreg);
    prepregEntries?.forEach((prepreg, index) => {
      if (index > 0) {
        this.fullPrepregCodeList.push(this.prepregCodeList);
        this.fullPrepregTypesList.push(this.prepregTypesList);
        this.fullPrepregGradeList.push(this.prepregGradeList);
      }
      this.setPrepregCodeChange(prepreg?.value?.coreLength, index);
      this.setPrepregTypeChange(prepreg?.value?.coreHeight, index);
    });
  }

  patchCorePrepregSelections(coreEntries: any) {
    coreEntries?.forEach((core, index) => {
      this.getControlsByCore(PCBLayer.Core)[index]?.patchValue({
        coreHeight: core?.value?.coreHeight,
        coreWidth: core?.value?.coreWidth,
        coreShape: core?.value?.coreShape,
        coreArea: core?.value?.coreArea,
      });
    });
  }

  getPrepregMaterialMaster() {
    if (!this.currentPart?.mfrCountryId) {
      return;
    }
    this._pcbaInfoService
      .getMaterialMasterByCountryId(this.currentPart.mfrCountryId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any) => {
        if (result?.length) {
          this.laminatesList = result?.filter((x) => x.layerType === 1);
          this.prepregList = result?.filter((x) => x.layerType === 2);
          const seen = new Set<string>();
          this.laminateCoreThicknessList = this.laminatesList
            ?.filter((item) => {
              if (seen?.has(item.coreThickness)) return false;
              seen?.add(item.coreThickness);
              return true;
            })
            ?.map((item) => item)
            ?.sort((a, b) => a.coreThickness - b.coreThickness);
          this.fullLaminateCoreThicknessList.push(this.laminateCoreThicknessList);
          this.laminateCopperThicknessList = this.laminatesList
            ?.filter((item) => {
              if (seen?.has(item.copperThickness)) return false;
              seen?.add(item.copperThickness);
              return true;
            })
            ?.map((item) => item);
          this.fullLaminateCopperThicknessList.push(this.laminateCopperThicknessList);
          this.laminateCategoryList = this.laminatesList
            ?.filter((item) => {
              if (seen?.has(item.materialCategory)) return false;
              seen?.add(item.materialCategory);
              return true;
            })
            ?.map((item) => item);

          this.fullLaminateCategoryList.push(this.laminateCategoryList);
          this.laminateMaterialTypeList = this.laminatesList
            ?.filter((item) => {
              if (seen?.has(item.materialType)) return false;
              seen?.add(item.materialType);
              return true;
            })
            ?.map((item) => item);
          this.fullLaminateMaterialTypeList.push(this.laminateMaterialTypeList);
          this.laminateMaterialGradeList = this.laminatesList
            ?.filter((item) => {
              if (seen?.has(item.materialGrade)) return false;
              seen?.add(item.materialGrade);
              return true;
            })
            ?.map((item) => item);

          this.fullLaminateMaterialGradeList.push(this.laminateMaterialGradeList);
          this.prepregCodeList = this.prepregList
            ?.filter((item) => {
              if (seen?.has(item.materialCategory)) return false;
              seen?.add(item.materialCategory);
              return true;
            })
            ?.map((item) => item)
            .sort((a, b) => a.materialCategory - b.materialCategory);
          seen.clear();
          this.fullPrepregCodeList.push(this.prepregCodeList);
          this.prepregTypesList = this.prepregList
            ?.filter((item) => {
              if (seen?.has(item.materialType)) return false;
              seen?.add(item.materialType);
              return true;
            })
            ?.map((item) => item);
          seen.clear();
          this.fullPrepregTypesList.push(this.prepregTypesList);
          this.prepregGradeList = this.prepregList
            ?.filter((item) => {
              if (seen?.has(item.materialGrade)) return false;
              seen?.add(item.materialGrade);
              return true;
            })
            ?.map((item) => item);
          this.fullPrepregGradeList.push(this.prepregGradeList);
          this.setDropdownValues();
        }
      });
  }

  addMoreCore(coreTypeId) {
    this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, coreTypeId));
    if (coreTypeId === PCBLayer.Core) {
      this.fullLaminateCoreThicknessList.push(this.laminateCoreThicknessList);
      this.fullLaminateCopperThicknessList.push(this.laminateCopperThicknessList);
      this.fullLaminateMaterialTypeList.push(this.laminateMaterialTypeList);
      this.fullLaminateMaterialGradeList.push(this.laminateMaterialGradeList);
      this.fullLaminateCategoryList.push(this.laminateCategoryList);
      this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.CoreCost));
    } else if (coreTypeId === PCBLayer.Prepreg) {
      this.fullPrepregCodeList.push(this.prepregCodeList);
      this.fullPrepregTypesList.push(this.prepregTypesList);
      this.fullPrepregGradeList.push(this.prepregGradeList);
      this.sandForCoreFormArray?.push(this.pcbcmapperService.sandForCoreFormGroup(0, PCBLayer.PrepregCost));
    }

    this.calculateCost();
  }

  onDeleteSubCore(index: number, pcbType: number = 0) {
    if (this.sandForCoreFormArray?.controls) {
      this.removeItemFromFormArray(this.getControlsByCore(pcbType)[index]);
      if ([PCBLayer.Core, PCBLayer.Prepreg].includes(pcbType)) {
        this.removeItemFromFormArray(this.getControlsByCore(pcbType === PCBLayer.Core ? PCBLayer.CoreCost : PCBLayer.PrepregCost)[index]);
      }
    }
    this.dirtyCheckEvent.emit(true);
    this.calculateCost();
  }

  coreThicknessChange(event: any, filteredIndex: number) {
    const coreThicknessId = Number(event.currentTarget.value);
    this.setCoreThicknessChange(coreThicknessId, filteredIndex);
  }
  setCoreThicknessChange(coreThicknessId: number, filteredIndex: number) {
    const coreThickness = this.fullLaminateCoreThicknessList[filteredIndex]?.find((x) => x.electronicsMaterialMasterId === coreThicknessId)?.coreThickness;
    this.fullLaminateCopperThicknessList[filteredIndex] = Array.from(
      new Map(this.laminatesList.filter((item) => item.coreThickness === coreThickness).map((item) => [item.copperThickness, item])).values()
    );
    this.calculateCost();
  }
  copperThicknessChange(event: any, index: number) {
    const copperThicknessId = Number(event.currentTarget.value);
    this.setCopperThicknessChange(index, copperThicknessId);
  }

  setCopperThicknessChange(filteredIndex: number, copperThicknessId: number) {
    const coreEntries = this.getControlsByCore(PCBLayer.Core);
    const copperThickness = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === copperThicknessId)?.copperThickness;
    const coreThicknessName = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreLength))?.coreThickness;
    this.fullLaminateCategoryList[filteredIndex] = Array.from(
      new Map(this.laminatesList.filter((item) => item.copperThickness === copperThickness && item.coreThickness === coreThicknessName).map((item) => [item.materialCategory, item])).values()
    );
  }
  categoryChange(filteredIndex: number, onEdit: boolean = false) {
    const coreEntries = this.getControlsByCore(PCBLayer.Core);
    const coreThicknessName = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreLength))?.coreThickness;
    const copperThicknessName = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreHeight))?.copperThickness;
    const categoryName = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreWidth))?.materialCategory;
    this.fullLaminateMaterialTypeList[filteredIndex] = Array.from(
      new Map(
        this.laminatesList
          .filter((item) => item.coreThickness === coreThicknessName && item.copperThickness === copperThicknessName && item.materialCategory === categoryName)
          .map((item) => [item.materialType, item])
      ).values()
    );
    if (!onEdit) {
      this.setLessCostMaterialTypeGrade(filteredIndex);
    }
  }

  materialTypeChange(event: any, filteredIndex: number) {
    const materialTypeId = Number(event.currentTarget.value);
    this.setMterialTypeChange(materialTypeId, filteredIndex);
  }

  setMterialTypeChange(materialTypeId: number, filteredIndex: number) {
    const coreEntries = this.getControlsByCore(PCBLayer.Core);
    const materialType = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === materialTypeId)?.materialType;
    const coreThickness = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreLength))?.coreThickness;
    const copperThickness = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreHeight))?.copperThickness;
    const category = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreShape))?.materialCategory;
    this.fullLaminateMaterialGradeList[filteredIndex] = this.laminatesList?.filter(
      (x) => x.coreThickness === coreThickness && x.copperThickness === copperThickness && x.materialCategory === category && x.materialType === materialType
    );
  }

  prepregGradeChange(event: any, filteredIndex: number) {
    const materialGradeId = Number(event.currentTarget.value);
    const materialGrade = this.prepregList?.find((x) => x.electronicsMaterialMasterId === materialGradeId);
    const materialPrice = this.sharedService.isValidNumber(materialGrade?.electronicsMaterialMarketData?.materialPrice);
    this.getControlsByCore(PCBLayer.PrepregCost)[filteredIndex]?.patchValue({
      coreLength: materialPrice,
    });
    this.getControlsByCore(PCBLayer.Prepreg)[filteredIndex]?.patchValue({
      coreVolume: this.sharedService.isValidNumber(materialGrade?.rc),
      coreArea: this.sharedService.isValidNumber(materialGrade?.coreThickness * 25.4),
    });
    this.calculateCost();
  }

  prepregCodeChange(event: any, filteredIndex: number) {
    const codeId = Number(event.currentTarget.value);
    this.setPrepregCodeChange(codeId, filteredIndex);
  }
  setPrepregCodeChange(codeId: number, filteredIndex: number) {
    const prepregCode = this.prepregList?.find((x) => x.electronicsMaterialMasterId === codeId)?.materialCategory;
    this.fullPrepregTypesList[filteredIndex] = Array.from(new Map(this.prepregList.filter((item) => item.materialCategory === prepregCode).map((item) => [item.materialType, item])).values());
  }

  prepregTypeChange(event: any, filteredIndex: number) {
    const typeId = Number(event.currentTarget.value);
    this.setPrepregTypeChange(typeId, filteredIndex);
  }
  setPrepregTypeChange(typeId: number, filteredIndex: number) {
    const prepregEntries = this.getControlsByCore(PCBLayer.Prepreg);
    const materialType = this.prepregList?.find((x) => x.electronicsMaterialMasterId === typeId)?.materialType;
    const materialCode = this.prepregList?.find((x) => x.electronicsMaterialMasterId === Number(prepregEntries[filteredIndex]?.value?.coreLength))?.materialCategory;
    this.fullPrepregGradeList[filteredIndex] = Array.from(
      new Map(this.prepregList.filter((item) => item.materialType === materialType && item.materialCategory === materialCode)?.map((item) => [item.materialGrade, item])).values()
    );
  }

  setLessCostMaterialTypeGrade(filteredIndex: number) {
    const coreEntries = this.getControlsByCore(PCBLayer.Core);
    const validEntries = this.fullLaminateMaterialTypeList[filteredIndex]?.filter(
      (entry) => entry?.electronicsMaterialMarketData?.materialPrice !== null && entry?.electronicsMaterialMarketData?.materialPrice !== undefined
    );
    const lowestPriceEntry = validEntries?.reduce((min, curr) => (curr.electronicsMaterialMarketData.materialPrice! < min.electronicsMaterialMarketData.materialPrice! ? curr : min));
    const lowestMaterialType = this.fullLaminateMaterialTypeList[filteredIndex]?.find((x) => x.materialType === lowestPriceEntry?.materialType)?.electronicsMaterialMasterId;
    const lowestMaterialPrice = this.sharedService.isValidNumber(lowestPriceEntry?.electronicsMaterialMarketData?.materialPrice);
    this.getControlsByCore(PCBLayer.Core)[filteredIndex]?.patchValue({
      coreShape: lowestMaterialType,
    });
    const coreThickness = this.fullLaminateCoreThicknessList[filteredIndex]?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreLength))?.coreThickness;
    const copperThickness = this.fullLaminateCopperThicknessList[filteredIndex]?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreHeight))?.copperThickness;
    const category = this.fullLaminateCategoryList[filteredIndex]?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreWidth))?.materialCategory;
    const materialType = this.laminatesList?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreShape))?.materialType;

    this.fullLaminateMaterialGradeList[filteredIndex] = this.laminatesList?.filter(
      (x) => x.coreThickness === coreThickness && x.copperThickness === copperThickness && x.materialCategory === category && x.materialType === materialType
    );
    const lowestMaterialGrade = this.fullLaminateMaterialGradeList[filteredIndex]?.find((x) => x.materialGrade === lowestPriceEntry?.materialGrade)?.electronicsMaterialMasterId;
    this.getControlsByCore(PCBLayer.Core)[filteredIndex]?.patchValue({
      coreArea: lowestMaterialGrade,
    });
    this.getControlsByCore(PCBLayer.CoreCost)[filteredIndex]?.patchValue({
      coreLength: lowestMaterialPrice,
    });
    this.calculateCost();
  }

  materialGradeChange(event: any, filteredIndex: number) {
    const categoryId = Number(event.currentTarget.value);
    const coreEntries = this.getControlsByCore(PCBLayer.Core);
    const coreThickness = this.fullLaminateCoreThicknessList[filteredIndex]?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreLength))?.coreThickness;
    const copperThickness = this.fullLaminateCopperThicknessList[filteredIndex]?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreHeight))?.copperThickness;
    const category = this.fullLaminateCategoryList[filteredIndex]?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreWidth))?.materialCategory;
    const materialType = this.fullLaminateMaterialTypeList[filteredIndex]?.find((x) => x.electronicsMaterialMasterId === Number(coreEntries[filteredIndex]?.value?.coreShape))?.materialType;
    const materialGrade = this.fullLaminateMaterialGradeList[filteredIndex]?.find((x) => x.electronicsMaterialMasterId === categoryId)?.materialGrade;
    const selectedMaterialGrade = this.laminatesList.find(
      (x) => x.coreThickness === coreThickness && x.copperThickness === copperThickness && x.materialCategory === category && x.materialType === materialType && x.materialGrade === materialGrade
    );
    this.getControlsByCore(PCBLayer.CoreCost)[filteredIndex]?.patchValue({
      coreLength: this.sharedService.isValidNumber(selectedMaterialGrade?.electronicsMaterialMarketData?.materialPrice),
    });
    this.calculateCost();
  }

  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }

    if (objdesc != null) {
      this.popupUrl = objdesc.imageUrl;
      this.popupName = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
    this.popoverHook?.open();
  }
  get sandForCoreFormArray() {
    return this.formGroup?.controls?.materialPkgs as FormArray;
  }

  public viewDiagram() {
    const modalRef = this.modalService.open(StackupDiagramComponent, {});
    modalRef.componentInstance.partData = {
      formValues: this.formGroup?.controls,
      laminatesList: this.laminatesList,
      prepregList: this.prepregList,
      coreList: this.getControlsByCore(PCBLayer.Core),
      prepregSortedList: this.getControlsByCore(PCBLayer.Prepreg),
    };
  }

  public viewPanelutilization() {
    const modalRef = this.modalService.open(PanelUtilizationComponent, {});
    modalRef.componentInstance.partData = {
      utilizationlist: this.calculatedUtilizationList,
    };
  }

  getControlsByCore(noOfCore: number) {
    return this.sandForCoreFormArray?.controls.filter((ctrl) => ctrl.get('noOfCore')?.value === noOfCore) || [];
  }
  removeItemFromFormArray(item: AbstractControl) {
    const formArray = this.sandForCoreFormArray;
    if (!formArray) {
      return;
    }
    const index = formArray.controls.indexOf(item);
    if (index > -1) {
      formArray.removeAt(index);
    }
  }
  trackByControl(index: number, ctrl: AbstractControl) {
    return ctrl;
  }
}
