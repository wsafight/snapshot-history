export function simpleCompare<T>(prev: T, next: T) {
  return JSON.stringify(prev) === JSON.stringify(next);
}

/**
 * Generate a unique id to ensure that the DOM is not reused when the list is rendered
 * @param key
 */
export function generateUid(key: string | number) {
  return `snapshot-history:${Date.now()}:${key}`;
}
