import { FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { EditState } from './edit-state';
import moment from 'moment';

export function connectEditState<T>(form: FormGroup, state: EditState<T>, debounceMs = 300) {
  let lastValue = getStructuredClone(form.getRawValue());

  state.init(lastValue);

  const sub = form.valueChanges.pipe(debounceTime(debounceMs)).subscribe((current) => {
    state.push(lastValue);
    lastValue = getStructuredClone(current);
  });

  return {
    dispose: () => sub.unsubscribe(),

    undo: () => {
      const value = state.undo(form.getRawValue());
      if (value) {
        lastValue = getStructuredClone(value);
        form.patchValue(value, { emitEvent: false });
      }
    },

    redo: () => {
      const value = state.redo(form.getRawValue());
      if (value) {
        lastValue = getStructuredClone(value);
        form.patchValue(value, { emitEvent: false });
      }
    },

    discard: () => {
      const value = state.discard();
      lastValue = getStructuredClone(value);
      form.reset(value, { emitEvent: false });
    },

    markSaved: () => {
      const value = getStructuredClone(form.getRawValue());
      state.markSaved(value);
      lastValue = value;
      form.markAsPristine();
    },
  };
}

function getStructuredClone(current: any) {
  if (current.effectiveDate) {
    current.effectiveDate = moment(current.effectiveDate).format('YYYY-MM-DD HH:mm:ss');
  }
  return structuredClone(current);
}
