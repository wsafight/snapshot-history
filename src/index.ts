/**
 * 可以传入 deep 对比函数
 */
type CompareFun<T> = (prev: T, next: T) => boolean;

function simpleCompare<T>(prev: T, next: T) {
  return JSON.stringify(prev) === JSON.stringify(next);
}

/**
 * Generate a unique id to ensure that the DOM is not reused when the list is rendered
 * @param key
 */
function generateUid(key: string | number) {
  return `snapshot-history:${Date.now()}:${key}`;
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
  private uid: number = 1;
  readonly maxSnapshots: number;
  readonly compareFun: CompareFun<T>;
  readonly withKey: boolean;
  private snapshots: T[] = [];
  private cursor: number = -1;

  private keyByObj: WeakMap<Object, string> | null = null;

  constructor(config: SnapshotHistoryConfig<T>) {
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

  initialKeyObj(): void {
    if (this.withKey) {
      this.keyByObj = new WeakMap<Object, string>();
    }
  }

  keyBy(snapshot: T): string | undefined {
    if (!this.withKey) {
      throw new Error('Please set the configuration item "withKey" to true');
    }
    return this.keyByObj!.get(snapshot);
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
      const next: T = this.snapshots.pop() as T;
      if (this.withKey) {
        this.keyByObj!.delete(next);
      }
    }

    if (this.withKey) {
      this.keyByObj!.set(snapshot, generateUid(this.uid++));
    }

    this.snapshots.push(snapshot);

    // Ensure that the number of history records is limited
    if (this.snapshots.length > this.maxSnapshots) {
      const prev: T = this.snapshots.shift() as T;
      if (this.withKey) {
        this.keyByObj!.delete(prev);
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
    this.initialKeyObj();
  }

  checkRepeat(snapshot: T) {
    const next = snapshot;
    const prev = this.cursor >= 0 ? this.snapshots[this.cursor] : {};
    // For more complex objects, it is recommended to use the deep equal library or write your own
    return this.compareFun(prev as T, next);
  }
}

export default SnapshotHistory;
