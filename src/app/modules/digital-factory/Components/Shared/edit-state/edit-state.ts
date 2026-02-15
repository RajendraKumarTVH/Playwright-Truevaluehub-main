export class EditState<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];
  private lastSaved!: T;

  /** Initialize when page loads */
  init(initial?: T) {
    this.lastSaved = structuredClone(initial);
    this.undoStack = [];
    this.redoStack = [];
  }

  /** Track every meaningful change */
  push(previous: T) {
    this.undoStack.push(structuredClone(previous));
    this.redoStack = [];
  }

  undo(current: T): T | null {
    if (!this.undoStack.length) return null;

    this.redoStack.push(structuredClone(current));
    return this.undoStack.pop();
  }

  redo(current: T): T | null {
    if (!this.redoStack.length) return null;

    this.undoStack.push(structuredClone(current));
    return this.redoStack.pop();
  }

  discard(): T {
    this.undoStack = [];
    this.redoStack = [];
    return structuredClone(this.lastSaved);
  }

  markSaved(value: T) {
    this.lastSaved = structuredClone(value);
    this.undoStack = [];
    this.redoStack = [];
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }
}
