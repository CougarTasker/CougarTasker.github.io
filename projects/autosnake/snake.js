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
//http://www.independent-software.com/determining-coordinates-on-a-html-canvas-bezier-curve.html

function getBezierXY(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
  return {
    x: Math.pow(1 - t, 3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x
      + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
    y: Math.pow(1 - t, 3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y
      + 3 * t * t * (1 - t) * cp2y + t * t * t * ey
  };
}

drawCorner = (cell, progress, snakeLenght) => {
  //if this curve includes the tail 




  startSize = lerp(snakeTailSize, snakeHeadSize, (cell.order - 0.5 - progress) / snakeLenght),
    endSize = lerp(snakeTailSize, snakeHeadSize, (cell.order + 0.5 - progress) / snakeLenght)
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



  ctx.save();
  if (cell.order == 1 && progress >= 0.5) {
    ctx.beginPath();
    const cutofR = getBezierXY(
      progress - 0.5,
      startPosR.x, startPosR.y,
      startPosRGuide.x, startPosRGuide.y,
      endPosRGuide.x, endPosRGuide.y,
      endPosR.x, endPosR.y)
    const cutofL = getBezierXY(
      progress - 0.5,
      startPosL.x, startPosL.y,
      startPosLGuide.x, startPosLGuide.y,
      endPosLGuide.x, endPosLGuide.y,
      endPosL.x, endPosL.y)
    const endPosCellL = transform({
      x: endPos.x + cell.preDir.x / 2,
      y: endPos.y + cell.preDir.y / 2
    });
    const startPosCellR = transform({
      x: startPos.x + cell.dir.x / 2,
      y: startPos.y + cell.dir.y / 2
    });
    const corner = transform({
      x: center.x - cell.dir.x / 2 + cell.preDir.x / 2,
      y: startPos.y - cell.dir.y / 2 + cell.preDir.y / 2
    });

    ctx.moveTo(cutofR.x, cutofR.y);
    ctx.lineTo(cutofL.x, cutofL.y);
    ctx.lineTo(corner.x, corner.y);
    ctx.lineTo(endPosCellL.x, endPosCellL.y);
    ctx.lineTo(startPosCellR.x, startPosCellR.y);
    ctx.clip();
  }
  ctx.beginPath();
  ctx.moveTo(endPosR.x, endPosR.y);
  ctx.bezierCurveTo(
    endPosRGuide.x, endPosRGuide.y,
    startPosRGuide.x, startPosRGuide.y,
    startPosR.x, startPosR.y);
  ctx.lineTo(startPosL.x, startPosL.y);
  ctx.bezierCurveTo(
    startPosLGuide.x, startPosLGuide.y,
    endPosLGuide.x, endPosLGuide.y,
    endPosL.x, endPosL.y);
  ctx.fill();
  ctx.restore();
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
const snakeTailSize = 0.4;
const snakeHeadSize = 0.8;

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

  ctx.fillStyle = colors.green;
  //tail
  ctx.beginPath();
  const box = transform({
    x: (tail.x + tail.dir.x * progress) + 0.5,
    y: (tail.y + tail.dir.y * progress) + 0.5,
    width: 0.5 * snakeTailSize,
  })
  ctx.arc(
    box.x,
    box.y,
    box.width,
    tail.dir.angle + Math.PI / 2,
    tail.dir.angle - Math.PI / 2);
  ctx.fill();

  corners.forEach(corner => {
    drawCorner(corner, progress, snake.length);
  })


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

const fakeCurrentInstance = { snake: [{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 5, y: 2 }] }
const fakeNextInstance = { snake: [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }] }

let start = Date.now();
const renderLoop = () => {
  const progressDuration = 1000;
  const progress = ((Date.now() - start) % progressDuration) / progressDuration;
  drawInstance(fakeCurrentInstance, fakeNextInstance, progress);
  window.requestAnimationFrame(renderLoop);

}
renderLoop();