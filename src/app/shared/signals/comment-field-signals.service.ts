import { Injectable, signal } from '@angular/core';
import { CommentFieldCountModel, CommentFieldModel } from 'src/app/shared/models/comment-field-model';
import { CommentFieldService } from 'src/app/shared/services/comment-field.service';

@Injectable({
  providedIn: 'root',
})
export class CommentFieldSignalsService {
  private readonly _commentFieldCountSignal = signal<CommentFieldCountModel[]>([]);
  private readonly _commentFieldsAllSignal = signal<CommentFieldModel[]>([]);
  commentFieldCount = this._commentFieldCountSignal.asReadonly();
  commentFieldsAll = this._commentFieldsAllSignal.asReadonly();

  constructor(private commentFieldService: CommentFieldService) {}

  getCommentFieldByPartInfoId(partInfoId: number): void {
    this.commentFieldService.getCommentFieldsByPartInfoId(partInfoId).subscribe((result) => {
      this._commentFieldsAllSignal.set([...(result ?? [])]);
    });
  }

  getCommentFieldCountByPartInfoId(partInfoId: number): void {
    this.commentFieldService.getCommentFieldsCountByPartInfoId(partInfoId).subscribe((result) => {
      this._commentFieldCountSignal.set([...(result ?? [])]);
    });
  }

  updateCommentField(updated: CommentFieldCountModel): void {
    this._commentFieldCountSignal.update((current) => {
      const index = current.findIndex(
        (x) =>
          x.partInfoId === updated.partInfoId &&
          x.formControlName === updated.formControlName &&
          x.screenId === updated.screenId &&
          x.primaryId === updated.primaryId &&
          x.secondaryID === updated.secondaryID
      );

      if (index >= 0) {
        const copy = [...current];
        copy[index] = updated;
        return copy;
      }

      return [...current, updated];
    });
  }
}
