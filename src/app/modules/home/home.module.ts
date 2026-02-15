import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { dashboardRoutes } from './home.routes';
import * as services from './services';
// import * as components from './components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { DndModule } from 'ngx-drag-drop';
import { MaterialModule } from 'src/app/shared/material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchTextService } from '../search/services';
import { Store } from '@ngxs/store';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
// import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardRoutes),
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    DndModule,
    NgbModule,
    MatProgressBarModule,
    NgCircleProgressModule.forRoot({}),
    ButtonModule,
    AutoCompleteModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    MenuModule,
    RippleModule,
    // CalendarModule,
    MultiSelectModule,
    FileUploadModule,
    TabViewModule,
    // components.ActiveProjectsComponent
  ],
  declarations: [
    // components.OverviewComponent,
    // containers.HomeShellPageComponent,
    // components.ActiveProjectComponent,
    // components.ArchivedProjectsComponent,
    // components.DraftProjectListComponent,
    // components.HomeCreateProjectComponent,
    // components.HomeProjectsComponent,
    // components.CreateProjectComponent,
    // components.HomePageComponent,
    // directives.NgbdSortableHeader,
    // components.ActiveProjectsComponent,
    // components.ProjectPartsSliderComponent,
    // components.SliderShellComponent,
    // components.SliderContentComponent,
    // components.PartCopySliderContentComponent
  ],
  providers: [Store, services.ProjectCreationService, services.ProjectService, SearchTextService, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    // components.ActiveProjectsComponent
  ],
})
export class HomeModule {}
