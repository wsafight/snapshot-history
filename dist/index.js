"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function simpleCompare(prev, next) {
  return JSON.stringify(prev) === JSON.stringify(next);
}
class SnapshotHistory {
  constructor(config) {
    this.gcNumber = 1;
    this.snapshots = [];
    this.cursor = -1;
    this.gc = new WeakMap();
    const {
      maxSnapshots = 20,
      compareFun = simpleCompare,
      withKey = true,
    } = config;
    this.maxSnapshots = maxSnapshots;
    this.compareFun = compareFun;
    if (withKey) {
    }
  }
  keyBy(snapshot) {
    return this.gc.get(snapshot);
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
    while (this.cursor < this.snapshots.length - 1) {
      const old = this.snapshots.pop();
      this.gc.delete(old);
    }
    // 生成唯一的 id，确保在列表渲染时不会重用 DOM
    this.gc.set(snapshot, this.gcNumber++);
    this.snapshots.push(snapshot);
    // 确保历史记录条数限制
    if (this.snapshots.length > this.maxSnapshots) {
      const oldSnapshot = this.snapshots.shift();
      this.gc.delete(oldSnapshot);
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
    this.gc = new WeakMap();
  }
  checkRepeat(snapshot) {
    const next = snapshot;
    const prev = this.cursor >= 0 ? this.snapshots[this.cursor] : {};
    // 如果更复杂的对象建议使用 deep equal 库
    return this.compareFun(prev, next);
  }
}
exports.default = SnapshotHistory;
//# sourceMappingURL=index.js.map
