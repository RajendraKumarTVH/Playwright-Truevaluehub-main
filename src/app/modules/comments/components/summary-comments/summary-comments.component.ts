import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, effect } from '@angular/core';
import { CommentFieldModel } from 'src/app/shared/models/comment-field-model';
import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
import { ScreeName } from 'src/app/modules/costing/costing.config';
// import * as CommentFieldActions from 'src/app/modules/_actions/comment-field.action';
import { Store } from '@ngxs/store';
// import { CommentFieldState } from 'src/app/modules/_state/comment-field.state';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CamelcaseToWordsPipe, NewlineBrPipe } from 'src/app/shared/pipes';
import { CommentFieldSignalsService } from 'src/app/shared/signals/comment-field-signals.service';

@Component({
  selector: 'app-summary-comments',
  templateUrl: './summary-comments.component.html',
  styleUrls: ['./summary-comments.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NewlineBrPipe, CamelcaseToWordsPipe],
})
export class SummaryCommentsComponent implements OnInit, OnChanges, OnDestroy {
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  public comments: CommentFieldModel[] = [];
  private sortOrder = 'desc';
  private screens = ScreeName;
  @Input() partInfoId: number;
  screenNames: { [x: number]: string };
  // _commentFieldAll$: Observable<CommentFieldModel[]>;
  private commentFieldEffect = effect(() => {
    const commentFieldsAll = this.commentFieldSignalsService.commentFieldsAll();
    if (commentFieldsAll) {
      this.comments = commentFieldsAll.filter((x) => x.screenId !== ScreeName.CadDrawing);
    }
  });

  constructor(
    private _store: Store,
    private commentFieldSignalsService: CommentFieldSignalsService
  ) {
    // this._commentFieldAll$ = this._store.select(CommentFieldState.getCommentFieldAll);
  }

  ngOnInit(): void {
    this.screenNames = Object.keys(this.screens)
      .map((x) => ({ [this.screens[x]]: x }))
      .reduce((res, cur) => ({ ...res, ...cur }));

    // this._commentFieldAll$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CommentFieldModel[]) => {
    //   if (result) {
    //     this.comments = result.filter((x) => x.screenId !== ScreeName.CadDrawing);
    //   }
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.partInfoId && changes.partInfoId?.currentValue > 0) {
      this.commentFieldSignalsService.getCommentFieldByPartInfoId(changes.partInfoId.currentValue);
    }
  }

  sortComments() {
    if (this.sortOrder === 'desc') {
      this.sortOrder = 'asc';
      this.comments.sort((a, b) => a.commentId - b.commentId);
    } else {
      this.sortOrder = 'desc';
      this.comments.sort((a, b) => b.commentId - a.commentId);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
    this.commentFieldEffect.destroy();
  }
}
