export function resolveActiveHeadingIds(
  itemIds: readonly string[],
  visibleIds: ReadonlySet<string>,
  tops: ReadonlyMap<string, number>,
): Set<string> {
  if (visibleIds.size > 0) {
    return new Set(visibleIds);
  }

  let lastAbove: string | undefined;
  for (const id of itemIds) {
    const top = tops.get(id);
    if (top !== undefined && top < 0) {
      lastAbove = id;
    }
  }

  if (lastAbove) {
    return new Set([lastAbove]);
  }

  return new Set(itemIds[0] ? [itemIds[0]] : []);
}
