import { Map, Set } from "immutable";
import { Options } from "./game";
import {
  CellCoordinates,
  coordinatesHash,
  hashCoordinates,
} from "./TileCoordinates";
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
  if (!constraints || !getTile(cell,grid).possibilities.has(tile) || !isWithinBounds(cell)) {
    return COLLAPSE_FAILURE;
  }
  const collapsedValue:cellPossibilityDetails = {
    coordinates: cell,
    possibilities: Set([tile])
  } 
  const gridWithCollapsedCell = grid.set(hashCoordinates(cell), collapsedValue);
  return constraints.reduce<PossibleTileGrid | typeof COLLAPSE_FAILURE>(
    (reduction, [offset, tiles]) =>
      reduction === COLLAPSE_FAILURE
        ? COLLAPSE_FAILURE
        : applyIntersection(addCellCoordinates(cell, offset), tiles, reduction),
    gridWithCollapsedCell
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
  if(!isWithinBounds(cell)){
    return grid;
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
  grid: PossibleTileGrid
): cellPossibilityDetails {
  if (!isWithinBounds(cell)) {
    return {
      coordinates: cell,
      possibilities: emptyItem,
    };
  }
  return grid.get(hashCoordinates(cell), {
    coordinates: cell,
    possibilities: emptyItem,
  });
}

function isWithinBounds(cell: CellCoordinates): boolean {
  const width = Options.numberOfColumns();
  const height = Options.numberOfRows();
  return cell.x >= 0 && cell.x < width && cell.y >= 0 && cell.x < height;
}
