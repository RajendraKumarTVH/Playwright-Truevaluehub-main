
import { AddBomComponent } from '../components/add-bom/add-bom.component';

export class AddBomConfirmationDialogData {
  title: string;
  message: string;
  action: string;
  showForm: boolean = false;
  cancelText?: string;
  color?: string;
  origin?: string;
}

export interface AddBomConfirmationDialogConfig extends MatDialogConfig {
  data: AddBomConfirmationDialogData;
}


export class AddBOmService implements OnDestroy {
  private ngUnsubsribeAll$ = new Subject<void>();

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnDestroy() {
    this.ngUnsubsribeAll$.next(undefined);
    this.ngUnsubsribeAll$.complete();
  }

  openAddBomConfirmationDialog(config: AddBomConfirmationDialogConfig): MatDialogRef<AddBomComponent, any> {
    return this.dialog.open(AddBomComponent, config);
  }
}
