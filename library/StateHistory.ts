export default class StateHistory<T> {
    maxSize: number;
    undoStack: T[]; // stores past
    redoStack: T[]; // stores future

    constructor(maxSize: number = 30) {
        this.maxSize = maxSize;
        this.undoStack = [];
        this.redoStack = [];
    }

    resetHistory() {
        this.undoStack.length = 0;
        this.redoStack.length = 0;
    }

    addToHistory(snapshot: T) {
        if (this.undoStack.length >= this.maxSize) this.undoStack.shift();

        this.undoStack.push(snapshot); // pushing the current state's snapshot in history

        this.redoStack.length = 0; // when a new snapshot is pushed to history then clearing the future
    }

    isUndoAllowed() {
        return this.undoStack.length > 0;
    }

    isRedoAllowed() {
        return this.redoStack.length > 0;
    }

    undo(currSnapshot: T) {
        const prev = this.undoStack.pop();
        if (!prev) return;

        this.redoStack.push(currSnapshot); // storing the current snapshot in redo stack

        return prev; // returning the past/previous snapshot of the state -> to be used as current state
    }

    redo(currSnapshot: T) {
        const next = this.redoStack.pop();
        if (!next) return;

        this.undoStack.push(currSnapshot); // storing the current snapshot in undo stack

        return next; // returning the future/next snapshot of the state -> to be used as current state
    }
}