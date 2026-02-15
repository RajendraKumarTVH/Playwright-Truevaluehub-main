import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { reportsRoutes } from './reports.routes';
import { MaterialModule } from 'src/app/shared/material.module';

@NgModule({
  imports: [RouterModule, CommonModule, ReactiveFormsModule, MaterialModule, RouterModule.forChild(reportsRoutes), FormsModule],
  declarations: [],
  exports: [],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReportsModule {}
