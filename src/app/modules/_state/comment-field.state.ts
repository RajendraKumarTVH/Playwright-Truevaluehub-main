// import { Injectable } from '@angular/core';
// import { Action, Selector, State, StateContext } from '@ngxs/store';
// import { tap } from 'rxjs/operators';
// import { GetCommentFieldByPartInfoId, GetCommentFieldCountByPartInfoId, UpdateCommentField } from '../_actions/comment-field.action';
// import { CommentFieldService } from 'src/app/shared/services/comment-field.service';
// import { CommentFieldCountModel, CommentFieldModel } from 'src/app/shared/models/comment-field-model';
// import { BlockUiService } from 'src/app/shared/services';

// export class CommentFieldStateModel {
//   commentFieldCount: CommentFieldCountModel[];
//   commentFieldsAll: CommentFieldModel[];
// }
// @State<CommentFieldStateModel>({
//   name: 'CommentFieldCount',
//   defaults: {
//     commentFieldCount: [],
//     commentFieldsAll: [],
//   },
// })
// @Injectable({ providedIn: 'root' })
// export class CommentFieldState {
//   constructor(
//     private commentFieldService: CommentFieldService,
//     private blockUiService: BlockUiService
//   ) {}

//   @Selector()
//   static getCommentFieldCount(state: CommentFieldStateModel) {
//     return state.commentFieldCount;
//   }

//   @Selector()
//   static getCommentFieldAll(state: CommentFieldStateModel) {
//     return state.commentFieldsAll;
//   }

//   @Action(GetCommentFieldByPartInfoId)
//   getCommentFieldByPartInfoId(state: StateContext<CommentFieldStateModel>, payload: GetCommentFieldByPartInfoId) {
//     // this.blockUiService.pushBlockUI('commentSummaryField');
//     return this.commentFieldService.getCommentFieldsByPartInfoId(payload?.partInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             commentFieldsAll: [...result],
//           });
//         }
//         // this.blockUiService.popBlockUI('commentSummaryField');
//       })
//     );
//   }

//   @Action(GetCommentFieldCountByPartInfoId)
//   getCommentFieldCountByPartInfoId(state: StateContext<CommentFieldStateModel>, payload: GetCommentFieldCountByPartInfoId) {
//     return this.commentFieldService.getCommentFieldsCountByPartInfoId(payload?.partInfoId).pipe(
//       tap((result) => {
//         if (result) {
//           state.patchState({
//             commentFieldCount: [...result],
//           });
//         }
//       })
//     );
//   }

//   @Action(UpdateCommentField)
//   updateCommentField(state: StateContext<CommentFieldStateModel>, payload: UpdateCommentField) {
//     const dataToUpdate = state.getState().commentFieldCount;
//     const index = dataToUpdate.indexOf(
//       dataToUpdate.find(
//         (x) =>
//           x.partInfoId === payload.commentField.partInfoId &&
//           x.formControlName === payload.commentField.formControlName &&
//           x.screenId === payload.commentField.screenId &&
//           x.primaryId === payload.commentField.primaryId
//       )
//     );
//     if (index >= 0) {
//       dataToUpdate[index] = payload.commentField;
//     } else {
//       dataToUpdate.push(payload.commentField);
//     }
//     state.patchState({
//       commentFieldCount: [...dataToUpdate],
//     });
//   }
// }
