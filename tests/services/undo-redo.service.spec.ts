import { TestBed } from '@angular/core/testing';

import { UndoRedoService } from './undo-redo';

describe('UndoRedoService', () => {
  let service: UndoRedoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UndoRedoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
