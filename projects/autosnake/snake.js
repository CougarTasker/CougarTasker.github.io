const canvas = document.querySelector("#game canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.querySelector("#game .canvas-container");

const colors = {
  black: "#292e1e",
  white: "#f7fff7",
  blue: "#7bdff2",
  green: "#9cde9f",
  teal: "#48a9a6",
  orange: "#ff8811",
  red: "#ed254e"
};

const gameDimentions = { x: 10, y: 10 };

drawInstance = ({ snake, progress }) => {
  offset = {
    x: Math.floor(canvas.width % gameDimentions.x / 2),
    y: Math.floor(canvas.width % gameDimentions.x / 2),
  }
  cellSize = {
    x: Math.floor(canvas.width / gameDimentions.x),
    y: Math.floor(canvas.height / gameDimentions.y)
  }
  for (var x = 0; x < gameDimentions.x; x++) {
    for (var y = 0; y < gameDimentions.y; y++) {
      switch ((x + y) % 2) {
        case 0:
          ctx.fillStyle = colors.black;
          break;
        case 1:
          ctx.fillStyle = colors.white;
          break;
      }
      ctx.fillRect(cellSize.x * x + offset.x, cellSize.y * y + offset.y, cellSize.x, cellSize.y);
    }
  }
  const snakeTailSize = 0.4;
  const snakeHeadSize = 0.9;
  const snakeStepSize = (snakeHeadSize - snakeTailSize) / snake.length;
  const snake 

  let size = snakeTailSize;

  snake.forEach(part => {
    ctx.fillStyle = colors.green;
    ctx.beginPath();
    ctx.arc(
      cellSize.x * part.x + offset.x + cellSize.x / 2,
      cellSize.y * part.y + offset.y + cellSize.y / 2,
      cellSize.x * 0.5 * size, 0, 2 * Math.PI);
    ctx.fill();
    size += snakeStepSize;
  });
}


const setCanvasSize = () => {
  let size = Math.floor(canvasContainer.clientWidth);
  const maxSize = Math.floor((window.innerHeight - 70) * 0.9);
  if (size > maxSize) {
    size = maxSize;
  }
  canvas.width = size;
  canvas.height = size;
}

window.addEventListener("resize", setCanvasSize);
setCanvasSize();

const renderLoop = () => {

  drawInstance({ snake: [{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }] });
  window.requestAnimationFrame(renderLoop);
}
renderLoop();