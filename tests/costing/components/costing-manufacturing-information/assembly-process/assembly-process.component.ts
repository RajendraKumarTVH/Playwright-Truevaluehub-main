import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { AssemblyConfigService, AssemblyType } from 'src/app/shared/config/manufacturing-assembly-config';
import { OnlyNumber } from 'src/app/shared/directives';
import { SubProcessTypeInfoDto } from 'src/app/shared/models/subprocess-info.model';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';

@Component({
  selector: 'app-assembly-process',
  templateUrl: './assembly-process.component.html',
  styleUrls: ['./assembly-process.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, OnlyNumber, MatIconModule, AutoTooltipDirective],
})
export class AssemblyProcessComponent implements OnInit, OnChanges {
  constructor(private _assembly: AssemblyConfigService) {}
  @Input() formGroup: FormGroup;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() assemblyVals: any;
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  subProcessNamesList: any[] = [];
  handlingDifficultiesList: any[] = [];
  insertionDifficultiesList: any[] = [];
  complexityList: any[] = [];
  @Output() subProcessChange = new EventEmitter<any>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['assemblyVals'] && changes['assemblyVals'].currentValue) {
      if (this.subProcessFormArray?.controls?.length <= 0) {
        this.addMore();
      }
    }
  }

  ngOnInit(): void {
    this.subProcessNamesList = this._assembly.getAssemblySubProcessList();
    this.handlingDifficultiesList = this._assembly.getHandingDifficultiesList();
    this.insertionDifficultiesList = this._assembly.getInsertionDifficultiesList();
    this.complexityList = this._assembly.getAssemblyComplexity();
    if (this.subProcessFormArray?.length > 0) {
      // this.subProcessItems?.forEach(process => {
      //   this.subProcessFormArray?.push(this._assembly.getDynamicFormGroup(process));
      // });
    } else {
      if (this.subProcessFormArray?.length == 0) {
        const subprocess = new SubProcessTypeInfoDto();
        subprocess.subProcessTypeId = AssemblyType.PickAndPlaceParts;
        this.subProcessFormArray?.push(this._assembly.getDynamicFormGroup(subprocess, true));
      }
    }
  }

  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
  }

  get f() {
    return this.formGroup.controls;
  }

  get subProcessFormArray() {
    return this.formGroup.controls?.subProcessList as FormArray;
  }
  get formAryLen() {
    return this.subProcessFormArray?.controls?.length;
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

  setFormBasedOnSubProcessType(event: any, index: number) {
    const subProcessType = Number(event.currentTarget.value);
    (this.subProcessFormArray.controls as FormGroup[])[index].patchValue({
      isPickAndPlaceParts: subProcessType === AssemblyType.PickAndPlaceParts ? true : false,
      formLength: 0,
      formHeight: 0,
      hlFactor: 0,
      lengthOfCut: 0,
      bendingLineLength: 0,
      recommendTonnage: 0,
    });
    this.calculateCost();
  }

  onDeleteSubProcess(index: number) {
    if (this.subProcessFormArray?.controls) {
      this.subProcessFormArray.controls.splice(index, 1);
      this.calculateCost();
      this.dirtyCheckEvent.emit();
    }
  }

  addMore() {
    const formGrp = (this.subProcessFormArray.controls as FormGroup[])[this.formAryLen - 1];
    if (formGrp?.value && !!formGrp.value?.subProcessTypeID) {
      const subprocess = new SubProcessTypeInfoDto();
      subprocess.subProcessTypeId = AssemblyType.PickAndPlaceParts;
      this.subProcessFormArray.push(this._assembly.getDynamicFormGroup(subprocess, true, this.formAryLen));
    }
    this.calculateCost();
  }
}
