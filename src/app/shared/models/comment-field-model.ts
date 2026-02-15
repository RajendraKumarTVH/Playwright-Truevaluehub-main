export interface CommentFieldModel {
  commentId: number;
  partInfoId: number;
  screenId: number;
  primaryId: number;
  formControlName: string;
  commentText: string;
  userName: string;
  modifiedUserId: number;
  modifiedDate: string;
  secondaryID: number;
}

export interface CommentFieldPayloadModel extends Omit<CommentFieldModel, 'commentId' | 'modifiedUserId' | 'modifiedDate' | 'secondaryID'> {}

export interface CommentFieldUpdatePayloadModel extends Pick<CommentFieldModel, 'commentText'> {}

export interface CommentFieldFormIdentifierModel extends Pick<CommentFieldModel, 'partInfoId' | 'screenId' | 'primaryId' | 'secondaryID'> {}

export interface CommentFieldCountModel extends Pick<CommentFieldModel, 'partInfoId' | 'screenId' | 'primaryId' | 'formControlName' | 'secondaryID'> {
  count: number;
}
