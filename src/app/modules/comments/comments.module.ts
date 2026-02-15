import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { CommentFieldComponent } from './components/comment-field/comment-field.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
// import { FieldCommentComponent } from './components/field-comment-button/field-comment.component';
// import { SummaryCommentsComponent } from './components/summary-comments/summary-comments.component';

@NgModule({
  declarations: [
    // CommentFieldComponent,
    // FieldCommentComponent,
    // SummaryCommentsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    SharedModule,
    // FieldCommentComponent
  ],
  providers: [],
  exports: [
    // FieldCommentComponent,
    // SummaryCommentsComponent
  ],
})
export class CommentsModule {}
