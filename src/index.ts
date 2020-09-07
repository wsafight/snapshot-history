/**
 * 可以传入 deep 对比函数
 */
type CompareFun<T> = (prev: T, next: T) => boolean;

function simpleCompare<T>(prev: T, next: T) {
  return JSON.stringify(prev) === JSON.stringify(next);
}

interface SnapshotHistoryConfig<T> {
  /** 比对函数，目前只提供简单的函数 */
  compareFun: CompareFun<T>;
  /** 最大快照数量 */
  maxSnapshots: number;
  /** 添加 WeakMap 以便于生成唯一的 id */
  withKey: boolean;
  /** 使用 本地存储 */
  storage: "localStorage" | "sessionStorage" | "indexDB";
}

class SnapshotHistory<T> {
  private gcNumber = 1;

  readonly maxSnapshots: number;
  readonly compareFun: CompareFun<T>;
  private snapshots: T[] = [];
  private cursor: number = -1;
  private gc: WeakMap<Object, number> = new WeakMap<Object, number>();

  constructor(config: SnapshotHistoryConfig<T>) {
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

  keyBy(snapshot: T): number | undefined {
    return this.gc.get(snapshot);
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

    while (this.cursor < this.snapshots.length - 1) {
      const old: T = this.snapshots.pop() as T;
      this.gc.delete(old);
    }

    // 生成唯一的 id，确保在列表渲染时不会重用 DOM
    this.gc.set(snapshot, this.gcNumber++);

    this.snapshots.push(snapshot);

    // 确保历史记录条数限制
    if (this.snapshots.length > this.maxSnapshots) {
      const oldSnapshot: T = this.snapshots.shift() as T;
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
    this.gc = new WeakMap<Object, number>();
  }

  checkRepeat(snapshot: T) {
    const next = snapshot;
    const prev = this.cursor >= 0 ? this.snapshots[this.cursor] : {};
    // 如果更复杂的对象建议使用 deep equal 库
    return this.compareFun(prev as T, next);
  }
}

export default SnapshotHistory;
