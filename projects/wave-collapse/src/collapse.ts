import { Map, Set } from "immutable";
import {
  CellCoordinates,
  coordinatesHash,
  hashCoordinates,
  Options,
} from "./game";
import { COLLAPSE_FAILURE } from "./getPossibleTileGrid";
import { TileName } from "./TileName";
import { tileRelations } from "./tileRelations";

export type cellPossibilityDetails = {
  possibilities: Set<TileName>;
  coordinates: CellCoordinates;
};
export type PossibleTileGrid = Map<coordinatesHash, cellPossibilityDetails>;

export function collapseCell(
  tile: TileName,
  cell: CellCoordinates,
  grid: PossibleTileGrid
): PossibleTileGrid | typeof COLLAPSE_FAILURE {
  const constraints = tileRelations.get(tile);
  if (!constraints) {
    return COLLAPSE_FAILURE;
  }
  return constraints.reduce<PossibleTileGrid | typeof COLLAPSE_FAILURE>(
    (reduction, tiles, offset) =>
      reduction === COLLAPSE_FAILURE
        ? COLLAPSE_FAILURE
        : applyIntersection(addCellCoordinates(cell, offset), tiles, grid),
    grid
  );
}

function applyIntersection(
  cell: CellCoordinates,
  tiles: Set<TileName>,
  grid: PossibleTileGrid
): PossibleTileGrid | typeof COLLAPSE_FAILURE {
  const intersection = getTile(cell, grid).possibilities.intersect(tiles);
  if (intersection.size <= 0) {
    return COLLAPSE_FAILURE;
  }
  return grid.set(hashCoordinates(cell), {
    coordinates: cell,
    possibilities: intersection,
  });
}

function addCellCoordinates(
  base: CellCoordinates,
  offset: CellCoordinates
): CellCoordinates {
  return { x: base.x + offset.x, y: base.y + offset.y };
}
const emptyItem = Set([TileName.Empty]);
function getTile(
  cell: CellCoordinates,
  grid: PossibleTileGrid,
  width: number = Options.numberOfColumns(),
  height: number = Options.numberOfRows()
): cellPossibilityDetails {
  if (cell.x < 0 || cell.x >= width) {
    return {
      coordinates: cell,
      possibilities: emptyItem,
    };
  } else if (cell.y < 0 || cell.y >= height) {
    return {
      coordinates: cell,
      possibilities: emptyItem,
    };
  } else {
    return grid.get(hashCoordinates(cell), {
      coordinates: cell,
      possibilities: emptyItem,
    });
  }
}
