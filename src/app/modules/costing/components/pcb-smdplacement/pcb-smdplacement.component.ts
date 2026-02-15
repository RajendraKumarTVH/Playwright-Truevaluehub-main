import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ElectronicsService } from '../../services';
import { EECoversionCostCalculatorService } from '../../services/eecoversion-cost-calculator.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pcb-smdplacement',
  templateUrl: './pcb-smdplacement.component.html',
  styleUrls: ['./pcb-smdplacement.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class PcbSmdplacementComponent implements OnInit, OnChanges {
  machineData: any = [];
  showSingleSideSelectionDiv = false;
  showDoubleSideSelectionDiv = false;
  @Input() smdPlacementForm: FormGroup;
  @Input() boardComponents: any[] = [];
  @Input() placementId: number;
  @Input() conversionCostId: number | undefined;
  componentPlacements: any[] = [];

  constructor(
    private fb: FormBuilder,
    private electronicService: ElectronicsService,
    private eeCoversionCostCalculatorService: EECoversionCostCalculatorService
  ) {}

  ngOnInit(): void {
    this.constructMachineData();
    this.getCompPlacementConfig();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getCompPlacementConfig();
    if (changes['placementId'] && changes['placementId'].currentValue != changes['placementId'].previousValue) {
      if (this.conversionCostId == undefined) {
        this.calculateCounts();
      } else {
        this.setSmdSelectionPanel(this.smdPlacementForm.controls['smdSelection'].value);
      }
    }

    if (changes['boardComponents'] && changes['boardComponents'].currentValue != changes['boardComponents'].previousValue) {
      if (this.conversionCostId == undefined) {
        this.calculateCounts();
      } else {
        this.setSmdSelectionPanel(this.smdPlacementForm.controls['smdSelection'].value);
      }
    }
  }

  getCompPlacementConfig() {
    this.componentPlacements = this.eeCoversionCostCalculatorService.getComponentPlacementConfiguration();
  }

  calculateCounts() {
    if (this.placementId == null || this.placementId == undefined) {
      return;
    }

    const selectedValue = this.componentPlacements.filter((x: any) => x.id == Number(this.placementId));

    if (selectedValue && selectedValue.length == 1 && selectedValue[0].name) {
      const smdPlacementName = selectedValue[0].name;

      if (smdPlacementName.toLowerCase().includes('no smd')) {
        this.setSmdSelectionPanel(0);
      } else if (smdPlacementName.toLowerCase().includes('both side smd')) {
        this.setSmdSelectionPanel(2);
      } else if (smdPlacementName.toLowerCase().includes('side smd')) {
        this.setSmdSelectionPanel(1);
      }
    } else {
      return;
    }

    const countCalculation = this.eeCoversionCostCalculatorService.calculateSmdCounts(this.boardComponents);
    const countValue: any = this.eeCoversionCostCalculatorService.runSmdCountCalculationAlgo(Number(this.placementId), countCalculation);

    this.smdPlacementForm.patchValue({
      topSideComponentForm: {
        leadParts: countValue.topPin2or3SmdComponentsTypes,
        icParts: countValue.topPin3MoreSmdComponentsTypes,
        complexParts: countValue.topPinComplexSmdComponentsTypes,
        totalSMDParts: countValue.topPin2or3SmdComponentsTypes + countValue.topPin3MoreSmdComponentsTypes + countValue.topPinComplexSmdComponentsTypes,
        leadPlacements: countValue.topPin2or3SmdComponentsPlacements,
        icPlacements: countValue.topPin3MoreSmdComponentsPlacements,
        complexPartsPlacement: countValue.topPinComplexSmdComponentsPlacements,
        totalSMDPlacements: countValue.topPin2or3SmdComponentsPlacements + countValue.topPin3MoreSmdComponentsPlacements + countValue.topPinComplexSmdComponentsPlacements,
      },
      bottomSideForm: {
        leadParts: countValue.bottomPin2or3SmdComponentsTypes,
        icParts: countValue.bottomPin3MoreSmdComponentsTypes,
        complexParts: countValue.bottomPinComplexSmdComponentsTypes,
        totalSMDParts: countValue.bottomPin2or3SmdComponentsTypes + countValue.bottomPin3MoreSmdComponentsTypes + countValue.bottomPinComplexSmdComponentsTypes,
        leadPlacements: countValue.bottomPin2or3SmdComponentsPlacements,
        icPlacements: countValue.bottomPin3MoreSmdComponentsPlacements,
        complexPartsPlacement: countValue.bottomPinComplexSmdComponentsPlacements,
        totalSMDPlacements: countValue.bottomPin2or3SmdComponentsPlacements + countValue.bottomPin3MoreSmdComponentsPlacements + countValue.bottomPinComplexSmdComponentsPlacements,
      },
    });
  }

  constructMachineData() {
    this.electronicService.getMachineData().subscribe((x) => {
      this.machineData = x;
    });
  }

  smdSelectionChange(value: number) {
    this.setSmdSelectionPanel(value);
    // this.calculateCounts();
  }

  private setSmdSelectionPanel(value: any) {
    this.calMachineCPH();
    if (value == 0) {
      this.smdPlacementForm.controls['smdSelection'].patchValue(value);

      this.showSingleSideSelectionDiv = false;
      this.showDoubleSideSelectionDiv = false;
    } else if (value == 1) {
      this.smdPlacementForm.controls['smdSelection'].patchValue(value);

      this.showSingleSideSelectionDiv = true;
      this.showDoubleSideSelectionDiv = false;
    } else if (value == 2) {
      this.smdPlacementForm.controls['smdSelection'].patchValue(value);

      this.showSingleSideSelectionDiv = true;
      this.showDoubleSideSelectionDiv = true;
    }
  }

  calMachineCPH() {
    if (this.smdPlacementForm.controls['topSideComponentForm'].value.boardComplexity == 0) {
      this.machineData.forEach((item: any) => {
        if (item.mC_Name == this.smdPlacementForm.controls.selectedMachineTopSide.value) {
          this.smdPlacementForm.controls.machineTopSideCPH.patchValue(item.cphLowValue);
        }
      });
    } else if (this.smdPlacementForm.controls['topSideComponentForm'].value.boardComplexity == 1) {
      this.machineData.forEach((item: any) => {
        if (item.mC_Name == this.smdPlacementForm.controls.selectedMachineTopSide.value) {
          this.smdPlacementForm.controls.machineTopSideCPH.patchValue(item.cphMediumValue);
        }
      });
    } else if (this.smdPlacementForm.controls['topSideComponentForm'].value.boardComplexity == 2) {
      this.machineData.forEach((item: any) => {
        if (item.mC_Name == this.smdPlacementForm.controls.selectedMachineTopSide.value) {
          this.smdPlacementForm.controls.machineTopSideCPH.patchValue(item.cphHighValue);
        }
      });
    }
    if (this.smdPlacementForm.controls['bottomSideForm'].value.boardComplexity == 0) {
      this.machineData.forEach((item: any) => {
        if (item.mC_Name == this.smdPlacementForm.controls.selectedMachineBottomSide.value) {
          this.smdPlacementForm.controls.machineBottomSideCPH.patchValue(item.cphLowValue);
        }
      });
    } else if (this.smdPlacementForm.controls['bottomSideForm'].value.boardComplexity == 1) {
      this.machineData.forEach((item: any) => {
        if (item.mC_Name == this.smdPlacementForm.controls.selectedMachineBottomSide.value) {
          this.smdPlacementForm.controls.machineBottomSideCPH.patchValue(item.cphMediumValue);
        }
      });
    } else if (this.smdPlacementForm.controls['topSideComponentForm'].value.boardComplexity == 2) {
      this.machineData.forEach((item: any) => {
        if (item.mC_Name == this.smdPlacementForm.controls.selectedMachineBottomSide.value) {
          this.smdPlacementForm.controls.machineBottomSideCPH.patchValue(item.cphHighValue);
        }
      });
    }
  }
  toptypesmdInputChange() {
    const sumTopSMD =
      (this.smdPlacementForm.controls['topSideComponentForm'].value.leadParts || 0) +
      (this.smdPlacementForm.controls['topSideComponentForm'].value.icParts || 0) +
      (this.smdPlacementForm.controls['topSideComponentForm'].value.complexParts || 0);
    (<FormGroup>this.smdPlacementForm.controls['topSideComponentForm']).controls['totalSMDParts'].patchValue(sumTopSMD);
  }
  topplacementsmdInputChange() {
    const sumTopSMD =
      (this.smdPlacementForm.controls['topSideComponentForm'].value.leadPlacements || 0) +
      (this.smdPlacementForm.controls['topSideComponentForm'].value.icPlacements || 0) +
      (this.smdPlacementForm.controls['topSideComponentForm'].value.complexPartsPlacement || 0);
    (<FormGroup>this.smdPlacementForm.controls['topSideComponentForm']).controls['totalSMDPlacements'].patchValue(sumTopSMD);
  }
  bottomtypesmdInputChange() {
    const sumTopSMD =
      (this.smdPlacementForm.controls['bottomSideForm'].value.leadParts || 0) +
      (this.smdPlacementForm.controls['bottomSideForm'].value.icParts || 0) +
      (this.smdPlacementForm.controls['bottomSideForm'].value.complexParts || 0);
    (<FormGroup>this.smdPlacementForm.controls['bottomSideForm']).controls['totalSMDParts'].patchValue(sumTopSMD);
  }
  bottomplacementsmdInputChange() {
    const sumTopSMD =
      (this.smdPlacementForm.controls['bottomSideForm'].value.leadPlacements || 0) +
      (this.smdPlacementForm.controls['bottomSideForm'].value.icPlacements || 0) +
      (this.smdPlacementForm.controls['bottomSideForm'].value.complexPartsPlacement || 0);
    (<FormGroup>this.smdPlacementForm.controls['bottomSideForm']).controls['totalSMDPlacements'].patchValue(sumTopSMD);
  }
  topSideComplexitySelection(event: any) {
    if (event.target.value == 0) {
      (<FormGroup>this.smdPlacementForm.controls['topSideComponentForm']).controls['boardComplexity'].patchValue(event.target.value);
    } else if (event.target.value == 1) {
      (<FormGroup>this.smdPlacementForm.controls['topSideComponentForm']).controls['boardComplexity'].patchValue(event.target.value);
    } else if (event.target.value == 2) {
      (<FormGroup>this.smdPlacementForm.controls['topSideComponentForm']).controls['boardComplexity'].patchValue(event.target.value);
    }
    this.calMachineCPH();
  }
  bottomSideComplexitySelection(event: any) {
    if (event.target.value == 0) {
      (<FormGroup>this.smdPlacementForm.controls['bottomSideForm']).controls['boardComplexity'].patchValue(event.target.value);
    } else if (event.target.value == 1) {
      (<FormGroup>this.smdPlacementForm.controls['bottomSideForm']).controls['boardComplexity'].patchValue(event.target.value);
    } else if (event.target.value == 2) {
      (<FormGroup>this.smdPlacementForm.controls['bottomSideForm']).controls['boardComplexity'].patchValue(event.target.value);
    }
    this.calMachineCPH();
  }
}
