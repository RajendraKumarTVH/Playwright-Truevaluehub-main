import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { logoutRoutes } from './logout.routes';

@NgModule({
  imports: [RouterModule, CommonModule, ReactiveFormsModule, RouterModule.forChild(logoutRoutes), FormsModule],
  declarations: [
    // containers.LogoutPageComponent
  ],
  exports: [],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LogoutModule {}
