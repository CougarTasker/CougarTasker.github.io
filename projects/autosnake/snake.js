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
  switch (10 * this.x + this.y) {
    case -1:
      this.angle = 1.5 * Math.PI;
      break;
    case 1:
      this.angle = 0.5 * Math.PI;
      break;
    case -10:
      this.angle = Math.PI;
      break;
    case 10:
    default:
      this.angle = 0;
      break;
  }
  this.equals = (k) => {
    return k != null && k.x === this.x && k.y === this.y
  }
  this.add
}
computeDirections = (snake, nextHead) => {
  previous = null;
  let i;
  let out = []
  for (i = 0; i < snake.length - 1; i++) {
    snake[i].dir = new dir(snake[i], snake[i + 1]);
    snake[i].preDir = previous;
    snake[i].corner = previous !== null && !snake[i].dir.equals(previous);
    snake[i].order = i;
    if (snake[i].corner) {
      out.push(snake[i])
    }
    previous = snake[i].dir;
  }
  snake[i].dir = new dir(snake[i], nextHead);
  snake[i].preDir = previous;
  snake[i].corner = !snake[i].dir.equals(previous);
  snake[i].order = i;
  if (snake[i].corner) {
    out.push(snake[i])
  }
  return out;
}
drawRightCorner = (cell, startSize, endSize) => {
  const innerStrength = 0.5;
  const outerStrength = 0.5;
  const center = {
    x: cell.x + 0.5,
    y: cell.y + 0.5
  }
  const startPos = {
    x: center.x - cell.preDir.x / 2,
    y: center.y - cell.preDir.y / 2
  }
  const endPos = {
    x: center.x + cell.dir.x / 2,
    y: center.y + cell.dir.y / 2
  }

  const centerT = transform(center);
  const startPosT = transform(startPos);
  const endPosT = transform(endPos);


  //draw the inner bit 
  // endpos right to start pos right 
  const endPosR = transform({
    x: endPos.x - cell.preDir.x * endSize / 2,
    y: endPos.y - cell.preDir.y * endSize / 2
  });
  const endPosRGuide = transform({
    x: endPos.x - cell.preDir.x * endSize / 2 - cell.dir.x * (0.5 - startSize / 2) * innerStrength,
    y: endPos.y - cell.preDir.y * endSize / 2 - cell.dir.y * (0.5 - startSize / 2) * innerStrength
  });
  const startPosR = transform({
    x: startPos.x + cell.dir.x * startSize / 2,
    y: startPos.y + cell.dir.y * startSize / 2
  })
  const startPosRGuide = transform({
    x: startPos.x + cell.dir.x * startSize / 2 + cell.preDir.x * (0.5 - endSize / 2) * innerStrength,
    y: startPos.y + cell.dir.y * startSize / 2 + cell.preDir.y * (0.5 - endSize / 2) * innerStrength
  })

  ctx.beginPath();
  ctx.moveTo(endPosR.x, endPosR.y);
  ctx.bezierCurveTo(
    endPosRGuide.x, endPosRGuide.y,
    startPosRGuide.x, startPosRGuide.y,
    startPosR.x, startPosR.y);

  //create the outer side
    //start posL to end posL


  const endPosL = transform({
    x: endPos.x + cell.preDir.x * endSize / 2,
    y: endPos.y + cell.preDir.y * endSize / 2
  });
  const endPosLGuide = transform({
    x: endPos.x + cell.preDir.x * endSize / 2 - cell.dir.x * (0.5 + startSize / 2) * outerStrength,
    y: endPos.y + cell.preDir.y * endSize / 2 - cell.dir.y * (0.5 + startSize / 2) * outerStrength
  });
  const startPosL = transform({
    x: startPos.x - cell.dir.x * startSize / 2,
    y: startPos.y - cell.dir.y * startSize / 2
  })
  const startPosLGuide = transform({
    x: startPos.x - cell.dir.x * startSize / 2 + cell.preDir.x * (0.5 + endSize / 2) * outerStrength,
    y: startPos.y - cell.dir.y * startSize / 2 + cell.preDir.y * (0.5 + endSize / 2) * outerStrength
  })


  ctx.lineTo(startPosL.x, startPosL.y);
  ctx.bezierCurveTo(
    startPosLGuide.x, startPosLGuide.y,
    endPosLGuide.x, endPosLGuide.y,
    endPosL.x, endPosL.y);
  ctx.fill();

}

drawCorner = (cell, startSize, endSize) => {
  drawRightCorner(cell, startSize, endSize);
}
// i am going to create a grid cordinates to canvas coridnates function 
const transform = ({ x: xin, y: yin, width: widthin, height: heightin }) => {
  offset = {
    x: Math.floor(canvas.width % gameDimentions.x / 2),
    y: Math.floor(canvas.width % gameDimentions.x / 2),
  }
  cellSize = {
    x: Math.floor(canvas.width / gameDimentions.x),
    y: Math.floor(canvas.height / gameDimentions.y)
  }
  return {
    x: cellSize.x * xin + offset.x,
    y: cellSize.y * yin + offset.y,
    width: cellSize.x * (widthin ?? 0),
    height: cellSize.y * (heightin ?? 0)
  }
}
drawInstance = ({ snake }, { snake: nextSnake }, progress) => {

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
      const box = transform({ x, y, width: 1, height: 1 });
      ctx.fillRect(box.x, box.y, box.width, box.height);
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
  const corners = computeDirections(snake, nextHead);

  snake.forEach(part => {
    ctx.fillStyle = colors.red;
    ctx.beginPath();
    const box = transform({
      x: (part.x + part.dir.x * progress) + 0.5,
      y: (part.y + part.dir.y * progress) + 0.5,
      width: 0.5 * size,
    })
    ctx.arc(
      box.x,
      box.y,
      box.width,
      part.dir.angle - Math.PI / 2,
      part.dir.angle + Math.PI / 2);
    ctx.fill();
    size += snakeStepSize;
  });


  drawCorner(corners[0],
    lerp(snakeTailSize, snakeHeadSize, (corners[0].order - 0.5 - progress) / snake.length),
    lerp(snakeTailSize, snakeHeadSize, (corners[0].order + 0.5 - progress) / snake.length)
  )

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

const fakeCurrentInstance = { snake: [{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }] }
const fakeNextInstance = { snake: [{ x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 2 }] }

let start = Date.now();
const renderLoop = () => {
  const progressDuration = 1000;
  const progress = ((Date.now() - start) % progressDuration) / progressDuration;
  drawInstance(fakeCurrentInstance, fakeNextInstance, progress);
  window.requestAnimationFrame(renderLoop);

}
renderLoop();