"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function simpleCompare(prev, next) {
  return JSON.stringify(prev) === JSON.stringify(next);
}
/**
 * Generate a unique id to ensure that the DOM is not reused when the list is rendered
 * @param key
 */
function generateUid(key) {
  return `snapshot-history:${Date.now()}:${key}`;
}
class SnapshotHistory {
  constructor(config) {
    this.uid = 1;
    this.snapshots = [];
    this.cursor = -1;
    this.keyByObj = null;
    const {
      maxSnapshots = 20,
      compareFun = simpleCompare,
      withKey = true,
    } = config;
    this.maxSnapshots = maxSnapshots;
    this.compareFun = compareFun;
    this.withKey = withKey;
    this.initialKeyObj();
  }
  initialKeyObj() {
    if (this.withKey) {
      this.keyByObj = new WeakMap();
    }
  }
  keyBy(snapshot) {
    if (!this.withKey) {
      throw new Error('Please set the configuration item "withKey" to true');
    }
    return this.keyByObj.get(snapshot);
  }
  get canUndo() {
    return this.cursor > 0;
  }
  get canClear() {
    return this.snapshots.length > 0;
  }
  get canRedo() {
    return this.snapshots.length > this.cursor + 1;
  }
  record(snapshot) {
    if (this.checkRepeat(snapshot)) {
      return false;
    }
    // If the current cursor does not point to the last snapshot, discard all subsequent snapshots
    while (this.cursor < this.snapshots.length - 1) {
      const next = this.snapshots.pop();
      if (this.withKey) {
        this.keyByObj.delete(next);
      }
    }
    if (this.withKey) {
      this.keyByObj.set(snapshot, generateUid(this.uid++));
    }
    this.snapshots.push(snapshot);
    // Ensure that the number of history records is limited
    if (this.snapshots.length > this.maxSnapshots) {
      const prev = this.snapshots.shift();
      if (this.withKey) {
        this.keyByObj.delete(prev);
      }
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
  move(cursor) {
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
    this.initialKeyObj();
  }
  checkRepeat(snapshot) {
    const next = snapshot;
    const prev = this.cursor >= 0 ? this.snapshots[this.cursor] : {};
    // For more complex objects, it is recommended to use the deep equal library or write your own
    return this.compareFun(prev, next);
  }
}
exports.default = SnapshotHistory;
//# sourceMappingURL=index.js.map
