export type CompareFun<T> = (prev: T, next: T) => boolean;

export interface SnapshotHistoryConfig<T> {
  /** 比对函数，目前只提供简单的函数 */
  compareFun: CompareFun<T>;
  /** 最大快照数量 */
  maxSnapshots: number;
  /** 添加 WeakMap 以便于生成唯一的 id */
  withKey: boolean;
  /** 使用 本地存储 */
  storage: "localStorage" | "sessionStorage" | "indexDB";
}
