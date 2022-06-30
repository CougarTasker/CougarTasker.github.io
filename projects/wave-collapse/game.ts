const canvas: HTMLCanvasElement = document.querySelector(".canvas-container canvas");
const ctx = canvas.getContext("2d");
const canvasContainer: HTMLElement = document.querySelector(".canvas-container");


const colors = {
  black: "#292e1e",
  darkBlack: "#0e0f0a",
  white: "#f7fff7",
  blue: "#7bdff2",
  green: "#9cde9f",
  teal: "#48a9a6",
  orange: "#ff8811",
  red: "#ed254e"
};
const options = {
  numberOfColumns: () => 10,
  numberOfRows: () => Math.floor(canvasContainer.offsetHeight / options.cellSize()),
  gameSizeFactor: () => 0.9,
  cellSize: () => Math.floor(
    canvasContainer.offsetWidth * options.gameSizeFactor()
    / options.numberOfColumns())
}
const updateSize = () => {
  canvas.width = options.cellSize() * options.numberOfColumns()
  canvas.height = options.cellSize() * options.numberOfRows()
}
updateSize();


const tileMap = new Image()

window.addEventListener('load', () => {
  tileMap.src = './tiles.png'; // Set source path
  tileMap.addEventListener('load', renderLoop, false);
  window.addEventListener('resize', updateSize);
});
interface Cell {
  x: number,
  y: number
}


interface SuperPositionCollection {
  cells: Map<Cell, Set<Tile>>,
  closedCells: Set<Cell>,
  openCells: Set<Cell>,
}

const renderLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // for(i in tiles){
  //   tiles[i].draw(
  //     { x: i % options.numberOfColumns(), 
  //       y: Math.floor(i / options.numberOfColumns()) 
  //     });
  // }


  window.requestAnimationFrame(renderLoop);
}

const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const out = new Set<T>();
  a.forEach(v => {
    if (b.has(v)) {
      out.add(v);
    }
  })
  return out;
}
const shallowCopySuperPosition =
  (input: SuperPositionCollection): SuperPositionCollection => {
    const cells = new Map<Cell, Set<Tile>>()
    const closedCells = new Set<Cell>(input.closedCells)
    const openCells = new Set<Cell>(input.openCells)
    for (let [key, value] of input.cells.entries()) {
      cells.set(key, new Set(value));
    }
    return { cells, openCells, closedCells }
  }
const generateSuperPosition = (): SuperPositionCollection => {
  const cells = new Map<Cell, Set<Tile>>()
  let allTiles = new Set<Tile>(tiles);
  for (let x = 0; x < options.numberOfColumns(); x++) {
    for (let y = 0; y < options.numberOfRows(); y++) {
      cells.set({ x, y }, allTiles);
    }
  }
  const openCells = new Set(cells.keys())
  const closedCells: Set<Cell> = new Set()
  return { cells, openCells, closedCells }
}

const getRandomItemFromSet = (a: Set<T>): T => {
  const randomizeIndex = x => Math.round((x - 1) * Math.random())
  const getItemFromIndex = <T>(item: IterableIterator<T>, index: number): T => {
    let result: IteratorResult<T, any>
    do {
      result = item.next()
      index -= 1;
    } while (index < 1 && !result.done)
    return result.value
  }
  const i = randomizeIndex(a.size)
  return getItemFromIndex(a.values(), i);
}

const collapseSingleCell = (a: SuperPositionCollection)
  : SuperPositionCollection => {

  const cell = getRandomItemFromSet(a.openCells);

  const tiles = a.cells.get(cell)

  const tile = getRandomItemFromSet(tiles);

  a.openCells.delete(cell);
  a.closedCells.add(cell);
  tiles.clear();
  tiles.add(tile);

  return a;
}

const propogateRelationShips = (a: SuperPositionCollection, b: Cell)
  : SuperPositionCollection | "fail" => {
  const releventRelationships = relationships.filter(
    ({ match }) =>
      (typeof match === "function" && match(tile))
      || match.name === tile.name)

    return "fail"
}

const compareCells = (a: Cell, b: Cell): boolean => a.x == b.x && a.y == b.y

const collapseSuperPosition = (input: SuperPositionCollection): SuperPositionCollection => {

  i = collapseSingleCell(i)


  


  const poss = releventRelationships.map(
    ({ possabilities }) => possabilities(input[cellIndex].cell)).flat()


  const possBag = poss.reduce((pre, [cell, tile]) => {
    pre.get(cell).add(tile);
    return pre
  }, new Map<Cell, Set<Tile>>());

  for (let [cell, tileConstraints] of possBag) {
    const cellMatch = input.find(k => compareCells(k.cell, cell));
    cellMatch.tiles = intersection(cellMatch.tiles, tileConstraints);
  }
}

