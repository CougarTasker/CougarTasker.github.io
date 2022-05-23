const canvas = document.querySelector(".canvas-container canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.querySelector(".canvas-container");

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
  numberOfRows: () => Math.floor(canvasContainer.innerHeight/options.cellSize()),
  gameSizeFactor: () => 0.9,
  cellSize: () => Math.floor(
    canvasContainer.innerWidth * options.gameSizeFactor()
    / options.numberOfColumns())
}
const updateSize = () => {
  canvas.width = options.cellSize() * options.numberOfColumns()
  canvas.height = options.cellSize() * options.numberOfRows()
}
updateSize();


const tileMap = new Image()

window.addEventListener('load', () => {
  game.reset();//set everything up before rendering 
  // once everything has loaded start rendering
  tileMap.src = './tiles.png'; // Set source path
  tileMap.addEventListener('load', renderLoop, false);
  window.addEventListener('resize', updateSize);

});