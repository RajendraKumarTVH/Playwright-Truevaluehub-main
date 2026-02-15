import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import * as containers from './containers';
import * as services from './services';
// import * as components from './components';
import { SharedModule } from 'src/app/shared/shared.module';
import { searchRoutes } from './search.routes';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    // containers.SearchShellPageComponent,
    // components.SearchTextComponent
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(searchRoutes)],
  providers: [services.SearchTextService],
})
export class SearchModule {}
