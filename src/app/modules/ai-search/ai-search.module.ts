import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { aiSearchRoutes } from './ai-search-route';
import { MaterialModule } from 'src/app/shared/material.module';
import { FileUploadModule } from 'primeng/fileupload';
import { DndModule } from 'ngx-drag-drop';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginatorModule } from 'primeng/paginator';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(aiSearchRoutes),
    MaterialModule,
    NgbModule,
    DndModule,
    FileUploadModule,
    MatPaginatorModule,
    PaginatorModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AiSearchModule {}
