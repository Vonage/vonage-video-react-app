const FINDER_SIZE = 7;

/**
 * Decides whether one module of the placeholder QR grid is dark.
 */
function isQrModuleFilled({
  row,
  column,
  size,
  seed,
}: {
  row: number;
  column: number;
  size: number;
  seed: string;
}): boolean {
  const finderOrigin = getFinderOrigin({ row, column, size });

  if (finderOrigin) {
    const localRow = row - finderOrigin.row;
    const localColumn = column - finderOrigin.column;
    const isOuterRing =
      localRow === 0 ||
      localRow === FINDER_SIZE - 1 ||
      localColumn === 0 ||
      localColumn === FINDER_SIZE - 1;
    const isInnerSquare = localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;

    return isOuterRing || isInnerSquare;
  }

  const isSeparator = isNextToFinder({ row, column, size });
  if (isSeparator) return false;

  const seedHash = Array.from(seed).reduce(
    (accumulator, character) => Math.imul(accumulator ^ character.charCodeAt(0), 16777619),
    2166136261
  );
  const mixed = Math.imul(seedHash ^ (row * size + column), 0x5bd1e995);
  const avalanche = Math.imul(mixed ^ (mixed >>> 15), 0x2c1b3c6d);

  return ((avalanche ^ (avalanche >>> 13)) & 1) === 1;
}

function getFinderOrigin({ row, column, size }: { row: number; column: number; size: number }) {
  const farEdge = size - FINDER_SIZE;
  if (row < FINDER_SIZE && column < FINDER_SIZE) return { row: 0, column: 0 };
  if (row < FINDER_SIZE && column >= farEdge) return { row: 0, column: farEdge };
  if (row >= farEdge && column < FINDER_SIZE) return { row: farEdge, column: 0 };
  return null;
}

function isNextToFinder({ row, column, size }: { row: number; column: number; size: number }) {
  const farEdge = size - FINDER_SIZE - 1;
  const isTopLeft = row <= FINDER_SIZE && column <= FINDER_SIZE;
  const isTopRight = row <= FINDER_SIZE && column >= farEdge;
  const isBottomLeft = row >= farEdge && column <= FINDER_SIZE;

  return isTopLeft || isTopRight || isBottomLeft;
}

export default isQrModuleFilled;
