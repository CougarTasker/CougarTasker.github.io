import {
  collapseCell,
  isValidTile,
  PossibleTileGrid,
} from "./tileRelations";
import { blockNameCoordinates, TileName } from "./TileName";
import { Set, Map } from "immutable";
import { CellCoordinates, Options } from "./game";

function* generateCellCoordinates(
  width: number = Options.numberOfColumns(),
  height: number = Options.numberOfRows()
): Generator<CellCoordinates, number, unknown> {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      yield { x, y };
    }
  }
  return width * height;
}

function getBasicTileGrid(): PossibleTileGrid {
  const allTiles = Set<TileName>(blockNameCoordinates.keySeq());
  const allCells = Set<CellCoordinates>(generateCellCoordinates());
  const cellsWithTiles = allCells.map(
    (cell): [CellCoordinates, typeof allTiles] => [cell, allTiles]
  );
  return Map(cellsWithTiles);
}

export function getPossibleTileGrid(): PossibleTileGrid {
  return getBasicTileGrid();
}

export const COLLAPSE_FAILURE = "COLLAPSE_FAILURE";

const randomIndex = (size: number) => Math.floor(size * Math.random());
function selectRandomElementFromSet<T>(set: Set<T>): [T | undefined, Set<T>] {
  let index = randomIndex(set.size);
  const element = set.find(() => {
    index -= 1;
    return index < 0;
  });
  if (element === undefined) {
    return [undefined, set];
  }
  return [element, set.filter((val) => val != element)];
}

function collapsePossibleTileGrid(
  possibilities: PossibleTileGrid
): PossibleTileGrid | typeof COLLAPSE_FAILURE {
  type currentEntropy = { size: number; coords: CellCoordinates[] };
  const reduceLowerEntropy = (
    previous: currentEntropy | null,
    options: Set<unknown>,
    coords: CellCoordinates
  ): currentEntropy | null => {
    if (options.size === 1) {
      return previous;
    } else if (previous === null || options.size < previous.size) {
      return { size: options.size, coords: [coords] };
    } else if (options.size === previous.size) {
      return { size: previous.size, coords: [...previous.coords, coords] };
    } else {
      return previous;
    }
  };
  const lowestEntropy = possibilities.reduce(reduceLowerEntropy, null);
  if (lowestEntropy === null) {
    //nothing matched to be reduced
    // we are done
    return possibilities;
  }

  const collapsingCoords =
    lowestEntropy.coords[randomIndex(lowestEntropy.coords.length)];

  const possibleTiles = possibilities.get(collapsingCoords);
  if (possibleTiles === undefined) {
    throw new Error("possibilities does not now contain tile from reducer");
  }

  let [selectedTile, remainingSet] = selectRandomElementFromSet(possibleTiles);
  if (selectedTile === undefined) {
    throw new Error("possible set is empty??");
  }
  while (selectedTile !== undefined) {
    if (isValidTile(selectedTile, collapsingCoords, possibilities)) {
      const newGrid =  collapsePossibleTileGrid(
        collapseCell(selectedTile, collapsingCoords, possibilities)
      );
      if(newGrid !== COLLAPSE_FAILURE){
        return newGrid
      }
    }
    [selectedTile, remainingSet] = selectRandomElementFromSet(remainingSet);
  }
  //no tiles are valid for this selection 
  return COLLAPSE_FAILURE
}
