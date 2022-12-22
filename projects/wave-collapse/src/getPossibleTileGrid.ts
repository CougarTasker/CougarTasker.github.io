import {
  cellPossibilityDetails,
  collapseCell,
  PossibleTileGrid,
} from "./collapse";
import { blockNameCoordinates, TileName } from "./TileName";
import { Set, Map, Seq, Stack } from "immutable";
import {
  CellCoordinates,
  coordinatesHash,
  hashCoordinates,
  Options,
} from "./game";
import { selectRandomElementFromCollection } from "./selectRandomElementFromCollection";

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
): PossibleTileGrid | typeof NO_CELL_TO_COLLAPSE {
  type currentEntropy = { size: number; cells: PossibleTileGrid } | null;
  const reduceLowerEntropy = (
    previous: currentEntropy,
    options: cellPossibilityDetails,
    coords: coordinatesHash
  ): currentEntropy => {
    if (options.possibilities.size === 1) {
      return previous;
    } else if (previous === null || options.possibilities.size < previous.size) {
      return { size: options.possibilities.size, cells: Map([[coords, options]]) };
    } else if (options.possibilities.size === previous.size) {
      return {
        size: previous.size,
        cells: previous.cells.set(coords, options),
      };
    } else {
      return previous;
    }
  };
  const lowestEntropy = possibilities.reduce(reduceLowerEntropy, null);
  if (lowestEntropy === null) {
    //nothing matched to be reduced
    // we are done
    return NO_CELL_TO_COLLAPSE;
  }
  return lowestEntropy.cells;
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
  if (cells === NO_CELL_TO_COLLAPSE) {
    return NO_CELL_TO_COLLAPSE;
  }
  const selection = selectRandomElementFromCollection(cells)[0];
  if (selection === undefined) {
    console.error("odd behavior");
    return NO_CELL_TO_COLLAPSE;
  }
  const [_hash, details] = selection
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
  for (const [_cell, {coordinates,possibilities:tiles}] of grid.entries()) {
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
  if (selected === NO_CELL_TO_COLLAPSE) {
    return;
  }
  const {coordinates, possibilities} = selected;
  const firstIteration: stackEntry<collapseAttemptDetails> = {
    return: runCollapseAttempt,
    state: {
      possibleTiles: possibilities,
      grid,
      coordinate:coordinates,
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
    console.log(`mapSize ${poss.size}`);
    for (const [_cell, {possibilities, coordinates}] of poss.entries()) {
      const [option] = selectRandomElementFromCollection(possibilities);
      if (option) {
        mutable.add([coordinates, option]);
      }else{
        console.error("missing options for this cell");
        
      }
    }
  });
}
