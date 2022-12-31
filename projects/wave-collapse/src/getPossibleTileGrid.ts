import {
  cellPossibilityDetails,
  collapseCell,
  PossibleTileGrid,
} from "./collapse";
import { blockNameCoordinates, TileName } from "./TileName";
import { Set, Map, Seq, Stack, has } from "immutable";
import { Options } from "./game";
import {
  CellCoordinates,
  coordinatesHash,
  hashCoordinates,
} from "./TileCoordinates";
import { selectRandomElementFromCollection } from "./selectRandomElementFromCollection";
import { cellIsEmpty } from "./emptyCellTest";

/**
 * creates a set of cell coordinates within a given width and height
 * @param width the width of the field
 * @param height the height of the field
 * @returns a set of all of the cell coordinates
 */
function generateCellCoordinates(
  width: number = Options.numberOfColumns(),
  height: number = Options.numberOfRows()
): Set<CellCoordinates> {
  return Set<CellCoordinates>().withMutations((cells) => {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        cells.add({ x, y });
      }
    }
    return cells;
  });
}

export function getBasicTileGrid(): PossibleTileGrid {
  const allTiles = Set<TileName>(blockNameCoordinates.keySeq());
  const allCells = Set<CellCoordinates>(generateCellCoordinates());
  const cellsWithTiles = allCells.map(
    (cell): [coordinatesHash, cellPossibilityDetails] => [
      hashCoordinates(cell),
      { coordinates: cell, possibilities: allTiles },
    ]
  );
  return Map(cellsWithTiles);
}

export const COLLAPSE_FAILURE = "COLLAPSE_FAILURE";

export const NO_CELL_TO_COLLAPSE = "NO_CELL_TO_COLLAPSE";

/**
 * gets the cells with the lowest number of options to pick between
 * @param possibilities the full grid of cells and their possible states
 * @returns a subset of that grid that all share the same number of lowest
 * cells to collapse
 */
function lowestEntropyCells(
  possibilities: PossibleTileGrid
): PossibleTileGrid{
  let entropyLevel = Number.MAX_SAFE_INTEGER;
  let lowestCells: PossibleTileGrid = Map();
  for (const [hash, details] of possibilities.entries()) {
    if (details.possibilities.size > 1) {
      //fixed cells have no entropy so no use
      if (entropyLevel < details.possibilities.size) {
        entropyLevel = details.possibilities.size;
        lowestCells = Map(); // reset the subset there is a low entropy level
      }
      if (entropyLevel === details.possibilities.size) {
        lowestCells = lowestCells.set(hash, details);
      }
    }
  }
  return lowestCells
}

/**
 *
 * @param possibilities the cell coordinates and their possible cell values
 * @returns a cell coordinate and its possible values
 */
function getCellToCollapse(
  possibilities: PossibleTileGrid
): cellPossibilityDetails | typeof NO_CELL_TO_COLLAPSE {
  const cells = lowestEntropyCells(possibilities);
  const selection = selectRandomElementFromCollection(cells)[0];
  if (selection === undefined) {
    return NO_CELL_TO_COLLAPSE;
  }
  const [_hash, details] = selection;
  return details;
}

/* 

reduction function part 

:head -> start 
pick cell to reduce

: for each of its possible tiles 
try collapse
if collapse 
    res = call head
    if res != failure
      return res 
: end for 

return failure
*/

type TileGrid = Set<[CellCoordinates, TileName]>;

/**
 * tests wether a grid is fully collapsed, if not it will return collapse
 * failure.
 * @param grid possible tile grid that might be fully collapsed
 * @returns the single tile grid represented by a collapsed grid or collapse
 * failure
 */
function collapsedGrid(
  grid: PossibleTileGrid
): TileGrid | typeof COLLAPSE_FAILURE {
  const output = Set<[CellCoordinates, TileName]>().asMutable();
  for (const [_cell, { coordinates, possibilities: tiles }] of grid.entries()) {
    const tile = tiles.first();
    if (tile === undefined || tiles.size > 1) {
      return COLLAPSE_FAILURE;
    }
    output.add([coordinates, tile]);
  }

  return output.asImmutable();
}

