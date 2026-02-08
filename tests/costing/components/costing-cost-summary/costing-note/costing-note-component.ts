import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { ScreeName } from '../../../costing.config';
import { GenericInfo } from 'src/app/shared/models/cost-summary.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { CostSummaryHelper } from 'src/app/shared/services/cost-summary-helper';
import { PartInfoDto } from 'src/app/shared/models/part-info.model';

@Component({
  selector: 'app-costing-note',
  templateUrl: './costing-note-component.html',
  styleUrls: ['./costing-note-component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FieldCommentComponent],
})
export class CostingNoteComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() partId?: number;
  @Input() partInfo?: PartInfoDto;
  @Input() suggestedCategoryNotes?: string;
  @Input() nestingNotes?: string;
  @Input() costingNotes?: string;
  @ViewChild('notesEditor') notesEditor!: ElementRef<HTMLDivElement>;
  similarPartCostingNotes?: string;
  costingNotesText?: HTMLDivElement;
  costingNotesFilteredData: GenericInfo[] = [];
  formIdentifier: CommentFieldFormIdentifierModel;

  constructor(private readonly costSummaryHelper: CostSummaryHelper) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['partId'] && (changes['suggestedCategoryNotes'] || changes['nestingNotes'] || changes['costingNotes'])) ||
      (!changes['partId'] && (changes['suggestedCategoryNotes'] || changes['nestingNotes'] || changes['costingNotes']))
    ) {
      this.setCostingNoteValue();
    }
  }

  ngOnInit(): void {
    this.formIdentifier = {
      partInfoId: this.partId,
      screenId: ScreeName.CostSummary,
      primaryId: 0,
      secondaryID: 0,
    };
  }

  ngAfterViewInit(): void {
    this.costingNotesText = this.notesEditor?.nativeElement;
    this.setCostingNoteValue();
  }

  private setCostingNoteValue() {
    this.costingNotesText = this.notesEditor?.nativeElement;
    if (!this.costingNotesText) return;
    let summaryNotes = this.costSummaryHelper.getSummaryNotes(this.suggestedCategoryNotes, this.nestingNotes, this.costingNotes, this.partInfo);
    this.costingNotesText.innerHTML = summaryNotes;
  }
}
