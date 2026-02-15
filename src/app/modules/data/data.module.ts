import { CommonModule, DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { dataRoutes } from './data-routing';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(dataRoutes), ReactiveFormsModule, MaterialModule, FormsModule, SharedModule],
  exports: [],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DataModule {}
