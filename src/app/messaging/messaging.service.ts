import { Injectable, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { PendingChangesDialogComponent } from './pending-changes-dialog/pending-changes-dialog.component';
import { MessagingSnackbarComponent } from './messaging-snackbar/messaging-snackbar.component';
import { ConfirmationDialogtimeoutComponent } from './confirmation-dialog-timeout/confirmation-dialog-timeout.component';
import { ConfirmationDialogdescriptionComponent } from './confirmation-dialog-description/confirmation-dialog-description.component';
import { FileFormatPopupComponent } from './file-format-popup-component/file-format-popup-component';
import { ConfirmationDialogCustomizedComponent } from './confirmation-dialog/confirmation-dialog-customized/confirmation-dialog-customized.component';

export class ConfirmationDialogData {
  title: string;
  message: string;
  action: string;
  actionText?: string;
  cancelText?: string;
  color?: string;
}

export class ConfirmEvalSubmissionDialogData {
  title: string;
  action: string;
  cancelText?: string;
  color?: string;
  hasCoSigners: boolean;
  isFacultyUser?: boolean;
}

export class ConfirmationDialogTimeOutData {
  title: string;
  message: string;
  action: string;
  cancelText?: string;
}

export class ConfirmationDialogDescriptionData {
  title: string;
  message: string;
  action: string;
  cancelText?: string;
  imageUrl?: string;
}

export interface ConfirmationDialogDescriptionConfig extends MatDialogConfig {
  data: ConfirmationDialogDescriptionData;
}

export interface ConfirmationDialogTimeOutConfig extends MatDialogConfig {
  data: ConfirmationDialogTimeOutData;
}

export interface ConfirmationDialogConfig extends MatDialogConfig {
  data: ConfirmationDialogData;
}

export interface ConfirmEvalSubmissionDialogConfig extends MatDialogConfig {
  data: ConfirmEvalSubmissionDialogData;
}

export class AlertDialogData {
  title: string;
  message: string;
  buttonText: string;
  buttonColor: string;
}

export class FilesupportDialogData {
  width: string;
  supportFile: string[];
}

export interface FilesupportDialogConfig extends MatDialogConfig {
  data: FilesupportDialogData;
}

export interface AlertDialogConfig extends MatDialogConfig {
  data: AlertDialogData;
}
@Injectable({
  providedIn: 'root',
})
export class MessagingService implements OnDestroy {
  private ngUnsubsribeAll$ = new Subject<void>();

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnDestroy() {
    this.ngUnsubsribeAll$.next(undefined);
    this.ngUnsubsribeAll$.complete();
  }

  openConfirmationDialog(config: ConfirmationDialogConfig): MatDialogRef<ConfirmationDialogComponent, any> {
    return this.dialog.open(ConfirmationDialogComponent, config);
  }

  openConfirmationCustomizedDialog(config: ConfirmationDialogConfig): MatDialogRef<ConfirmationDialogCustomizedComponent, any> {
    return this.dialog.open(ConfirmationDialogCustomizedComponent, config);
  }

  openConfirmationDialogTimeOut(config: ConfirmationDialogConfig): MatDialogRef<ConfirmationDialogtimeoutComponent, any> {
    return this.dialog.open(ConfirmationDialogtimeoutComponent, config);
  }

  openAlertDialog(config: AlertDialogConfig): MatDialogRef<AlertDialogComponent> {
    return this.dialog.open(AlertDialogComponent, config);
  }

  openPendingChangesDialog(): MatDialogRef<PendingChangesDialogComponent> {
    return this.dialog.open(PendingChangesDialogComponent);
  }

  openConfirmationDialogDescription(config: ConfirmationDialogConfig): MatDialogRef<ConfirmationDialogdescriptionComponent, any> {
    return this.dialog.open(ConfirmationDialogdescriptionComponent, config);
  }

  openSupportDocuments(config: FilesupportDialogConfig): MatDialogRef<FileFormatPopupComponent, any> {
    return this.dialog.open(FileFormatPopupComponent, config);
  }

  openSnackBar(message: string, action: string = '', config?: MatSnackBarConfig<any>, subMessages?: string[], isAlert?: boolean): MatSnackBarRef<any> {
    // No user actions defined, and DISMISS should no longer be an action
    // action = '';
    // TODO: Remove isAlert later as there is no longer a different snack bar for alerts
    // isAlert = false;
    let snackBarConfig = new MatSnackBarConfig();
    if (config) {
      snackBarConfig = config;
    }
    snackBarConfig.data = {
      message: message,
      action: action,
      subMessages: subMessages,
      isAlert: !!isAlert,
    };

    if (!snackBarConfig.data.action) {
      // Duration should always be 5 seconds
      snackBarConfig.duration = 5000;
    }
    snackBarConfig.horizontalPosition = 'left';
    snackBarConfig.panelClass = ['panel'];
    return this.snackBar.openFromComponent(MessagingSnackbarComponent, snackBarConfig);
  }
}
