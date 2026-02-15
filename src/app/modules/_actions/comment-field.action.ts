// import { CommentFieldCountModel } from 'src/app/shared/models/comment-field-model';

// export enum CommentFieldActionTypes {
//   getCommentFieldByPartInfoId = '[GetCommentFieldByPartInfoId] Get',
//   getCommentFieldCountByPartInfoId = '[GetCommentFieldCountByPartInfoId] Get',
//   updateCommentField = '[UpdateCommentField] Put',
// }

// export class GetCommentFieldByPartInfoId {
//   static readonly type = CommentFieldActionTypes.getCommentFieldByPartInfoId;
//   constructor(public partInfoId: number) {}
// }

// export class GetCommentFieldCountByPartInfoId {
//   static readonly type = CommentFieldActionTypes.getCommentFieldCountByPartInfoId;
//   constructor(public partInfoId: number) {}
// }

// export class UpdateCommentField {
//   static readonly type = CommentFieldActionTypes.updateCommentField;
//   constructor(public commentField: CommentFieldCountModel) {}
// }

// export type CommentFieldActions = GetCommentFieldByPartInfoId | GetCommentFieldCountByPartInfoId | UpdateCommentField;
