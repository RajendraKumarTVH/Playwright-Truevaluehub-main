import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { loginRoutes } from './login.routes';

@NgModule({
  imports: [RouterModule, CommonModule, MaterialModule, ReactiveFormsModule, RouterModule.forChild(loginRoutes), FormsModule],
  declarations: [
    // containers.LoginPageComponent
  ],
  exports: [],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginModule {}
