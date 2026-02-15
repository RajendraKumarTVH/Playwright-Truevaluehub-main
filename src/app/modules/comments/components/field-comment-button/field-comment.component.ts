import { Component, Input, OnChanges, SimpleChanges, OnDestroy, effect } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommentFieldComponent } from 'src/app/modules/comments';
import { Store } from '@ngxs/store';
// import { CommentFieldState } from 'src/app/modules/_state/comment-field.state';
import { CommentFieldCountModel, CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommentFieldSignalsService } from 'src/app/shared/signals/comment-field-signals.service';

@Component({
  selector: 'app-field-comment',
  templateUrl: './field-comment.component.html',
  styleUrls: ['./field-comment.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, ReactiveFormsModule, MatTooltipModule],
})
export class FieldCommentComponent implements OnChanges, OnDestroy {
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  @Input() formIdentifier: CommentFieldFormIdentifierModel;
  @Input() fieldIdentifier: string;
  @Input() secondaryID: number = 0;

  public isEnable = true;
  _commentFieldCount$: Observable<CommentFieldCountModel[]>;
  commentFieldCount = 0;
  private commentFields: CommentFieldCountModel[] = [];
  private commentFieldEffect = effect(() => {
    const commentFieldCount = this.commentFieldSignalsService.commentFieldCount();
    if (commentFieldCount) {
      this.commentFields = commentFieldCount;
      this.processCount();
    }
  });

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private commentFieldSignalsService: CommentFieldSignalsService
  ) {
    // this._commentFieldCount$ = this.store.select(CommentFieldState.getCommentFieldCount);
  }

  // ngOnInit(): void {
  //   this._commentFieldCount$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CommentFieldCountModel[]) => {
  //     if (result) {
  //       this.commentFields = result;
  //       this.processCount();
  // }
  // });
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formIdentifier?.currentValue || changes.fieldIdentifier?.currentValue) {
      this.processCount();
    }
  }

  processCount() {
    if (this.formIdentifier?.partInfoId > 0 && this.fieldIdentifier != '' && this.commentFields?.length >= 0 && this.secondaryID === 0) {
      const fieldRecord = this.commentFields.filter((x) => x.formControlName === this.fieldIdentifier && x.screenId === this.formIdentifier.screenId && x.primaryId === this.formIdentifier.primaryId);
      this.commentFieldCount = fieldRecord?.length > 0 ? fieldRecord[0].count : 0;
    }
    if (this.secondaryID != undefined && this.secondaryID != null && this.secondaryID > 0) {
      const fieldRecord = this.commentFields.filter((x) => x.secondaryID === this.secondaryID);
      this.commentFieldCount = fieldRecord?.length > 0 ? fieldRecord[0].count : 0;
    }
  }

  openCommentsPopup() {
    const dialogRef = this.dialog.open(CommentFieldComponent, {
      data: {
        formIdentifier: this.formIdentifier,
        fieldIdentifier: this.fieldIdentifier,
        secondaryID: this.secondaryID,
      },
      disableClose: true,
      panelClass: 'comments-modal',
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((data) => {
        if (data) {
          this.commentFieldCount = data.commentsCount;
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
    this.commentFieldEffect.destroy();
  }
}
