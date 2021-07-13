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
lerp = (start, end, factor) => {
  return start + (end - start) * factor;
}
function dir(cur, next) {
  this.x = next.x - cur.x;
  this.y = next.y - cur.y;
  this.equals = (k) => {
    return k != null && k.x === this.x && k.y === this.y
  }
}
computeDirections = (snake, nextHead) => {
  previous = null;
  let i;
  for (i = 0; i < snake.length - 1; i++) {
    snake[i].dir = new dir(snake[i], snake[i + 1]);
    snake.corner = !snake[i].dir.equals(previous);
    previous = snake[i].dir;
  }
  snake[i].dir = new dir(snake[i], nextHead);
  snake.corner = !snake[i].dir.equals(previous);
}

drawInstance = ({ snake }, { snake: nextSnake }, progress) => {
  offset = {
    x: Math.floor(canvas.width % gameDimentions.x / 2),
    y: Math.floor(canvas.width % gameDimentions.x / 2),
  }
  cellSize = {
    x: Math.floor(canvas.width / gameDimentions.x),
    y: Math.floor(canvas.height / gameDimentions.y)
  }
  //draw grid
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
  const snakeHeadSize = 0.8;
  const snakeStepSize = (snakeHeadSize - snakeTailSize) / (snake.length - 1);

  let size = snakeTailSize;




  //draw a ciricle for each of the pars of the snake 

  //add moving head and tail
  const tail = snake[0];
  const head = snake[snake.length - 1];
  const nextHead = nextSnake[nextSnake.length - 1];
  computeDirections(snake, nextHead);
  snake.forEach(part => {
    ctx.fillStyle = colors.red;
    ctx.beginPath();
    ctx.arc(
      cellSize.x * (part.x + part.dir.x * progress) + offset.x + cellSize.x / 2,
      cellSize.y * (part.y + part.dir.y * progress) + offset.x + offset.y + cellSize.y / 2,
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

const fakeCurrentInstance = { snake: [{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }] }
const fakeNextInstance = { snake: [{ x: 4, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 2 },] }

let start = Date.now();
const renderLoop = () => {
  const progressDuration = 1000;
  const progress = ((Date.now() - start) % progressDuration) / progressDuration;
  drawInstance(fakeCurrentInstance, fakeNextInstance, progress);
  window.requestAnimationFrame(renderLoop);

}
renderLoop();