type stackEntry<T = any> = {
  state: T;
  return: (state: T) => void;
};

const callStack: stackEntry<collapseAttemptDetails | PossibleTileGrid>[] = [];

type collapseAttemptDetails = {
  grid: PossibleTileGrid;
  possibleTiles: Set<TileName>;
  coordinate: CellCoordinates;
};

function runCollapseAttempt({
  grid,
  possibleTiles,
  coordinate,
}: collapseAttemptDetails) {
  console.log(
    `cell collapse attempt ${JSON.stringify(coordinate)}:${possibleTiles.size}`
  );

  const [selectedTile, remaining] =
    selectRandomElementFromCollection(possibleTiles);
  if (selectedTile === undefined) {
    return; // no more cells to try this has been a bad pick
  }

  const gridAttempt = collapseCell(selectedTile, coordinate, grid);

  const pushNextIteration = () => {
    const nextIteration: stackEntry<collapseAttemptDetails> = {
      return: runCollapseAttempt,
      state: {
        possibleTiles: remaining,
        grid,
        coordinate,
      },
    };
    callStack.push(nextIteration);
  };
  if (gridAttempt === COLLAPSE_FAILURE) {
    // try next option
    pushNextIteration();
    return;
  }
  console.log("collapse success");
  const finalGrid = collapsedGrid(gridAttempt);
  if (finalGrid === COLLAPSE_FAILURE) {
    // not final try collapse another cell
    pushNextIteration();
    const nextCell: stackEntry<PossibleTileGrid> = {
      state: gridAttempt,
      return: pickCell,
    };
    callStack.push(nextCell);
  } else {
    //final we are done
    doneLoop(grid);
    console.log("done!!");
  }
}

function doneLoop(grid: PossibleTileGrid) {
  const entry: stackEntry<PossibleTileGrid> = {
    return: doneLoop,
    state: grid,
  };
  callStack.push(entry);
  return;
}

function pickCell(grid: PossibleTileGrid) {
  const selected = getCellToCollapse(grid);
  console.log(
    `select cell to reduce ${
      typeof selected === "string"
        ? selected
        : JSON.stringify(selected.coordinates)
    }`
  );
  if (selected === NO_CELL_TO_COLLAPSE) {
    return;
  }
  const { coordinates, possibilities } = selected;
  const firstIteration: stackEntry<collapseAttemptDetails> = {
    return: runCollapseAttempt,
    state: {
      possibleTiles: possibilities,
      grid,
      coordinate: coordinates,
    },
  };
  callStack.push(firstIteration);
  return;
}

function callStackLoop() {
  for (let i = 0; i < 100; i++) {
    const top = callStack.pop();
    if (top) {
      top.return(top.state);
    }
  }
  setTimeout(callStackLoop, 0);
}

export function getTileGrid(): TileGrid {
  if (callStack.length === 0) {
    // start process
    const startingGrid = getBasicTileGrid();
    pickCell(startingGrid);
    callStackLoop();
    return getRandomTileGrid(startingGrid);
  }
  const top = callStack[callStack.length - 1].state;
  if (Map.isMap(top)) {
    return getRandomTileGrid(top);
  }
  return getRandomTileGrid(top.grid);
}

function getRandomTileGrid(poss: PossibleTileGrid): TileGrid {
  return Set<[CellCoordinates, TileName]>().withMutations((mutable) => {
    for (const [_cell, { possibilities, coordinates }] of poss.entries()) {
      if (possibilities.includes(TileName.RockBottom)) {
        mutable.add([coordinates, TileName.RockBottom]);
      } else {
        const [option] = selectRandomElementFromCollection(possibilities);
        if (option !== undefined) {
          mutable.add([coordinates, option]);
        } else {
          console.error("missing options for this cell");
        }
      }
    }
  });
}