const tileMapProperties = {
  width: () => tileMap.naturalWidth,
  height: () => tileMap.naturalWidth,
  tileWidth: () => 16,
  tileHeight: () => 16,
  rows: () => tileMapProperties.width() / tileMapProperties.tileWidth(),
  columns: () => tileMapProperties.height() / tileMapProperties.tileHeight()
}

const drawTile = (tile, cell) => {
  ctx.drawImage(tileMap,
    tile.x * tileMapProperties.tileWidth(),
    tile.y * tileMapProperties.tileHeight(),
    tileMapProperties.tileWidth(),
    tileMapProperties.tileHeight(),
    cell.x * options.cellSize(),
    cell.y * options.cellSize(),
    (options.cellSize() - 2),
    (options.cellSize() - 2)
  )
}

interface Tile {
  draw: (cell: Cell) => void
  name: string,
}
interface Relationship {
  match: ((test: Tile) => boolean) | Tile,
  possabilities: (cell: Cell) => Possability[]
}
type Possability = [Cell, Tile]
const tiles: Tile[] = [
  {
    draw: (cell) => drawTile({ x: 0, y: 0 }, cell),
    name: "GrassLeft"
  },
  {
    draw: (cell) => drawTile({ x: 1, y: 0 }, cell),
    name: "GrassMiddle"
  },
  {
    draw: (cell) => drawTile({ x: 2, y: 0 }, cell),
    name: "GrassRight"
  },
  {
    draw: (cell) => drawTile({ x: 3, y: 0 }, cell),
    name: "HalfGrassLeft"
  },
  {
    draw: (cell) => drawTile({ x: 4, y: 0 }, cell),
    name: "HalfGrassRight"
  },
  {
    draw: (cell) => drawTile({ x: 5, y: 0 }, cell),
    name: "lightDirt"
  },
  {
    draw: (cell) => drawTile({ x: 6, y: 0 }, cell),
    name: "LightToDarkDirt"
  },
  {
    draw: (cell) => drawTile({ x: 7, y: 0 }, cell),
    name: "DarkestDirt"
  },
  {
    draw: (cell) => drawTile({ x: 0, y: 1 }, cell),
    name: "LeftDirt"
  },
  {
    draw: (cell) => drawTile({ x: 1, y: 1 }, cell),
    name: "MediumDirt"
  },
  {
    draw: (cell) => drawTile({ x: 2, y: 1 }, cell),
    name: "RightDirt"
  },
  {
    draw: (cell) => drawTile({ x: 3, y: 1 }, cell),
    name: "slightBottomLeftHighlightDirt"
  },
  {
    draw: (cell) => drawTile({ x: 4, y: 1 }, cell),
    name: "slightBottomRightHighlightDirt"
  },
  {
    draw: (cell) => drawTile({ x: 5, y: 1 }, cell),
    name: "slightTopHighlightDirt"
  },
  {
    draw: (cell) => drawTile({ x: 6, y: 1 }, cell),
    name: "slightBottomHighlightDirt"
  },
  {
    draw: (cell) => { },
    name: "empty"
  },
  {
    draw: (cell) => drawTile({ x: 0, y: 2 }, cell),
    name: "leftBottomDirt"
  },
  {
    draw: (cell) => drawTile({ x: 1, y: 2 }, cell),
    name: "MiddleBottomDirt"
  },
  {
    draw: (cell) => drawTile({ x: 2, y: 2 }, cell),
    name: "RightBottomDirt"
  },
  {
    draw: (cell) => drawTile({ x: 5, y: 2 }, cell),
    name: "singleDirt"
  },
  {
    draw: (cell) => drawTile({ x: 0, y: 3 }, cell),
    name: "rockTopLeft"
  },
  {
    draw: (cell) => drawTile({ x: 1, y: 3 }, cell),
    name: "rockTop"
  },
  {
    draw: (cell) => drawTile({ x: 2, y: 3 }, cell),
    name: "rockTopRight"
  },
  {
    draw: (cell) => drawTile({ x: 3, y: 3 }, cell),
    name: "rockTopLeftHighlight"
  },
  {
    draw: (cell) => drawTile({ x: 4, y: 3 }, cell),
    name: "rockTopRightHighlight"
  },
  {
    draw: (cell) => drawTile({ x: 5, y: 3 }, cell),
    name: "StoneTopLeft"
  },
  {
    draw: (cell) => drawTile({ x: 6, y: 3 }, cell),
    name: "StoneTop"
  },
  {
    draw: (cell) => drawTile({ x: 7, y: 3 }, cell),
    name: "StoneTopRight"
  },
  {
    draw: (cell) => drawTile({ x: 0, y: 4 }, cell),
    name: "rockleft"
  },
  {
    draw: (cell) => drawTile({ x: 1, y: 4 }, cell),
    name: "rockDark"
  },
  {
    draw: (cell) => drawTile({ x: 2, y: 4 }, cell),
    name: "rockRight"
  },
  {
    draw: (cell) => drawTile({ x: 3, y: 4 }, cell),
    name: "rockBottomLeftHighlight"
  },
  {
    draw: (cell) => drawTile({ x: 4, y: 4 }, cell),
    name: "rockBottomRightHighlight"
  },
  {
    draw: (cell) => drawTile({ x: 5, y: 4 }, cell),
    name: "StoneLeft"
  },
  {
    draw: (cell) => drawTile({ x: 6, y: 4 }, cell),
    name: "StoneMiddle"
  },
  {
    draw: (cell) => drawTile({ x: 7, y: 4 }, cell),
    name: "StoneRight"
  },
  {
    draw: (cell) => drawTile({ x: 0, y: 5 }, cell),
    name: "rockBottomLeft"
  },
  {
    draw: (cell) => drawTile({ x: 1, y: 5 }, cell),
    name: "rockBottom"
  },
  {
    draw: (cell) => drawTile({ x: 2, y: 5 }, cell),
    name: "rockBottomRight"
  },
  {
    draw: (cell) => drawTile({ x: 3, y: 5 }, cell),
    name: "rockForwardsDiagoinalHighlight"
  },
  {
    draw: (cell) => drawTile({ x: 4, y: 5 }, cell),
    name: "rockBackwardsDiagonalHighlight"
  }
]

