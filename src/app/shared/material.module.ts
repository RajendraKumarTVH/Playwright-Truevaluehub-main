import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

export const dateFormats = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MMMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatTableModule,
    MatSortModule,
    MatRadioModule,
    MatCardModule,
    MatTooltipModule,
    DragDropModule,
  ],
  exports: [
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatNativeDateModule,
    MatTableModule,
    MatSortModule,
    MatRadioModule,
    MatCardModule,
    MatTooltipModule,
    DragDropModule,
  ],
  providers: [provideMomentDateAdapter(dateFormats)],
})
export class MaterialModule {}
