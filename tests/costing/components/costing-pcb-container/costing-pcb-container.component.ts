import { EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { PartInfoDto } from 'src/app/shared/models';
import { EeConversionCost } from 'src/app/shared/models/ee-conversion-cost.model';
import { BomService } from 'src/app/shared/services';
import { ElectronicsService } from '../../services';
import { EECoversionCostCalculatorService } from '../../services/eecoversion-cost-calculator.service';
import { PcbResultComponent } from '../pcb-result/pcb-result.component';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { PcbThroughholeplacementComponent } from '../pcb-throughholeplacement/pcb-throughholeplacement.component';
import { PcbTimetestingComponent } from '../pcb-timetesting/pcb-timetesting.component';
import { PcbSmdplacementComponent } from '../pcb-smdplacement/pcb-smdplacement.component';
import { PcbPaneldescriptionComponent } from '../pcb-paneldescription/pcb-paneldescription.component';

@Component({
  selector: 'app-costing-pcb-container',
  templateUrl: './costing-pcb-container.component.html',
  styleUrls: ['./costing-pcb-container.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    PcbThroughholeplacementComponent,
    PcbTimetestingComponent,
    PcbResultComponent,
    PcbSmdplacementComponent,
    PcbPaneldescriptionComponent,
  ],
})
export class CostingPcbContainerComponent implements OnInit, OnChanges {
  @Input() part: PartInfoDto;
  public currentPart: PartInfoDto;
  @ViewChild(PcbResultComponent) resultComponent: PcbResultComponent | undefined;
  @Output() partChange: EventEmitter<PartInfoDto> = new EventEmitter<PartInfoDto>();
  resultLoaded: boolean = false;
  btnLoader: boolean = false;
  boardComponents: any[] = [];
  conversionCostType: any = {};
  conversionCostObj: EeConversionCost;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  panelDescriptionForm = this.fb.group({
    panelLength: [0],
    panelWidth: [0],
    pcbLength: [0],
    pcbWidth: [0],
    pcbThickness: [0],
    panelKeepout: [0],
    rowValue: [0],
    columnValue: [0],
    noOfPcbPanel: [0],
    depanelization: [false],
    depanelizationSelected: [1],
    mouseBite: [0],
    vgrove: [0],
    mouseBiteSelected: [false],
    vGroveSelected: [false],
  });
  smdPlacementForm = this.fb.group({
    smdSelection: [0],
    selectedMachineTopSide: ['Fuji NXT 1 Line (P&P + Screen Print +Oven)'],
    selectedMachineBottomSide: ['Fuji NXT 1 Line (P&P + Screen Print +Oven)'],
    machineTopSideCPH: [0],
    machineBottomSideCPH: [0],
    topSideComponentForm: this.fb.group({
      leadParts: [0],
      icParts: [0],
      complexParts: [0],
      totalSMDParts: [0],
      leadPlacements: [0],
      icPlacements: [0],
      complexPartsPlacement: [0],
      totalSMDPlacements: [0],
      boardComplexity: [0],
    }),
    bottomSideForm: this.fb.group({
      leadParts: [0],
      icParts: [0],
      complexParts: [0],
      totalSMDParts: [0],
      leadPlacements: [0],
      icPlacements: [0],
      complexPartsPlacement: [0],
      totalSMDPlacements: [0],
      boardComplexity: [0],
    }),
  });
  throughHolePlacementForm = this.fb.group({
    waveSolderedPartTypes: [0],
    manualSolderedPartTypes: [0],
    selectiveSolderedPartTypes: [0],
    thPlacements: [0],
    manualSolderPlacements: [0],
    noofPems: [0],
    totalTHsolderJoints: [0],
    manualSolderJoints: [0],
    highLevelAssemblyparts: [0],
    selectiveSolderJoints: [0],
    holestobeMasked: [0],
    nodeCount: [50],
    pressFitConnectorCount: [0],
  });
  timeTestingForm = this.fb.group({
    gluingOperation: [0],
    inspectionAfterHoleOperations: [0],
    AXI: [0.25],
    mechanicIntegration: [0],
    finalInspection: [0.333],
    machineConformalCoating: [0],
    flyingProbeTest: [0],
    noofMechHoles: [0],
    Modification: [0],
    ICProgramming: [0],
    manualConformalCoating: [0],
    manualXrayInspection: [0],
    finalTesting: [0.333],
    packing: [0.333],
    automaticOpticalInspection: [0.25],
    hotBarSoldering: [0],
  });

  componentPlacements: any[] = [];

  constructor(
    private fb: FormBuilder,
    private bomService: BomService,
    private electronicsService: ElectronicsService,
    private messaging: MessagingService,
    private eeCoversionCostCalculatorService: EECoversionCostCalculatorService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    this.getCompPlacementConfig();

    if (changes['part'] && changes['part'].currentValue != changes['part'].previousValue) {
      this.currentPart = { ...changes['part'].currentValue };
      const boardSub$ = this.getBoardLoadedComponents();
      boardSub$.pipe(takeUntil(this.unsubscribe$)).subscribe((response) => {
        this.conversionCostObj = this.currentPart && this.currentPart.conversionCosts && this.currentPart.conversionCosts.length > 0 ? this.currentPart.conversionCosts[0] : undefined;

        if (this.conversionCostObj) {
          this.setForm();
          this.resultComponent?.getAssumptionData();
        }
        this.boardComponents = response;
      });
    }
  }

  ngOnInit(): void {
    this.throughHolePlacementForm.get('thPlacements').valueChanges.subscribe((response: any) => {
      const val = this.timeTestingForm.controls['inspectionAfterHoleOperations'].value;
      if (val && val != 0) {
        const inspectionVal = Number(1 / 60) * Number(response || 0);
        this.timeTestingForm.controls['inspectionAfterHoleOperations'].setValue(inspectionVal);
      }
    });
  }

  emitData() {
    this.partChange.emit(this.currentPart);
  }

  setForm() {
    if (this.conversionCostObj) {
      const type = this.componentPlacements.filter((x) => x.name == this.conversionCostObj.conversionCostType);
      this.conversionCostType = type && type?.length > 0 ? type[0].id : undefined;

      this.panelDescriptionForm.patchValue({
        panelLength: this.conversionCostObj.panelLength,
        panelWidth: this.conversionCostObj.panelWidth,
        pcbLength: this.conversionCostObj.pcbLength,
        pcbWidth: this.conversionCostObj.pcbWidth,
        pcbThickness: this.conversionCostObj.pcbThickness,
        panelKeepout: this.conversionCostObj.panelKeepout,
        rowValue: this.conversionCostObj.rowValue,
        columnValue: this.conversionCostObj.columnValue,
        noOfPcbPanel: this.conversionCostObj.noOfPcbPanel,
        depanelization: this.conversionCostObj.dePanelization,
        depanelizationSelected: this.conversionCostObj.dePanelizationSelection,
        mouseBite: this.conversionCostObj.mouseBite,
        vgrove: this.conversionCostObj.vgrove,
        mouseBiteSelected: this.conversionCostObj.mouseBiteSelected,
        vGroveSelected: this.conversionCostObj.vGroveSelected,
      });
      this.smdPlacementForm.patchValue({
        smdSelection: this.conversionCostObj.smdSelection,
        selectedMachineTopSide: this.conversionCostObj.selectedMachineTopSide,
        selectedMachineBottomSide: this.conversionCostObj.selectedMachineBottomSide,
        topSideComponentForm: {
          leadParts: this.conversionCostObj.top_LeadParts,
          icParts: this.conversionCostObj.top_ICParts,
          complexParts: this.conversionCostObj.top_ComplexParts,
          totalSMDParts: this.conversionCostObj.top_TotalSMDParts,
          leadPlacements: this.conversionCostObj.top_LeadPlacement,
          icPlacements: this.conversionCostObj.top_ICPlacement,
          complexPartsPlacement: this.conversionCostObj.top_ComplexPlacement,
          totalSMDPlacements: this.conversionCostObj.top_TotalSMDPlacements,
          boardComplexity: this.conversionCostObj.top_Complexity,
        },
        bottomSideForm: {
          leadParts: this.conversionCostObj.bottom_LeadParts,
          icParts: this.conversionCostObj.bottom_ICParts,
          complexParts: this.conversionCostObj.bottom_ComplexParts,
          totalSMDParts: this.conversionCostObj.bottom_TotalSMDParts,
          leadPlacements: this.conversionCostObj.bottom_LeadPlacement,
          icPlacements: this.conversionCostObj.bottom_ICPlacement,
          complexPartsPlacement: this.conversionCostObj.bottom_ComplexPlacement,
          totalSMDPlacements: this.conversionCostObj.bottom_TotalSMDPlacements,
          boardComplexity: this.conversionCostObj.bottom_Complexity,
        },
      });
      this.throughHolePlacementForm.patchValue({
        waveSolderedPartTypes: this.conversionCostObj.waveSolderpartTypes,
        manualSolderedPartTypes: this.conversionCostObj.manualSolderPartTypes,
        selectiveSolderedPartTypes: this.conversionCostObj.selectiveSolderPartType,
        thPlacements: this.conversionCostObj.tHPlacements,
        manualSolderPlacements: this.conversionCostObj.manualSolderPlacements,
        noofPems: this.conversionCostObj.noOfPems,
        totalTHsolderJoints: this.conversionCostObj.totalTHSolderJoints,
        manualSolderJoints: this.conversionCostObj.manualSolderJoints,
        highLevelAssemblyparts: this.conversionCostObj.highLevelAssemblyParts,
        selectiveSolderJoints: this.conversionCostObj.selectiveSolderJoints,
        holestobeMasked: this.conversionCostObj.holesToBeMasked,
        nodeCount: this.conversionCostObj.nodeCount,
        pressFitConnectorCount: this.conversionCostObj.pressFitConnectorCount,
      });
      this.timeTestingForm.patchValue({
        gluingOperation: this.conversionCostObj.gluingOperation,
        inspectionAfterHoleOperations: this.conversionCostObj.inspectionThroughHoleOpert,
        AXI: this.conversionCostObj.axi,
        mechanicIntegration: this.conversionCostObj.mechanicIntegration,
        finalInspection: this.conversionCostObj.finalInspection,
        machineConformalCoating: this.conversionCostObj.machineConformalCoating,
        flyingProbeTest: this.conversionCostObj.flyingProbeTest,
        noofMechHoles: this.conversionCostObj.mechHoles,
        Modification: this.conversionCostObj.modification,
        ICProgramming: this.conversionCostObj.icProgramming,
        manualConformalCoating: this.conversionCostObj.manualConformalCoating,
        manualXrayInspection: this.conversionCostObj.manualXRayInspection,
        finalTesting: this.conversionCostObj.finalTesting,
        packing: this.conversionCostObj.packing,
        automaticOpticalInspection: this.conversionCostObj.automaticOpticalInspection,
        hotBarSoldering: this.conversionCostObj.hotBarSoldering,
      });

      this.resultComponent?.getAssumptionData();
      this.resultLoaded = true;
    } else {
      this.conversionCostType = this.componentPlacements && this.componentPlacements?.length > 0 ? this.componentPlacements[0].id : undefined;
    }
  }

  triggerResultLoaded(val: any) {
    this.resultLoaded = val;
    this.btnLoader = false;
  }

  saveConversionCost() {
    const panelDescription = this.panelDescriptionForm.value;
    const smdPlacement = this.smdPlacementForm.value;
    const throughHolePlacement = this.throughHolePlacementForm.value;
    const timeTesting = this.timeTestingForm.value;

    const eeConversionCost: EeConversionCost = new EeConversionCost();

    eeConversionCost.conversionCostId = this.conversionCostObj?.conversionCostId;

    const type = this.componentPlacements.filter((x) => x.id == this.conversionCostType);
    eeConversionCost.conversionCostType = type && type?.length > 0 ? type[0].name : undefined;
    eeConversionCost.projectInfoId = this.part.projectInfoId;
    eeConversionCost.partInfoId = this.part.partInfoId;

    eeConversionCost.panelLength = panelDescription.panelLength;
    eeConversionCost.panelWidth = panelDescription.panelWidth;
    eeConversionCost.pcbLength = panelDescription.pcbLength;
    eeConversionCost.pcbWidth = panelDescription.pcbWidth;
    eeConversionCost.pcbThickness = panelDescription.pcbThickness;
    eeConversionCost.panelKeepout = panelDescription.panelKeepout;
    eeConversionCost.rowValue = panelDescription.rowValue;
    eeConversionCost.columnValue = panelDescription.columnValue;
    eeConversionCost.noOfPcbPanel = panelDescription.noOfPcbPanel;

    eeConversionCost.dePanelization = panelDescription.depanelization;
    eeConversionCost.dePanelizationSelection = panelDescription.depanelizationSelected;
    eeConversionCost.mouseBiteSelected = panelDescription.mouseBiteSelected;
    eeConversionCost.mouseBite = panelDescription.mouseBite;
    eeConversionCost.vGroveSelected = panelDescription.vGroveSelected;
    eeConversionCost.vgrove = panelDescription.vgrove;

    eeConversionCost.smdSelection = smdPlacement.smdSelection;

    eeConversionCost.selectedMachineTopSide = smdPlacement.selectedMachineTopSide;
    eeConversionCost.selectedMachineBottomSide = smdPlacement.selectedMachineBottomSide;

    eeConversionCost.top_Complexity = smdPlacement.topSideComponentForm.boardComplexity;
    eeConversionCost.top_LeadParts = smdPlacement.topSideComponentForm.leadParts;
    eeConversionCost.top_ICParts = smdPlacement.topSideComponentForm.icParts;
    eeConversionCost.top_ComplexParts = smdPlacement.topSideComponentForm.complexParts;
    eeConversionCost.top_TotalSMDParts = smdPlacement.topSideComponentForm.totalSMDParts;
    eeConversionCost.top_ICPlacement = smdPlacement.topSideComponentForm.icPlacements;
    eeConversionCost.top_LeadPlacement = smdPlacement.topSideComponentForm.leadPlacements;
    eeConversionCost.top_ComplexPlacement = smdPlacement.topSideComponentForm.complexPartsPlacement;
    eeConversionCost.top_TotalSMDPlacements = smdPlacement.topSideComponentForm.totalSMDPlacements;

    eeConversionCost.bottom_Complexity = smdPlacement.bottomSideForm.boardComplexity;
    eeConversionCost.bottom_LeadParts = smdPlacement.bottomSideForm.leadParts;
    eeConversionCost.bottom_ICParts = smdPlacement.bottomSideForm.icParts;
    eeConversionCost.bottom_ComplexParts = smdPlacement.bottomSideForm.complexParts;
    eeConversionCost.bottom_TotalSMDParts = smdPlacement.bottomSideForm.totalSMDParts;
    eeConversionCost.bottom_ICPlacement = smdPlacement.bottomSideForm.icPlacements;
    eeConversionCost.bottom_LeadPlacement = smdPlacement.bottomSideForm.leadPlacements;
    eeConversionCost.bottom_ComplexPlacement = smdPlacement.bottomSideForm.complexPartsPlacement;
    eeConversionCost.bottom_TotalSMDPlacements = smdPlacement.bottomSideForm.totalSMDPlacements;

    eeConversionCost.waveSolderpartTypes = throughHolePlacement.waveSolderedPartTypes;
    eeConversionCost.tHPlacements = throughHolePlacement.thPlacements;
    eeConversionCost.manualSolderPartTypes = throughHolePlacement.manualSolderedPartTypes;
    eeConversionCost.manualSolderPlacements = throughHolePlacement.manualSolderPlacements;
    eeConversionCost.selectiveSolderPartType = throughHolePlacement.selectiveSolderedPartTypes;
    eeConversionCost.noOfPems = throughHolePlacement.noofPems;
    eeConversionCost.selectiveSolderJoints = throughHolePlacement.selectiveSolderJoints;
    eeConversionCost.totalTHSolderJoints = throughHolePlacement.totalTHsolderJoints;
    eeConversionCost.holesToBeMasked = throughHolePlacement.holestobeMasked;
    eeConversionCost.manualSolderJoints = throughHolePlacement.manualSolderJoints;
    eeConversionCost.nodeCount = throughHolePlacement.nodeCount;
    eeConversionCost.highLevelAssemblyParts = throughHolePlacement.highLevelAssemblyparts;
    eeConversionCost.pressFitConnectorCount = throughHolePlacement.pressFitConnectorCount;

    eeConversionCost.gluingOperation = timeTesting.gluingOperation;
    eeConversionCost.modification = timeTesting.Modification;
    eeConversionCost.inspectionThroughHoleOpert = timeTesting.inspectionAfterHoleOperations;
    eeConversionCost.icProgramming = timeTesting.ICProgramming;
    eeConversionCost.axi = timeTesting.AXI;
    eeConversionCost.manualConformalCoating = timeTesting.manualConformalCoating;
    eeConversionCost.mechanicIntegration = timeTesting.mechanicIntegration;
    eeConversionCost.manualXRayInspection = timeTesting.manualXrayInspection;
    eeConversionCost.finalInspection = timeTesting.finalInspection;
    eeConversionCost.finalTesting = timeTesting.finalTesting;
    eeConversionCost.machineConformalCoating = timeTesting.manualConformalCoating;
    eeConversionCost.packing = timeTesting.packing;
    eeConversionCost.flyingProbeTest = timeTesting.flyingProbeTest;
    eeConversionCost.automaticOpticalInspection = timeTesting.automaticOpticalInspection;
    eeConversionCost.mechHoles = timeTesting.noofMechHoles;
    eeConversionCost.hotBarSoldering = timeTesting.hotBarSoldering;

    this.electronicsService.saveEeConversionCost(eeConversionCost).subscribe((res) => {
      if (res) {
        this.conversionCostObj = res;
        this.setForm();
        this.currentPart.conversionCosts = [res];
        this.emitData();
        this.messaging.openSnackBar(`Data updated successfully.`, '', { duration: 5000 });
      } else {
        this.messaging.openSnackBar(`Error occurred while saving.`, '', { duration: 5000 });
      }
    });
  }

  getCompPlacementConfig() {
    this.componentPlacements = this.eeCoversionCostCalculatorService.getComponentPlacementConfiguration();
  }

  getBoardLoadedComponents() {
    return this.bomService.getBoardLoadedComponents(this.currentPart.projectInfoId, this.currentPart.partInfoId);
    // .subscribe(response => {
    //   this.boardComponents = response;
    //   this.setForm();
    // });
  }
}
