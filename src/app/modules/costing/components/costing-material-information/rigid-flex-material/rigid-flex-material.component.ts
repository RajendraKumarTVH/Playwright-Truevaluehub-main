import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { PartInfoDto } from 'src/app/shared/models';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { SharedService } from '../../../services/shared.service';
import { RigidFlexMaterialConfigService } from 'src/app/shared/config/rigid-flex-material-config';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
@Component({
  selector: 'app-rigid-flex-material',
  templateUrl: './rigid-flex-material.component.html',
  styleUrl: './rigid-flex-material.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent, AutoTooltipDirective],
})
export class RigidFlexMaterialComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() inputVals: any;
  @Input() currentPart: PartInfoDto;
  @Output() doCalculateCost = new EventEmitter<any>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  public popoverHook: NgbPopover;
  popupName: any;
  popupUrl;
  lstdescriptions: any = (DescriptionJson as any).default;
  technologiesList: any[] = [];
  constructor(
    private configService: RigidFlexMaterialConfigService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.technologiesList = this.configService.getRigidFlexTechnologies();
  }
  calculateCost(fieldName = '', index = 0) {
    this.doCalculateCost.emit({ fieldName, index });
  }
}
