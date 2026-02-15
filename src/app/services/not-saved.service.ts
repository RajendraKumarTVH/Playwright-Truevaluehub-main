import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
export interface UnsavedState {
  status: boolean;
  url: null | string;
}

const defaultSubjectValue: UnsavedState = {
  status: false,
  url: null,
};

@Injectable({
  providedIn: 'root',
})
export class NotSavedService {
  private hasUnsaved$: BehaviorSubject<any> = new BehaviorSubject(defaultSubjectValue);
  private hasUnsavedEvents$: Subject<any> = new Subject();
  private hasBOMChangeEvents$: Subject<any> = new Subject();
  private hasProjectChangeEvents$: Subject<any> = new Subject();
  private hasProjectSelectionCompleteEvents$: Subject<any> = new Subject();
  private hasloadPreviousProjectCompleteEvents$: Subject<any> = new Subject();

  getHasUnsaved(): Observable<any> {
    return this.hasUnsaved$.asObservable();
  }
  getHasUnsavedValue(): Observable<any> {
    return this.hasUnsaved$.value;
  }
  setHasUnsavedData(data: UnsavedState) {
    this.hasUnsaved$.next(data);
  }

  dispatchHasUnsavedEvent(data: any) {
    this.hasUnsavedEvents$.next(data);
  }
  hasUnsavedEvent(): Observable<any> {
    return this.hasUnsavedEvents$.asObservable();
  }

  dispatchBOMSelectionChanges(data: any) {
    this.hasBOMChangeEvents$.next(data);
  }
  hasBOMSelectionChangeEvent(): Observable<any> {
    return this.hasBOMChangeEvents$.asObservable();
  }
  hasProjectSelectionChangeEvent(): Observable<any> {
    return this.hasProjectChangeEvents$.asObservable();
  }
  dispatchProjectSelectionChanges(data: any) {
    this.hasProjectChangeEvents$.next(data);
  }

  hasProjectSelectionCompletedEvent(): Observable<any> {
    return this.hasProjectSelectionCompleteEvents$.asObservable();
  }
  dispatchProjectSelectionCompleteChanges(data: any) {
    this.hasProjectSelectionCompleteEvents$.next(data);
  }
  dispatchPreviousProjectLoaded(data: any) {
    this.hasloadPreviousProjectCompleteEvents$.next(data);
  }
  hasPreviousProjectLoaded(): Observable<any> {
    return this.hasloadPreviousProjectCompleteEvents$.asObservable();
  }
}
