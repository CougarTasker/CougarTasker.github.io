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
computeDirections = (lastTail, snake, nextHead) => {
  previous = new dir(lastTail, snake[0]);
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

lerpVec = (s, e, t) => {
  return { x: lerp(s.x, e.x, t), y: lerp(s.y, e.y, t) }
}
function splitBezierCurve(t, s, c1, c2, e, firstHalf = true) {
  const m = [lerpVec(s, c1, t), lerpVec(c1, c2, t), lerpVec(c2, e, t)]
  const q = [lerpVec(m[0], m[1], t), lerpVec(m[1], m[2], t)]
  const b = lerpVec(q[0], q[1], t);
  if (firstHalf) {
    return { s: s, c1: m[0], c2: q[0], e: b }
  } else {
    return { s: b, c1: q[1], c2: m[2], e: e }
  }
}
function drawBezierControls({ s, c1, c2, e }) {
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  ctx.lineTo(c1.x, c1.y);
  ctx.lineTo(c2.x, c2.y);
  ctx.lineTo(e.x, e.y);
  ctx.strokeStyle = colors.orange;
  ctx.stroke();
}
drawEndCap = (start, end, clockwize = true) => {
  const rToL = {
    x: end.x - start.x,
    y: end.y - start.y
  }

  angle = rToL.x === 0 ?
    (clockwize ? 0 : Math.PI) :
    (rToL.x < 0 ? (Math.atan(rToL.y / rToL.x) + Math.PI / 2) :
      (Math.atan(rToL.y / rToL.x) - Math.PI / 2));
  const capCenter = {
    x: start.x + rToL.x / 2,
    y: start.y + rToL.y / 2,
  }
  const capR = Math.sqrt(Math.pow(rToL.x, 2) + Math.pow(rToL.y, 2)) / 2
  ctx.arc(
    capCenter.x, capCenter.y,
    capR,
    angle - Math.PI / 2,
    angle + Math.PI / 2,
    clockwize
  )
}
drawCorner = (cell, progress, snakeLenght) => {
  //if this curve includes the tail 
  const rightHand = cell.preDir.x == -cell.dir.y && cell.preDir.y == cell.dir.x

  startSize = lerp(snakeTailSize, snakeHeadSize, (cell.order - 0.5 - progress) / (snakeLenght - 1)),
    endSize = lerp(snakeTailSize, snakeHeadSize, (cell.order + 0.5 - progress) / (snakeLenght - 1))


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



  if (cell.order == 1 && progress >= 0.5) {

    curveR = splitBezierCurve(progress - 0.5, startPosR, startPosRGuide, endPosRGuide, endPosR, false);
    curveL = splitBezierCurve(progress - 0.5, startPosL, startPosLGuide, endPosLGuide, endPosL, false);


    ctx.beginPath();
    ctx.moveTo(curveR.s.x, curveR.s.y);
    ctx.bezierCurveTo(
      curveR.c1.x, curveR.c1.y,
      curveR.c2.x, curveR.c2.y,
      curveR.e.x, curveR.e.y);

    ctx.lineTo(curveL.e.x, curveL.e.y);
    ctx.bezierCurveTo(
      curveL.c2.x, curveL.c2.y,
      curveL.c1.x, curveL.c1.y,
      curveL.s.x, curveL.s.y)
    //draw the endcap
    drawEndCap(curveL.s, curveR.s, !rightHand);
    ctx.fill();
  } else if (cell.order == snakeLenght - 1 && progress <= 0.5) {
    curveR = splitBezierCurve(progress + 0.5, startPosR, startPosRGuide, endPosRGuide, endPosR, true);
    curveL = splitBezierCurve(progress + 0.5, startPosL, startPosLGuide, endPosLGuide, endPosL, true);
    drawBezierControls(curveL);

    ctx.beginPath();
    ctx.moveTo(curveR.s.x, curveR.s.y);
    ctx.bezierCurveTo(
      curveR.c1.x, curveR.c1.y,
      curveR.c2.x, curveR.c2.y,
      curveR.e.x, curveR.e.y);

    drawEndCap(curveR.e, curveL.e, !rightHand);
    ctx.bezierCurveTo(
      curveL.c2.x, curveL.c2.y,
      curveL.c1.x, curveL.c1.y,
      curveL.s.x, curveL.s.y);
    ctx.lineTo(curveR.s.x, curveR.s.y);
    ctx.fill();
  } else {
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
  }


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

drawInstance = ({ snake: lastSnake }, { snake }, { snake: nextSnake }, progress) => {

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

  //draw a ciricle for each of the pars of the snake 

  //add moving head and tail
  const tail = snake[0];
  const head = snake[snake.length - 1];
  const nextHead = nextSnake[nextSnake.length - 1];
  const lastTail = lastSnake[0]
  const corners = computeDirections(lastTail, snake, nextHead);


  ctx.fillStyle = colors.green;
  //tail

  if (progress <= 0.5 || !snake[1].corner) {
    ctx.beginPath();
    let box = transform({
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
  }

  // corners 
  corners.forEach(corner => {
    drawCorner(corner, progress, snake.length);
  })

  if (progress >= 0.5 || !snake[snake.length - 2].corner) {
    //head 
    ctx.beginPath();
    box = transform({
      x: (head.x + head.dir.x * progress) + 0.5,
      y: (head.y + head.dir.y * progress) + 0.5,
      width: 0.5 * snakeHeadSize,
    })
    ctx.arc(
      box.x,
      box.y,
      box.width,
      head.dir.angle - Math.PI / 2,
      head.dir.angle + Math.PI / 2);
    ctx.fill();
  }
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

const fakePreviousInstance = {
  snake: [
    { x: 3, y: 0 }, { x: 3, y: 1 },
    { x: 4, y: 1 }, { x: 5, y: 2 },
    { x: 5, y: 3 }, { x: 5, y: 4 },
    { x: 5, y: 5 }, { x: 6, y: 5 }]
}
const fakeCurrentInstance = {
  snake: [
    { x: 3, y: 1 },
    { x: 4, y: 1 }, { x: 5, y: 2 },
    { x: 5, y: 3 }, { x: 5, y: 4 },
    { x: 5, y: 5 }, { x: 6, y: 5 },
    { x: 6, y: 4 }]
}
const fakeNextInstance = {
  snake: [
    { x: 4, y: 1 }, { x: 5, y: 2 },
    { x: 5, y: 3 }, { x: 5, y: 4 },
    { x: 5, y: 5 }, { x: 6, y: 5 },
    { x: 6, y: 4 }, { x: 7, y: 4 }]
}

let start = Date.now();
const renderLoop = () => {
  const progressDuration = 5000;
  const progress = ((Date.now() - start) % progressDuration) / progressDuration;
  drawInstance(fakePreviousInstance,fakeCurrentInstance, fakeNextInstance, progress);
  window.requestAnimationFrame(renderLoop);

}
renderLoop();