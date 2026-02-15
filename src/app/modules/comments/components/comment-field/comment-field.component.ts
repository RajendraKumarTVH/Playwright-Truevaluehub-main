import { Component, OnInit, Inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommentFieldModel, CommentFieldPayloadModel, CommentFieldUpdatePayloadModel } from 'src/app/shared/models/comment-field-model';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { CommentFieldService } from 'src/app/shared/services/comment-field.service';
import { BlockUiService } from 'src/app/shared/services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';
// import * as CommentFieldActions from 'src/app/modules/_actions/comment-field.action';
import { AiCommonService } from 'src/app/shared/services/ai-common-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CamelcaseToWordsPipe, NewlineBrPipe } from 'src/app/shared/pipes';
import { MatIconModule } from '@angular/material/icon';
import { CommentFieldSignalsService } from 'src/app/shared/signals/comment-field-signals.service';

@Component({
  selector: 'app-comment-field',
  templateUrl: './comment-field.component.html',
  styleUrls: ['./comment-field.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NewlineBrPipe, MatIconModule, CamelcaseToWordsPipe],
})
export class CommentFieldComponent implements OnInit, OnDestroy {
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  public comments: CommentFieldModel[] = [];
  public currentComment: string;
  public editId: number = 0;
  public deleteId: number = 0;
  public user: any;
  private commentFieldParams: { partInfoId: any; screenId: any; primaryId: any; formControlName: any; secondaryID: any };
  private sub$: any;
  private sortOrder = 'desc';
  @ViewChild('scrollContainer') scrollContainer: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<CommentFieldComponent>,
    private commentFieldService: CommentFieldService,
    private blockUiService: BlockUiService,
    private userService: UserInfoService,
    private _store: Store,
    private aiCommonService: AiCommonService,
    private commentFieldSignalsService: CommentFieldSignalsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.data = data;
    console.log(this.data);
  }

  ngOnInit(): void {
    // this.blockUiService.pushBlockUI('commentField');
    this.commentFieldParams = {
      partInfoId: this.data.formIdentifier.partInfoId,
      screenId: this.data.formIdentifier.screenId,
      primaryId: this.data.formIdentifier.primaryId,
      formControlName: this.data.fieldIdentifier,
      secondaryID: this.data.secondaryID,
    };

    this.commentFieldService
      .getCommentFieldsByParams(this.commentFieldParams)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((result: CommentFieldModel[]) => {
        if (result) {
          const aiSuggestedData = this.aiCommonService.getAiSuggestedCommentData({
            partInfoId: this.commentFieldParams.partInfoId,
            fieldName: this.commentFieldParams.formControlName,
            secondaryID: this.commentFieldParams.secondaryID,
          });
          if (aiSuggestedData) {
            const aiSuggestedComment: CommentFieldModel = {
              commentId: 999,
              commentText: aiSuggestedData.fieldData,
              formControlName: this.commentFieldParams.formControlName,
              modifiedDate: '',
              modifiedUserId: -1,
              partInfoId: this.commentFieldParams.partInfoId,
              primaryId: this.commentFieldParams.primaryId,
              screenId: this.commentFieldParams.screenId,
              userName: 'AI Suggested',
              secondaryID: this.commentFieldParams.secondaryID,
            };
            this.comments.push(aiSuggestedComment);
          }
          this.comments.push(...result);
        }
        // this.blockUiService.popBlockUI('commentField');
      });
    this.userService.getUserValue().subscribe((user) => {
      console.log(user);
      if (user) {
        this.user = {
          name: `${user?.firstName} ${user?.lastName}`.trim(),
          id: user?.userId,
        };
      }
    });
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

  onEdit(commentId: number, commentText: string) {
    if (commentId > 0) {
      this.editId = commentId;
      this.currentComment = commentText;
      this.scrollContainer.nativeElement.scrollTo(0, 0);
    }
  }

  onDelete(commentId: number) {
    if (commentId > 0) {
      this.deleteId = commentId;
    }
  }

  onDeleteConfirm() {
    if (this.deleteId > 0) {
      // this.blockUiService.pushBlockUI('commentField');
      this.sub$ = this.commentFieldService.deleteCommentField(this.deleteId);
      this.updateDb();
    }
  }

  onSubmit() {
    this.currentComment = this.currentComment?.trim();
    if (this.currentComment && this.currentComment?.length > 0) {
      // this.blockUiService.pushBlockUI('commentField');
      if (this.editId > 0) {
        // edit
        const currentComment: CommentFieldUpdatePayloadModel = {
          commentText: this.currentComment,
        };
        this.sub$ = this.commentFieldService.updateCommentField(currentComment, this.editId);
      } else {
        // add
        const currentComment: CommentFieldPayloadModel = {
          ...this.commentFieldParams,
          commentText: this.currentComment,
          userName: this.user.name,
        };
        this.sub$ = this.commentFieldService.saveCommentField(currentComment);
      }
      this.updateDb();
    }
  }

  updateDb() {
    this.sub$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CommentFieldModel & { result: boolean }) => {
      if (result) {
        if (this.deleteId > 0) {
          // delete
          this.comments = this.comments.filter((x) => x.commentId !== this.deleteId);
          this.commentFieldSignalsService.updateCommentField({ ...this.commentFieldParams, count: this.comments.length });
        } else if (this.editId > 0) {
          // edit
          const index = this.comments.indexOf(this.comments.find((x) => x.commentId === this.editId));
          this.comments[index] = result;
        } else if (this.currentComment) {
          // add
          if (this.sortOrder === 'desc') {
            this.comments.unshift(result);
          } else {
            this.comments.push(result);
          }
          this.commentFieldSignalsService.updateCommentField({ ...this.commentFieldParams, count: this.comments.length });
        }
        this.resetAll();
      }
      // this.blockUiService.popBlockUI('commentField');
    });
  }

  resetAll() {
    this.deleteId = 0;
    this.editId = 0;
    this.currentComment = '';
  }

  onCancel() {
    this.commentFieldSignalsService.getCommentFieldByPartInfoId(this.commentFieldParams.partInfoId);
    this.dialogRef.close({ commentsCount: this.comments.length });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
  }
}
