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

drawInstance = ({ snake }, { snake: nextSnake }, progress) => {
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
  const snakeHeadSize = 0.8;
  const snakeStepSize = (snakeHeadSize - snakeTailSize) / (snake.length - 1);

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

  //add moving head and tail
  const tail = snake[0];
  const head = snake[snake.length - 1];
  const nextTail = nextSnake[0];
  const nextHead = nextSnake[nextSnake.length - 1];

  //head 
  midHead = {
    x: lerp(head.x, nextHead.x, progress),
    y: lerp(head.y, nextHead.y, progress)
  }
  ctx.fillStyle = colors.red;
  ctx.beginPath();
  ctx.arc(
    cellSize.x * midHead.x + offset.x + cellSize.x / 2,
    cellSize.y * midHead.y + offset.y + cellSize.y / 2,
    cellSize.x * 0.5 * snakeHeadSize, 0, 2 * Math.PI);
  ctx.fill();


  //tail 
  midTail = {
    x: lerp(tail.x, nextTail.x, progress),
    y: lerp(tail.y, nextTail.y, progress)
  }
  ctx.fillStyle = colors.red;
  ctx.beginPath();
  ctx.arc(
    cellSize.x * midTail.x + offset.x + cellSize.x / 2,
    cellSize.y * midTail.y + offset.y + cellSize.y / 2,
    cellSize.x * 0.5 * snakeTailSize, 0, 2 * Math.PI);
  ctx.fill();
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
const fakeNextInstance = { snake: [{ x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 },] }

let start = Date.now();
const renderLoop = () => {
  const progressDuration = 1000;
  const progress = ((Date.now() - start) % progressDuration) / progressDuration;
  drawInstance(fakeCurrentInstance, fakeNextInstance, progress);
  window.requestAnimationFrame(renderLoop);

}
renderLoop();