import { PossibleTileGrid } from "./collapse";
import { COLLAPSE_FAILURE, getTileGrid, NO_CELL_TO_COLLAPSE } from "./getPossibleTileGrid";
import { TileCoordinates, CellCoordinates } from "./TileCoordinates";
import { blockNameCoordinates } from "./TileName";
import TileMapImage from "./tiles.png";

const canvasContainer: HTMLElement | null =
  document.querySelector(".canvas-container");

if (canvasContainer === null) {
  throw new Error("document missing canvas container");
}
const canvas: HTMLCanvasElement | null = document.querySelector(
  ".canvas-container canvas"
);
if (canvas === null) {
  throw new Error("document missing canvas");
}
const ctx = canvas.getContext("2d");
if (ctx === null) {
  throw new Error("canvas missing 2d context");
}

const colors = {
  black: "#292e1e",
  darkBlack: "#0e0f0a",
  white: "#f7fff7",
  blue: "#7bdff2",
  green: "#9cde9f",
  teal: "#48a9a6",
  orange: "#ff8811",
  red: "#ed254e",
};
export const Options = {
  numberOfColumns: () => 10,
  numberOfRows: () =>
    Math.floor(canvasContainer.offsetHeight / Options.cellSize()),
  gameSizeFactor: () => 0.9,
  cellSize: () =>
    Math.floor(
      (canvasContainer.offsetWidth * Options.gameSizeFactor()) /
        Options.numberOfColumns()
    ),
};
const updateSize = () => {
  canvas.width = Options.cellSize() * Options.numberOfColumns();
  canvas.height = Options.cellSize() * Options.numberOfRows();
};

const tileMap = new Image();

window.addEventListener("load", () => {
  tileMap.src = TileMapImage; // Set source path
  tileMap.addEventListener("load", renderLoop, false);
  window.addEventListener("resize", updateSize);
  updateSize();
});
const renderLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const grid = getTileGrid();
  for (const [cellCoords, tile] of grid.values()) {
    const tileCoords = blockNameCoordinates.get<null>(tile, null);
    if (tileCoords !== null) {
      drawTile(tileCoords, cellCoords);
    }
  }
  window.requestAnimationFrame(renderLoop);
};

const tileMapProperties = {
  width: () => tileMap.naturalWidth,
  height: () => tileMap.naturalWidth,
  tileWidth: () => 16,
  tileHeight: () => 16,
  rows: () => tileMapProperties.width() / tileMapProperties.tileWidth(),
  columns: () => tileMapProperties.height() / tileMapProperties.tileHeight(),
};

const drawTile = (tile: TileCoordinates, cell: CellCoordinates) => {
  ctx.drawImage(
    tileMap,
    tile.x * tileMapProperties.tileWidth(),
    tile.y * tileMapProperties.tileHeight(),
    tileMapProperties.tileWidth(),
    tileMapProperties.tileHeight(),
    cell.x * Options.cellSize(),
    cell.y * Options.cellSize(),
    Options.cellSize() - 2,
    Options.cellSize() - 2
  );
};
