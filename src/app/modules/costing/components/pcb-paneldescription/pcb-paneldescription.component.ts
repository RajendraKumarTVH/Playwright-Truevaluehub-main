import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { ElectronicsService } from '../../services';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pcb-paneldescription',
  templateUrl: './pcb-paneldescription.component.html',
  styleUrls: ['./pcb-paneldescription.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class PcbPaneldescriptionComponent {
  mouseBiteEnabled: boolean = false;
  vgroveEnabled: boolean = false;
  mouseBiteDuration: number = 0;
  vGroveTimeDuration: number = 0;
  depanlizationCheckBoxEnabled: boolean = false;
  dePanelizationSelectedRadio = 0; //default is 0 and manual is 1
  noofmousebites = 0;
  noofvgrove = 0;
  @Input() panelDescriptionForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private messaging: MessagingService,
    private electronicService: ElectronicsService
  ) {}

  depanelizationCal() {
    const cuttingTime = 2;
    const travelTime = 2;
    const unloadingTime = 3;
    let mouseBite = 0;
    const loadingTime = 8 / (this.panelDescriptionForm.controls['noOfPcbPanel'].value || 0);
    const area = Math.round((this.panelDescriptionForm.controls.pcbLength.value || 0) * (this.panelDescriptionForm.controls.pcbWidth.value || 0));
    if (this.mouseBiteEnabled && this.dePanelizationSelectedRadio === 1) {
      //manual - mouse bite selection goes this part
      const userInput = this.noofmousebites;
      const totalProcessTime = userInput * (cuttingTime * travelTime);
      this.mouseBiteDuration = parseFloat(((totalProcessTime + loadingTime + unloadingTime) / 60).toFixed(3));
      this.panelDescriptionForm.controls.mouseBite.patchValue(this.mouseBiteDuration);
    } //default radio selection goes to else part
    else {
      this.electronicService.getMouseBite(area).subscribe((x) => {
        mouseBite = x;
        const totalProcessTime = mouseBite * (cuttingTime + travelTime);
        this.mouseBiteDuration = parseFloat(((totalProcessTime + loadingTime + unloadingTime) / 60).toFixed(3));
        this.panelDescriptionForm.controls.mouseBite.patchValue(this.mouseBiteDuration);
      });
    }
    this.getVgroveData();
  }

  getVgroveData() {
    const perSideCuttingTime = 2;
    if (this.vgroveEnabled && this.dePanelizationSelectedRadio === 1) {
      //manual goes here
      const userInput = this.noofvgrove;
      const timePanel = perSideCuttingTime * userInput + 2 * userInput + 2 * (this.panelDescriptionForm.controls.noOfPcbPanel.value || 0);
      this.vGroveTimeDuration = parseFloat((timePanel / (this.panelDescriptionForm.controls.noOfPcbPanel.value || 0) / 60).toFixed(3));
      this.panelDescriptionForm.controls.vgrove.patchValue(this.vGroveTimeDuration);
    } //default goes here
    else {
      const totalCuttingsides = (this.panelDescriptionForm.controls.noOfPcbPanel.value || 0) + 1;
      const loadingTimePerPanel = totalCuttingsides * 2;
      const unloadingTimeperBoard = (this.panelDescriptionForm.controls.noOfPcbPanel.value || 0) * 2;
      const timePanel = perSideCuttingTime * totalCuttingsides + loadingTimePerPanel + unloadingTimeperBoard;
      this.vGroveTimeDuration = parseFloat((timePanel / (this.panelDescriptionForm.controls.noOfPcbPanel.value || 0) / 60).toFixed(3));
      this.panelDescriptionForm.controls.vgrove.patchValue(this.vGroveTimeDuration);
    }
  }

  panelDescriptionCal() {
    const row =
      ((this.panelDescriptionForm.controls.panelLength.value || 0) - (this.panelDescriptionForm.controls.panelKeepout.value || 0)) / (this.panelDescriptionForm.controls.pcbLength.value || 0);
    const column =
      ((this.panelDescriptionForm.controls.panelWidth.value || 0) - (this.panelDescriptionForm.controls.panelKeepout.value || 0)) / (this.panelDescriptionForm.controls.pcbWidth.value || 0);
    this.panelDescriptionForm.controls['rowValue'].setValue(Math.floor(row));
    this.panelDescriptionForm.controls['columnValue'].setValue(Math.floor(column));
    this.panelDescriptionForm.controls['noOfPcbPanel'].setValue(Math.floor(row) * Math.floor(column));
  }

  checkDepanlizationbox(val: any) {
    if (this.panelDescriptionForm.controls.noOfPcbPanel.value != 0) {
      if (val.currentTarget.checked) {
        this.depanlizationCheckBoxEnabled = true;
      } else {
        this.depanlizationCheckBoxEnabled = false;
      }
      this.panelDescriptionForm.controls['depanelization'].setValue(this.depanlizationCheckBoxEnabled);
    } else {
      val.currentTarget.checked = false;
      this.messaging.openSnackBar(`Calculate PCB per Panel and Proceed Depanelization.`, '', { duration: 5000 });
    }
  }

  checkDepanlizationOptions(event: any) {
    this.dePanelizationSelectedRadio = Number(event.target.value);
    this.panelDescriptionForm.controls['depanelizationSelected'].setValue(this.dePanelizationSelectedRadio);
  }

  mouseBiteChecked(event: any) {
    if (event.currentTarget.checked) {
      this.mouseBiteEnabled = true;
      this.panelDescriptionForm.controls.mouseBiteSelected.patchValue(true);
    } else {
      this.mouseBiteEnabled = false;
      this.panelDescriptionForm.controls.mouseBiteSelected.patchValue(false);
    }
  }

  vgroveChecked(event: any) {
    if (event.currentTarget.checked) {
      this.vgroveEnabled = true;
      this.panelDescriptionForm.controls.vGroveSelected.patchValue(true);
    } else {
      this.vgroveEnabled = false;
      this.panelDescriptionForm.controls.vGroveSelected.patchValue(false);
    }
  }
}
