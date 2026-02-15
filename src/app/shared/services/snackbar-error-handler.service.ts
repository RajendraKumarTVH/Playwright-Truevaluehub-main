import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackBarErrorHandlerService {
  constructor(
    private snackBar: MatSnackBar,
    private zone: NgZone
  ) {}

  public openSnackBar(errorText: string): void {
    this.zone.run(() => {
      const snackBar = this.snackBar.open(errorText, 'OK', {
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      snackBar.onAction().subscribe(() => {
        snackBar.dismiss();
      });
    });
  }

  public handleError(errorResponse: any): void {
    this.zone.run(() => {
      let errorText = '';
      let errorCode: string = '';

      if (errorResponse.headers) {
        if (errorResponse.headers.has('X-ErrorCode')) {
          errorCode = errorResponse.headers.get('X-ErrorCode');
        } else {
          errorCode = errorResponse?.status;
        }
      }
      errorText = 'Sorry, an unexpected error was encountered.';
      console.log(errorResponse);
      if (errorCode != null) {
        errorText += ' (Error code: ' + errorCode + ')';
      }

      const snackBar = this.snackBar.open(errorText, 'OK', {
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        duration: 5000,
      });
      snackBar.onAction().subscribe(() => {
        snackBar.dismiss();
      });
    });
  }
}
