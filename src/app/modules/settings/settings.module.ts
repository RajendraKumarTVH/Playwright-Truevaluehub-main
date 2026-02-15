import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material.module';
import { RouterModule } from '@angular/router';
import { settingsRoutes } from './settings-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    // SettingContainerComponent,
    // CustomerComponent,
    // UserComponent,
    // AddUserComponent
  ],
  imports: [CommonModule, RouterModule.forChild(settingsRoutes), ReactiveFormsModule, MaterialModule, FormsModule, SharedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsModule {}
