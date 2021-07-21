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

const gameDimentions = { x: 16, y: 16 };
lerp = (start, end, factor) => {
  return start + (end - start) * factor;
}
function scaleAndTranslatePath(path, box) {

}
const appleImg = new Image();   // Create new img element

function drawAnApple({ x, y }, scale) {

  const finalScale = snakeHeadSize * 0.9 * scale;
  var offset = (1 - finalScale) / 2;
  var box = transform({ x: x + offset, y: y + offset, width: finalScale, height: finalScale });
  ctx.drawImage(appleImg, box.x, box.y, box.width, box.height);
}
function dir(cur, next) {

  if (typeof cur === "string") {
    this.number = 0;
    this.name = cur;
    switch (cur) {
      case "up":
        this.x = 0;
        this.y = -1;
        this.angle = 1.5 * Math.PI;
        this.number = 0;
        break;
      case "down":
        this.x = 0;
        this.y = 1;
        this.angle = 0.5 * Math.PI;
        this.number = 1;
        break;
      case "left":
        this.x = -1;
        this.y = 0;
        this.angle = Math.PI;
        this.number = 2;
        break;
      case "right":
        this.x = 1;
        this.y = 0;
        this.angle = 0;
        this.number = 3;
        break;
    }
  } else {
    this.x = next.x - cur.x;
    this.y = next.y - cur.y;
    switch (10 * this.x + this.y) {
      case -1:
        this.angle = 1.5 * Math.PI;
        this.number = 0;
        this.name = "up";
        break;
      case 1:
        this.angle = 0.5 * Math.PI;
        this.number = 1;
        this.name = "down";
        break;
      case -10:
        this.angle = Math.PI;
        this.number = 2;
        this.name = "left";
        break;
      case 10:
      default:
        this.angle = 0;
        this.number = 3;
        this.name = "right";
        break;
    }
  }

  this.equals = (k) => {
    return k != null && k.number === this.number
  }
  this.add = ({ x, y }) => {
    return { x: this.x + x, y: this.y + y };
  }
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
function splitBezierCurve(t, { s, c1, c2, e }, firstHalf = true) {
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
function drawCornerControls(corner) {
  for (key in corner) {
    if (key.includes("R")) {
      ctx.fillStyle = colors.red;
    } else {
      ctx.fillStyle = colors.blue;

    }
    if (typeof corner[key] == "object" && "x" in corner[key]) {
      ctx.fillRect(corner[key].x, corner[key].y, 3, 3);
    }

  }
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
drawCorner = (cell, progress, snakeLenght, hitApple) => {
  //if this curve includes the tail 
  const rightHand = cell.preDir.x == cell.dir.y && -cell.preDir.y == cell.dir.x

  const startRightHand = rightHand ? cell.dir : { x: -cell.dir.x, y: -cell.dir.y }
  const endRightHand = rightHand ? { x: -cell.preDir.x, y: -cell.preDir.y } : cell.preDir


  let startSize, endSize;
  if (hitApple) {
    //progress the snake lenght 
    startSize = lerp(snakeTailSize, snakeHeadSize, (cell.order - 0.5) / (snakeLenght + progress - 1));
    endSize = lerp(snakeTailSize, snakeHeadSize, (cell.order + 0.5) / (snakeLenght + progress - 1));
  } else {
    //ofset the where in the snake this is.
    startSize = lerp(snakeTailSize, snakeHeadSize, (cell.order - 0.5 - progress) / (snakeLenght - 1));
    endSize = lerp(snakeTailSize, snakeHeadSize, (cell.order + 0.5 - progress) / (snakeLenght - 1));
  }



  const strength = 0.5
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

  const startRInnerCornerDistance = rightHand ? (0.5 - startSize / 2) * strength : (0.5 + startSize / 2) * strength
  const endRInnerCornerDistance = rightHand ? (0.5 - endSize / 2) * strength : (0.5 + endSize / 2) * strength
  const startLInnerCornerDistance = rightHand ? (0.5 + startSize / 2) * strength : (0.5 - startSize / 2) * strength
  const endLInnerCornerDistance = rightHand ? (0.5 + endSize / 2) * strength : (0.5 - endSize / 2) * strength

  //calculate control points 
  const endPosR = {
    x: endPos.x + endRightHand.x * endSize / 2,
    y: endPos.y + endRightHand.y * endSize / 2
  }


  const endPosRGuide = {
    x: endPosR.x - cell.dir.x * startRInnerCornerDistance,
    y: endPosR.y - cell.dir.y * startRInnerCornerDistance
  }
  const startPosR = {
    x: startPos.x + startRightHand.x * startSize / 2,
    y: startPos.y + startRightHand.y * startSize / 2
  }
  const startPosRGuide = {
    x: startPosR.x + cell.preDir.x * endRInnerCornerDistance,
    y: startPosR.y + cell.preDir.y * endRInnerCornerDistance
  }


  const endPosL = {
    x: endPos.x - endRightHand.x * endSize / 2,
    y: endPos.y - endRightHand.y * endSize / 2
  }
  const endPosLGuide = {
    x: endPosL.x - cell.dir.x * startLInnerCornerDistance,
    y: endPosL.y - cell.dir.y * startLInnerCornerDistance
  }
  const startPosL = {
    x: startPos.x - startRightHand.x * startSize / 2,
    y: startPos.y - startRightHand.y * startSize / 2
  }
  const startPosLGuide = {
    x: startPosL.x + cell.preDir.x * endLInnerCornerDistance,
    y: startPosL.y + cell.preDir.y * endLInnerCornerDistance
  }


  endPosRT = transform(endPosR);
  endPosRGuideT = transform(endPosRGuide);
  startPosRT = transform(startPosR);
  startPosRGuideT = transform(startPosRGuide);
  endPosLT = transform(endPosL);
  endPosLGuideT = transform(endPosLGuide);
  startPosLT = transform(startPosL);
  startPosLGuideT = transform(startPosLGuide);
  //translate the control Points

  fullCurveR = { s: startPosRT, c1: startPosRGuideT, c2: endPosRGuideT, e: endPosRT };
  fullCurveL = { s: startPosLT, c1: startPosLGuideT, c2: endPosLGuideT, e: endPosLT };

  drawCornerControls({
    endPosRT, endPosRGuideT, startPosRT, startPosRGuideT, endPosLT, endPosLGuideT, startPosLT, startPosLGuideT
  });

  drawBezerCurve = (curve, line = false, reverse = false) => {
    if (reverse) {
      curve = { s: curve.e, c1: curve.c2, c2: curve.c1, e: curve.s }
    }
    if (line) {
      ctx.lineTo(curve.s.x, curve.s.y);
    } else {
      ctx.moveTo(curve.s.x, curve.s.y);
    }
    ctx.bezierCurveTo(
      curve.c1.x, curve.c1.y,
      curve.c2.x, curve.c2.y,
      curve.e.x, curve.e.y);
  }
  if (cell.order == 1 && progress >= 0.5 && !hitApple || cell.order == 0 && (progress <= 0.5 || hitApple)) {
    //tail rendering 

    //the tail will never leave the corner 0 if it has eaten an apple 
    //the tail will never enter the corner 1 if it has eaten an apple 

    const cellProgress = cell.order == 1 ? progress - 0.5 : (hitApple ? 0.5 : progress + 0.5);
    // keep the tail still if the tail is within the curve and it has hit the apple 
    curveR = splitBezierCurve(cellProgress, fullCurveR, false);
    curveL = splitBezierCurve(cellProgress, fullCurveL, false);
    drawBezierControls(curveL);
    drawBezierControls(curveR);

    ctx.beginPath();
    drawBezerCurve(curveR);
    drawBezerCurve(curveL, true, true);//the way back
    //draw the endcap
    drawEndCap(curveL.s, curveR.s);
    ctx.fill();
  } else if (cell.order == 0 && progress >= 0.5) {
    //tail rendering when it has left 
    //it has left the square so dont draw anything 
  } else if (cell.order == snakeLenght - 1 && progress <= 0.5) {
    //head rendering 
    curveR = splitBezierCurve(progress + 0.5, fullCurveR, true);
    curveL = splitBezierCurve(progress + 0.5, fullCurveL, true);
    drawBezierControls(curveL);
    drawBezierControls(curveR);
    ctx.beginPath();
    drawBezerCurve(curveR);
    drawEndCap(curveR.e, curveL.e);
    drawBezerCurve(curveL, true, true);
    ctx.fill();
  } else {
    drawBezierControls(fullCurveR);
    drawBezierControls(fullCurveL);

    ctx.beginPath();
    drawBezerCurve(fullCurveR);
    drawBezerCurve(fullCurveL, true, true);
    ctx.fill();

  }

  return { startPosLT, startPosRT, endPosLT, endPosRT, order: cell.order };


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
const snakeHeadSize = 0.7;

drawInstance = (lastTail, { snake, appleLocation, newApple }, nextHead, progress) => {

  hitApple = nextHead.x == appleLocation.x && nextHead.y == appleLocation.y;
  //draw grid
  for (var x = 0; x < gameDimentions.x; x++) {
    for (var y = 0; y < gameDimentions.y; y++) {
      switch ((x + y) % 2) {
        case 0:
          ctx.fillStyle = colors.white;
          break;
        case 1:
          ctx.fillStyle = colors.white;
          break;
      }
      const box = transform({ x, y, width: 1, height: 1 });
      ctx.fillRect(box.x, box.y, box.width, box.height);
    }
  }

  //draw the apple
  drawAnApple(appleLocation, hitApple ? 1 - progress : (newApple ? progress : 1));

  //draw a ciricle for each of the pars of the snake 

  //add moving head and tail
  const tail = snake[0];
  const head = snake[snake.length - 1];
  const corners = computeDirections(lastTail, snake, nextHead);


  ctx.fillStyle = colors.green;




  // corners 
  let lastCorner = null
  let firstCorner = null; //first corner that is between two ends 
  corners.forEach(corner => {

    const thisCorner = drawCorner(corner, progress, snake.length, hitApple);
    if (firstCorner == null && thisCorner.order !== 0) {
      firstCorner = thisCorner;
    }
    if (lastCorner != null && thisCorner.order > lastCorner.order + 1 && (lastCorner.order !== 0 || progress <= 0.5 || hitApple)) {
      //connect the sreight gaps between corners. 
      // except when the last corner is acctually a tail that has left its curve 
      ctx.beginPath();
      ctx.moveTo(lastCorner.endPosLT.x, lastCorner.endPosLT.y);
      ctx.lineTo(thisCorner.startPosLT.x, thisCorner.startPosLT.y);
      ctx.lineTo(thisCorner.startPosRT.x, thisCorner.startPosRT.y);
      ctx.lineTo(lastCorner.endPosRT.x, lastCorner.endPosRT.y);
      ctx.fill();
    }
    lastCorner = thisCorner;
  })
  if (firstCorner == null) {
    //no corners so make a fake corner 
    size = lerp(snakeTailSize, snakeHeadSize, (1.5 - progress) / (snake.length - 1)) / 2;
    const mid = {
      x: snake[0].dir.x * 1.5 + snake[0].x + 0.5,
      y: snake[0].dir.y * 1.5 + snake[0].y + 0.5
    }

    firstCorner = {
      startPosLT: transform({
        x: mid.x + snake[0].dir.y * size,
        y: mid.y - snake[0].dir.x * size
      }),
      startPosRT: transform({
        x: mid.x - snake[0].dir.y * size,
        y: mid.y + snake[0].dir.x * size
      })
    }
    if (lastCorner != null && (progress <= 0.5 || hitApple)) {
      //there was a fake tail corner that is still being drawm
      ctx.beginPath();
      ctx.moveTo(lastCorner.endPosLT.x, lastCorner.endPosLT.y);
      ctx.lineTo(firstCorner.startPosLT.x, firstCorner.startPosLT.y);
      ctx.lineTo(firstCorner.startPosRT.x, firstCorner.startPosRT.y);
      ctx.lineTo(lastCorner.endPosRT.x, lastCorner.endPosRT.y);
      ctx.fill();
    }
    lastCorner = { endPosLT: firstCorner.startPosLT, endPosRT: firstCorner.startPosRT };
  }

  //tail
  if ((progress <= 0.5 || hitApple) && !snake[0].corner || (progress >= 0.5 && !snake[1].corner && !hitApple)) {
    // draw the end when it is in a square and has hit an
    //if hit apple the tail doesnt move
    let boxLocation = null
    if (hitApple) {
      boxLocation = {
        x: tail.x + 0.5,
        y: tail.y + 0.5,
        width: 0.5 * snakeTailSize,
      }
    } else {
      boxLocation = {
        x: (tail.x + tail.dir.x * progress) + 0.5,
        y: (tail.y + tail.dir.y * progress) + 0.5,
        width: 0.5 * snakeTailSize,
      }
    }
    const box = transform(boxLocation);

    ctx.beginPath();
    ctx.moveTo(firstCorner.startPosRT.x, firstCorner.startPosRT.y);
    ctx.lineTo(
      box.x + Math.cos(tail.dir.angle + Math.PI / 2) * box.width,
      box.y + Math.sin(tail.dir.angle + Math.PI / 2) * box.width
    )
    ctx.arc(
      box.x,
      box.y,
      box.width,
      tail.dir.angle + Math.PI / 2,
      tail.dir.angle - Math.PI / 2);
    ctx.lineTo(firstCorner.startPosLT.x, firstCorner.startPosLT.y);
    ctx.fill();
  }




  if (progress >= 0.5 || progress <= 0.5 && !snake[snake.length - 1].corner) {
    //head 
    ctx.beginPath();
    box = transform({
      x: (head.x + head.dir.x * progress) + 0.5,
      y: (head.y + head.dir.y * progress) + 0.5,
      width: 0.5 * snakeHeadSize,
    });
    ctx.moveTo(lastCorner.endPosLT.x, lastCorner.endPosLT.y);
    ctx.lineTo(
      box.x + Math.cos(head.dir.angle - Math.PI / 2) * box.width,
      box.y + Math.sin(head.dir.angle - Math.PI / 2) * box.width
    )
    ctx.arc(
      box.x,
      box.y,
      box.width,
      head.dir.angle - Math.PI / 2,
      head.dir.angle + Math.PI / 2);
    ctx.lineTo(lastCorner.endPosRT.x, lastCorner.endPosRT.y);
    ctx.fill();
  }
  if ("controlGrid" in game) {
    drawControlGrid(game.controlGrid);
  }
  if ("connectedQuads" in game) {
    drawConnectedQuads(game.connectedQuads);
  }
  if ("snakeSquares" in game) {
    drawSnakeSquares(game.snakeSquares);
  }
  snake.forEach(part => {
    ctx.fillStyle = colors.red;
    ctx.beginPath();
    ctx.arc(
      cellSize.x * (part.x + part.dir.x * progress) + offset.x + cellSize.x / 2,
      cellSize.y * (part.y + part.dir.y * progress) + offset.x + offset.y + cellSize.y / 2,
      cellSize.x * 0.5 * 0.3,
      part.dir.angle - Math.PI / 2,
      part.dir.angle + Math.PI / 2);
    ctx.fill();
  });
}
drawSnakeSquares = (snakeSquares) => {
  const width = game.dimentions.x / 2;
  toCooridnates = n => {
    return transform({ x: (n % width) * 2 + 1, y: Math.floor(n / width) * 2 + 1, width: 0.2 });
  }


  ctx.fillStyle = colors.black;
  for (square of snakeSquares.values()) {
    const thisSquare = toCooridnates(square);
    ctx.beginPath();
    ctx.arc(thisSquare.x, thisSquare.y, thisSquare.width, 0, 2 * Math.PI);
    ctx.fill();

  }
}
drawConnectedQuads = (connectedQuads) => {
  const width = game.dimentions.x / 2;
  toCooridnates = n => {
    return transform({ x: (n % width) * 2 + 1, y: Math.floor(n / width) * 2 + 1 });
  }

  ctx.beginPath();
  for ([cell, next] of connectedQuads.entries()) {
    home = toCooridnates(cell);
    for (end of next.values()) {
      endL = toCooridnates(end);
      ctx.moveTo(home.x, home.y);
      ctx.lineTo(endL.x, endL.y);
    }
  }
  for (let n = 0; n < (gameDimentions.x * gameDimentions.y / 4); n++) {
    const loc = toCooridnates(n)
    ctx.fillText(n, loc.x, loc.y);
  }
  ctx.strokeStyle = colors.orange;
  ctx.stroke();
}
drawControlGrid = (controlGrid) => {
  progress = 0;

  for (let x = 0; x < game.dimentions.x; x++) {
    for (let y = 0; y < game.dimentions.y; y++) {
      ctx.fillStyle = colors.red;
      ctx.beginPath();
      box = transform({ x: x + 0.5, y: y + 0.5, width: 0.5 * 0.3, height: 0.5 * 0.3 });
      ctx.arc(
        box.x,
        box.y,
        box.width,
        controlGrid[x][y].angle - Math.PI / 2,
        controlGrid[x][y].angle + Math.PI / 2);
      ctx.fill();
    }
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

function createNewApple() {
  do {
    currentInstance.appleLocation = {
      x: Math.round(Math.random() * (gameDimentions.x - 1)),
      y: Math.round(Math.random() * (gameDimentions.y - 1))
    };
  } while (currentInstance.snake.some(({ x, y }) => x == currentInstance.appleLocation.x && y == currentInstance.appleLocation.y));
  currentInstance.newApple = true;
  appleListners.forEach(l => { l(currentInstance.appleLocation, currentInstance.snake); });
}



const gameCenter = {
  x: Math.floor(gameDimentions.x / 2),
  y: Math.floor(gameDimentions.y / 2)
}

let appleListners = [];
let moveListners = [];
let previousTail, currentInstance, nextHead;

const game = {
  addNewAppleListner: (listner) => {
    appleListners.push(listner);
  },
  getCurrentAppleLocation: () => {
    return currentInstance.appleLocation;
  },
  getCurrentSnake: () => {
    return currentInstance.snake;
  },
  reset: () => {
    previousTail = { x: gameCenter.x - 2, y: gameCenter.y };
    currentInstance = { snake: [{ x: gameCenter.x - 1, y: gameCenter.y }, gameCenter, { x: gameCenter.x + 1, y: gameCenter.y }], appleLocation: null, newApple: false }
    nextHead = { x: gameCenter.x + 2, y: gameCenter.y };
    mainDirection = new dir("right");
    createNewApple();
  },
  addNewMoveListner: (listner) => {
    moveListners.push(listner);
  },
  setDirection: (dir) => {
    headDir = currentInstance.snake[currentInstance.snake.length - 2].dir;
    if (-dir.x !== headDir.x || -dir.y !== headDir.y) {
      //if the asked direction is not oppsite to the main direction ie no 180 turns.
      mainDirection = dir;
    }
  },
  getDirection: () => {
    return mainDirection;
  },
  dimentions: gameDimentions
}




let nextSteps = [];

let start = Date.now();
let lastStep = 0;

let goingTohitApple = false;

let mainDirection = new dir("right");
const isOutOfBounds = ({ x, y }) => x < 0 || y < 0 || y >= gameDimentions.y || x >= gameDimentions.x;

const renderLoop = () => {
  const progressDuration = 500;
  const progress = ((Date.now() - start) % progressDuration) / progressDuration;
  const step = Math.floor((Date.now() - start) / progressDuration)
  if (step != lastStep) {
    //we have made a step
    //make a step if there is one to make;
    lastStep = step;

    currentInstance.newApple = false;

    currentInstance.snake.push(nextHead);
    const oldHead = currentInstance.snake[currentInstance.snake.length - 1];
    if (!(oldHead.x == currentInstance.appleLocation.x && oldHead.y == currentInstance.appleLocation.y)) {
      previousTail = currentInstance.snake.shift();
    } else {
      //apple has been hit
      createNewApple();
    }

    moveListners.forEach(l => { l(currentInstance.snake); });
    const mov = mainDirection;

    nextHead = {
      x: oldHead.x + mov.x,
      y: oldHead.y + mov.y
    }

    if (isOutOfBounds(nextHead) || currentInstance.snake.some(cur => cur.x == nextHead.x && cur.y == nextHead.y)) {
      game.reset();
    }

  }
  drawInstance(previousTail, currentInstance, nextHead, progress);
  window.requestAnimationFrame(renderLoop);
}


window.addEventListener('load', () => {
  game.reset();//set everything up before rendering 
  // once everything has loaded start rendering
  appleImg.src = './apple.svg'; // Set source path
  appleImg.addEventListener('load', renderLoop, false);

});



document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowLeft":
    case "a":
      game.setDirection(new dir("left"));
      break;
    case "ArrowUp":
    case "w":
      game.setDirection(new dir("up"));
      break;
    case "ArrowDown":
    case "s":
      game.setDirection(new dir("down"));
      break;
    case "ArrowRight":
    case "d":
      game.setDirection(new dir("right"));
      break;
  }
});