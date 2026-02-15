import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { DirtyModel } from '../models';
import { NotSavedService } from '../services/not-saved.service';
export interface CanComponentDeactivate {
  canDeactivate: () => DirtyModel;
}

export const CanDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (component, currentRoute, currentState, nextState) => {
  const messaging = inject(MessagingService);
  const notSavedService = inject(NotSavedService);

  const model = component.canDeactivate();
  if (!model.isAnyChildDirty) {
    return of(true);
  }
  if (nextState.url.includes('ignoreactivate=1')) {
    return of(true);
  }
  // let listofSections = model.dirtyItems.toString();
  const dialogRef = messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
    data: {
      title: 'Confirm Leave',
      message: 'You have unsaved data which will be lost. Do you still want to proceed?',
      action: 'CONFIRM',
      cancelText: 'CANCEL',
    },
  });

  return dialogRef.afterClosed().pipe(
    map((result) => {
      if (!result) {
        return false;
      } else {
        const data = { dirtyItems: model.dirtyItems, nextUrl: nextState.url, source: 'gaurd' };
        notSavedService.dispatchHasUnsavedEvent(data);
        return true;
      }
    })
  );
};
