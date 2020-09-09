import produce from "immer";
import {
  CompareFun,
  simpleCompare,
  SnapshotHistoryConfig,
} from "../_interface";

class ImmutableSnapshotHistory<T> {
  readonly maxSnapshots: number;
  readonly compareFun: CompareFun<T>;
  private snapshots: T[] = [];
  private cursor: number = -1;

  constructor(config: SnapshotHistoryConfig<T>) {
    const { maxSnapshots = 20, compareFun = simpleCompare } = config;
    this.maxSnapshots = maxSnapshots;
    this.compareFun = compareFun;
  }

  get canUndo(): boolean {
    return this.cursor > 0;
  }

  get canClear(): boolean {
    return this.snapshots.length > 0;
  }

  get canRedo() {
    return this.snapshots.length > this.cursor + 1;
  }

  record(snapshot: T) {
    if (this.checkRepeat(snapshot)) {
      return false;
    }
    // If the current cursor does not point to the last snapshot, discard all subsequent snapshots
    while (this.cursor < this.snapshots.length - 1) {
      this.snapshots.pop();
    }
    const prev = this.snapshots.length
      ? this.snapshots[this.snapshots.length - 1]
      : ({} as T);
    const newSnapshot = produce(prev, (snapshot) => {
      snapshot = Object.assign({}, snapshot);
    });

    this.snapshots.push(newSnapshot);

    // Ensure that the number of history records is limited
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
    this.cursor = this.snapshots.length - 1;
  }

  undo() {
    if (this.canUndo) {
      this.cursor -= 1;
      return this.snapshots[this.cursor];
    }
    return null;
  }

  redo() {
    if (this.canRedo) {
      this.cursor += 1;
      return this.snapshots[this.cursor];
    }
    return null;
  }

  move(cursor: number) {
    if (this.snapshots.length > cursor) {
      this.cursor = cursor;
      return this.snapshots[this.cursor];
    }
  }

  clear() {
    if (!this.canClear) {
      return;
    }
    this.cursor = -1;
    this.snapshots = [];
  }

  checkRepeat(snapshot: T) {
    const next = snapshot;
    const prev = this.cursor >= 0 ? this.snapshots[this.cursor] : {};
    // For more complex objects, it is recommended to use the deep equal library or write your own
    return this.compareFun(prev as T, next);
  }
}

export default ImmutableSnapshotHistory;
