/**
 * 可以传入 deep 对比函数
 */
declare type CompareFun<T> = (prev: T, next: T) => boolean;
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
declare class SnapshotHistory<T> {
  private gcNumber;
  readonly maxSnapshots: number;
  readonly compareFun: CompareFun<T>;
  private snapshots;
  private cursor;
  private gc;
  constructor(config: SnapshotHistoryConfig<T>);
  keyBy(snapshot: T): number | undefined;
  get canUndo(): boolean;
  get canClear(): boolean;
  get canRedo(): boolean;
  record(snapshot: T): false | undefined;
  undo(): T | null;
  redo(): T | null;
  move(cursor: number): T | undefined;
  clear(): void;
  checkRepeat(snapshot: T): boolean;
}
export default SnapshotHistory;