const topBottom = (top: string, bottom: string): Relationship[] => {
  const topTile = tiles.find(tile => tile.name == top);
  const bottomTile = tiles.find(tile => tile.name == bottom);
  return [
    {
      match: topTile,
      possabilities: ({ x, y: oy }) => [[{ x, y: oy - 1 }, bottomTile]]
    },
    {
      match: bottomTile,
      possabilities: ({ x, y: oy }) => [[{ x, y: oy + 1 }, topTile]]
    }
  ]
}
const leftRight = (left: string, right: string): Relationship[] => {
  const leftTile = tiles.find(tile => tile.name == left);
  const rightTile = tiles.find(tile => tile.name == right);
  return [
    {
      match: leftTile,
      possabilities: ({ x: ox, y }) => [[{ x: ox + 1, y }, rightTile]]
    },
    {
      match: rightTile,
      possabilities: ({ x: ox, y }) => [[{ x: ox - 1, y }, leftTile]]
    }
  ]
}

const relationships: Relationship[] = [

  ...topBottom("empty", "empty"),
  ...leftRight("empty", "empty"),

  /// grass layers
  ...topBottom("empty", "GrassLeft"),
  ...topBottom("empty", "GrassMiddle"),
  ...topBottom("empty", "GrassRight"),

  ...leftRight("empty", "GrassLeft"),
  ...leftRight("GrassLeft", "GrassMiddle"),
  ...leftRight("GrassMiddle", "GrassMiddle"),
  ...leftRight("GrassMiddle", "GrassRight"),
  ...leftRight("GrassRight", "empty"),

  ...leftRight("GrassMiddle", "HalfGrassLeft"),
  ...leftRight("HalfGrassRight", "GrassMiddle"),

  ...topBottom("GrassLeft", "leftBottomDirt"),
  ...topBottom("GrassMiddle", "MiddleBottomDirt"),
  ...topBottom("GrassRight", "RightBottomDirt"),


  ///bottom dirt row
  ...leftRight("empty", "leftBottomDirt"),
  ...leftRight("leftBottomDirt", "MiddleBottomDirt"),
  ...leftRight("MiddleBottomDirt", "MiddleBottomDirt"),
  ...leftRight("MiddleBottomDirt", "RightBottomDirt"),
  ...leftRight("RightBottomDirt", "empty"),

  ...topBottom("leftBottomDirt", "empty"),
  ...topBottom("MiddleBottomDirt", "empty"),
  ...topBottom("RightBottomDirt", "empty"),

  ///single dirt
  ...topBottom("singleDirt", "empty"),
  ...topBottom("empty", "singleDirt"),
  ...leftRight("singleDirt", "empty"),
  ...leftRight("empty", "singleDirt"),
]