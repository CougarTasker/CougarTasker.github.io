const canvas = document.querySelector("#game canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.querySelector("#game .canvas-container");

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

let options = {
  graphicsDebug: false,
  aiDebug: false,
  aiEnabled: true
}
const gameDimentions = { x: 16, y: 16 };
lerp = (start, end, factor) => {
  return start + (end - start) * factor;
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

function vectorAngle({ x, y }) {
  if (x == 0) {
    if (y < 0) {
      return Math.PI * 3 / 2;
    } else {
      return Math.PI / 2;
    }
  } else if (y == 0) {
    if (x > 0) {
      return 0
    } else {
      return Math.PI;
    }
  } else {
    const tanAngle = Math.atan(y / x);
    if (x > 0) {
      return (tanAngle + Math.PI * 2) % (Math.PI * 2);
    } else {
      return (tanAngle + Math.PI * 3) % (Math.PI * 2);
    }
  }
}
function drawEndCap(right, left) {
  const ltoR = {
    x: right.x - left.x,
    y: right.y - left.y
  }

  angle = vectorAngle(ltoR);
  const capCenter = {
    x: left.x + ltoR.x / 2,
    y: left.y + ltoR.y / 2,
  }
  const capR = Math.sqrt(Math.pow(ltoR.x, 2) + Math.pow(ltoR.y, 2)) / 2
  ctx.arc(
    capCenter.x, capCenter.y,
    capR,
    angle,
    angle + Math.PI,
    false
  )
}
function drawBezerCurve(curve, howToStart, reverse = false) {
  if (reverse) {
    curve = { s: curve.e, c1: curve.c2, c2: curve.c1, e: curve.s }
  }
  switch (howToStart) {
    case "move":
      ctx.moveTo(curve.s.x, curve.s.y);
      break;
    case "line":
      ctx.lineTo(curve.s.x, curve.s.y);
      break;
    case "none":
    default:
      break;
  }
  ctx.bezierCurveTo(
    curve.c1.x, curve.c1.y,
    curve.c2.x, curve.c2.y,
    curve.e.x, curve.e.y);
}
drawCorner = (cell, progress, snakeLenght, hitApple, debug = false) => {
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

  if (debug) {
    drawCornerControls({
      endPosRT, endPosRGuideT, startPosRT, startPosRGuideT, endPosLT, endPosLGuideT, startPosLT, startPosLGuideT
    });
  }


  if (cell.order == 1 && progress > 0.5 && !hitApple || cell.order == 0 && (progress <= 0.5 || hitApple)) {
    //tail rendering 

    //the tail will never leave the corner 0 if it has eaten an apple 
    //the tail will never enter the corner 1 if it has eaten an apple 

    const cellProgress = cell.order == 1 ? progress - 0.5 : (hitApple ? 0.5 : progress + 0.5);
    // keep the tail still if the tail is within the curve and it has hit the apple 
    curveR = splitBezierCurve(cellProgress, fullCurveR, false);
    curveL = splitBezierCurve(cellProgress, fullCurveL, false);
    if (debug) {
      drawBezierControls(curveL);
      drawBezierControls(curveR);
    }




    //draw the endcap

    return {
      draw: () => {
        drawBezerCurve(curveR, "move", true);
        drawEndCap(curveR.s, curveL.s);
        drawBezerCurve(curveL, "none", false);//the way back
      },
      endPosLT,
      endPosRT,
      order: cell.order
    }
  } else if (cell.order == 0 && progress >= 0.5) {
    //tail rendering when it has left 
    //it has left the square so dont draw anything 
    return { order: cell.order };
  } else if (cell.order == snakeLenght - 1 && progress <= 0.5) {
    //head rendering 
    curveR = splitBezierCurve(progress + 0.5, fullCurveR, true);
    curveL = splitBezierCurve(progress + 0.5, fullCurveL, true);
    if (debug) {
      drawBezierControls(curveL);
      drawBezierControls(curveR);
    }






    return {
      draw: () => {
        drawBezerCurve(curveL, "none", false);
        drawEndCap(curveL.e, curveR.e);
        drawBezerCurve(curveR, "none", true);
      },
      startPosLT,
      startPosRT,
      order: cell.order
    }
  } else {

    if (debug) {
      drawBezierControls(fullCurveR);
      drawBezierControls(fullCurveL);
    }

    //normal 
    return {
      fullCurveL,
      fullCurveR
    };
  }




}

function drawStraightHead(cell, progress, snakeLenght, hitApple, debug = false) {
  let startSize;
  if (hitApple) {

    //ofset the where in the snake this is.
    const offset = progress >= 0.5 ? 0.5 : -0.5;
    //progress the snake lenght 
    startSize = lerp(snakeTailSize, snakeHeadSize, (cell.order + offset) / (snakeLenght + progress - 1));
  } else {
    //ofset the where in the snake this is.
    let offset = - 0.5 - progress;
    if (progress >= 0.5) {
      //we have setepd over the border and the start postion has moved forward 1
      offset += 1;
    }
    startSize = lerp(snakeTailSize, snakeHeadSize, (cell.order + offset) / (snakeLenght - 1));
  }
  const right = {
    x: -cell.dir.y,
    y: cell.dir.x
  }
  const center = {
    x: cell.x + 0.5,
    y: cell.y + 0.5
  }
  const head = {
    x: center.x + cell.dir.x * progress,
    y: center.y + cell.dir.y * progress
  }
  let startPos;
  if (progress < 0.5) {
    startPos = {
      x: center.x - cell.dir.x / 2,
      y: center.y - cell.dir.y / 2
    }
  } else {
    startPos = {
      x: center.x + cell.dir.x / 2,
      y: center.y + cell.dir.y / 2
    }
  }
  const startPosR = {
    x: startPos.x + right.x * startSize / 2,
    y: startPos.y + right.y * startSize / 2
  }

  const startPosL = {
    x: startPos.x - right.x * startSize / 2,
    y: startPos.y - right.y * startSize / 2
  }
  const headPosL = {
    x: head.x - right.x * snakeHeadSize / 2,
    y: head.y - right.y * snakeHeadSize / 2
  }
  const headPosR = {
    x: head.x + right.x * snakeHeadSize / 2,
    y: head.y + right.y * snakeHeadSize / 2
  }


  startPosRT = transform(startPosR);
  startPosLT = transform(startPosL);
  headPosRT = transform(headPosR);
  headPosLT = transform(headPosL);

  if (debug) {
    drawCornerControls({
      startPosRT,
      startPosLT,
      headPosRT,
      headPosLT,
    });
  }

  return {
    draw: () => {
      ctx.lineTo(headPosLT.x, headPosLT.y);
      drawEndCap(headPosLT, headPosRT);
      ctx.lineTo(startPosRT.x, startPosRT.y);
    },
    order: cell.order,
    startPosRT,
    startPosLT
  }
}

function drawStraightTail(cell, progress, snakeLenght, hitApple, debug = false) {
  let endSize;
  if (hitApple) {
    //progress the snake lenght 
    endSize = lerp(snakeTailSize, snakeHeadSize, (cell.order + 0.5) / (snakeLenght + progress - 1));
  } else {
    //ofset the where in the snake this is.
    let offset = 0.5 - progress;
    if (progress >= 0.5) {
      //we have setepd over the border and the start postion has moved forward 1
      offset += 1;
    }
    endSize = lerp(snakeTailSize, snakeHeadSize, (cell.order + offset) / (snakeLenght - 1));
  }
  const right = {
    x: -cell.dir.y,
    y: cell.dir.x
  }
  const center = {
    x: cell.x + 0.5,
    y: cell.y + 0.5
  }

  const tail = hitApple ? center : {
    x: center.x + cell.dir.x * progress,
    y: center.y + cell.dir.y * progress
  }
  let endPos;
  if (progress < 0.5 || hitApple) {
    endPos = {
      x: center.x + cell.dir.x / 2,
      y: center.y + cell.dir.y / 2
    }
  } else {
    endPos = {
      x: center.x + cell.dir.x * 3 / 2,
      y: center.y + cell.dir.y * 3 / 2
    }
  }
  const endPosR = {
    x: endPos.x + right.x * endSize / 2,
    y: endPos.y + right.y * endSize / 2
  }

  const endPosL = {
    x: endPos.x - right.x * endSize / 2,
    y: endPos.y - right.y * endSize / 2
  }
  const tailPosL = {
    x: tail.x - right.x * snakeTailSize / 2,
    y: tail.y - right.y * snakeTailSize / 2
  }
  const tailPosR = {
    x: tail.x + right.x * snakeTailSize / 2,
    y: tail.y + right.y * snakeTailSize / 2
  }


  endPosRT = transform(endPosR);
  endPosLT = transform(endPosL);
  tailPosLT = transform(tailPosL);
  tailPosRT = transform(tailPosR);

  if (debug) {
    drawCornerControls({
      endPosRT,
      endPosLT,
      tailPosLT,
      tailPosRT
    });
  }

  return {
    draw: () => {
      ctx.moveTo(endPosRT.x, endPosRT.y);
      ctx.lineTo(tailPosRT.x, tailPosRT.y);
      drawEndCap(tailPosRT, tailPosLT);
      ctx.lineTo(endPosLT.x, endPosLT.y);
    },
    order: cell.order,
    endPosRT,
    endPosLT
  }
}
//snake parts = [{left:(),right()}]

function drawSnake(snake, lastTail, nextHead, hitApple, progress) {
  ctx.beginPath();
  const corners = computeDirections(lastTail, snake, nextHead);
  let snakeParts = [];
  let headCorner = null;
  let tailSnakePart = null;
  if (snake[0].corner && (progress >= 0.5 && !hitApple)) {
    //remove the corner that shouldn't be drawn 
    corners.shift();
  }
  if ((!snake[0].corner || (progress >= 0.5 && !hitApple)) && (!snake[1].corner || (progress <= 0.5 || hitApple))) {
    //the tail is not a corner and therfore must be a streight 
    tailSnakePart = drawStraightTail(snake[0], progress, snake.length, hitApple);
    tailSnakePart.draw();
  } else {
    tailSnakePart = drawCorner(corners.shift(), progress, snake.length, hitApple);
    tailSnakePart.draw();
  }
  const headIsCorner = snake[snake.length - 1].corner && progress <= 0.5

  if (headIsCorner) {
    headCorner = corners.pop();
  }
  for (let i = 0; i < corners.length; i++) {
    const thisCorner = drawCorner(corners[i], progress, snake.length, hitApple);
    snakeParts.push(thisCorner);

    //draw the left hand side forwards 
    drawBezerCurve(thisCorner.fullCurveL, "line", false);
  }

  if (headIsCorner) {
    const thisCorner = drawCorner(headCorner, progress, snake.length, hitApple);

    ctx.lineTo(
      thisCorner.startPosLT.x,
      thisCorner.startPosLT.y,
    );
    thisCorner.draw();
  } else {
    const thisCorner = drawStraightHead(snake[snake.length - 1], progress, snake.length, hitApple);

    ctx.lineTo(
      thisCorner.startPosLT.x,
      thisCorner.startPosLT.y,
    );
    thisCorner.draw();
  }

  //finally complete the loop on the right side just backwrds
  for (let i = snakeParts.length - 1; i >= 0; i--) {
    drawBezerCurve(snakeParts[i].fullCurveR, "line", true);
  }

  //complete the loop
  ctx.lineTo(
    tailSnakePart.endPosRT.x,
    tailSnakePart.endPosRT.y,
  );

  ctx.fill();

  if (options.graphicsDebug) {
    ctx.strokeStyle = colors.red;
    ctx.stroke();
    drawStraightTail(snake[0], progress, snake.length, hitApple, true);
    for (let i = 0; i < corners.length; i++) {
      drawCorner(corners[i], progress, snake.length, hitApple, true);
    }
    drawStraightHead(snake[snake.length - 1], progress, snake.length, hitApple, true);
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
const snakeHeadSize = 0.7;

drawInstance = (lastTail, { snake, appleLocation, newApple }, nextHead, progress) => {


  hitApple = nextHead.x == appleLocation.x && nextHead.y == appleLocation.y;
  //draw grid
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!options.aiDebug) {
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
  }


  //draw the apple
  if (!hasWon) {
    drawAnApple(appleLocation, hitApple ? 1 - progress : (newApple ? progress : 1));
  }




  //add moving head and tail
  const tail = snake[0];
  const head = snake[snake.length - 1];



  if (!options.graphicsDebug) {
    const box = transform({ x: 0.1, y: 0.1, width: 0.2 })
    ctx.shadowOffsetX = box.x;
    ctx.shadowOffsetY = box.y;
    ctx.shadowBlur = box.width;
    ctx.shadowColor = colors.darkBlack;

  }
  const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grd.addColorStop(0, colors.green);
  grd.addColorStop(1, colors.teal);
  ctx.fillStyle = grd;
  drawSnake(snake, lastTail, nextHead, hitApple, progress);



  //disable further shaddows
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'rgba(0,0,0,0)';


  if (options.aiDebug) {
    if ("controlGrid" in game) {
      drawControlGrid(game.controlGrid);
    }
    if ("connectedQuads" in game) {
      drawConnectedQuads(game.connectedQuads);
    }
    if ("snakeSquares" in game) {
      drawSnakeSquares(game.snakeSquares);
    }
  }

  if (options.graphicsDebug && !options.aiDebug) {
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
}
drawMoveIndicators = (snake) => {
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
  if (options.aiEnabled) {
    appleListners.forEach(l => { l(currentInstance.appleLocation, currentInstance.snake); });
  }
}




let appleListners = [];
let moveListners = [];
let resetListners = []
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
  addResetListner: (listner) => {
    resetListners.push(listner);
  },
  reset: () => {
    if (options.aiEnabled) {
      resetListners.forEach(l => { l(); });
    }
    hasWon = false
    document.getElementById("score-container").textContent = 0;
    const gameCenter = {
      x: Math.floor(gameDimentions.x / 2),
      y: Math.floor(gameDimentions.y / 2)
    }
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
    headDir = {
      x: currentInstance.snake[currentInstance.snake.length - 1].x - currentInstance.snake[currentInstance.snake.length - 2].x,
      y: currentInstance.snake[currentInstance.snake.length - 1].y - currentInstance.snake[currentInstance.snake.length - 2].y
    }
    if (-dir.x !== headDir.x || -dir.y !== headDir.y) {
      //if the asked direction is not oppsite to the main direction ie no 180 turns.
      mainDirection = dir;
    }
  },
  getDirection: () => {
    return mainDirection;
  },
  dimentions: gameDimentions,
  stepsPerMove: 1
}




let nextSteps = [];

let startTime = Date.now();
let lastStep = 0;
let hasWon = false
let goingTohitApple = false;
let hasTriggeredWinReset = false;
let mainDirection = new dir("right");
function updateSnake() {
  currentInstance.newApple = false;

  currentInstance.snake.push(nextHead);
  hasWon = currentInstance.snake.length >= game.dimentions.x * game.dimentions.y
  const oldHead = currentInstance.snake[currentInstance.snake.length - 1];

  if (hasWon) {
    //the game has be won
    document.getElementById("score-container").textContent = (game.dimentions.x * game.dimentions.y - 3) + " - max";
    previousTail = currentInstance.snake.shift();
    startConfetti();
    if (!hasTriggeredWinReset) {
      hasTriggeredWinReset = true;
      setTimeout(() => {
        stopConfetti();
        game.reset();
        hasTriggeredWinReset = false;
      }, 5000);
    }

  } else {
    if (!(oldHead.x == currentInstance.appleLocation.x && oldHead.y == currentInstance.appleLocation.y)) {
      previousTail = currentInstance.snake.shift();
    } else {
      //apple has been hit
      document.getElementById("score-container").textContent = currentInstance.snake.length - 3;
      createNewApple();
    }
  }
  if (options.aiEnabled) {
    moveListners.forEach(l => { l(currentInstance.snake); });
  }
  const mov = mainDirection;

  nextHead = {
    x: oldHead.x + mov.x,
    y: oldHead.y + mov.y
  }

  if (isOutOfBounds(nextHead) || (currentInstance.snake.some(cur => cur.x == nextHead.x && cur.y == nextHead.y) && !hasWon)) {
    //you cant run into the tail if the ai has won
    game.reset();
  }

}
const isOutOfBounds = ({ x, y }) => x < 0 || y < 0 || y >= gameDimentions.y || x >= gameDimentions.x;


const renderLoop = () => {

  const progress = ((Date.now() - startTime) % progressDuration) / progressDuration;
  const step = Math.floor((Date.now() - startTime) / progressDuration)
  if (progressDuration <= 1000 / 60) {
    //there is a move every frame
    for (let i = 0; i < Math.floor(currentInstance.snake.length / 100) + 1; i++) {
      updateSnake();
    }
  } else if (step != lastStep && "dir" in currentInstance.snake[0]) {
    //we have made a step
    //make a step if there is one to make;
    updateSnake();
  }

  lastStep = step;

  drawInstance(previousTail, currentInstance, nextHead, progress);
  window.requestAnimationFrame(renderLoop);
}


window.addEventListener('load', () => {
  game.reset();//set everything up before rendering 
  // once everything has loaded start rendering
  appleImg.src = './apple.svg'; // Set source path
  appleImg.addEventListener('load', renderLoop, false);

});
//confetti win effect


//user input listners 

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
let progressDuration = 300;
function setNewSpeed(newProgressDuration) {
  const now = Date.now()
  const progress = ((now - startTime) % progressDuration) / progressDuration;
  startTime = now - progress * newProgressDuration;
  progressDuration = newProgressDuration;

  lastStep = 0;
}
document.querySelectorAll(`.options>input[name="snake-speed"]`).forEach(radio => {
  radio.addEventListener("change", event => {

    switch (event.target.id) {
      case "slow":
        setNewSpeed(1000);
        break;
      case "speed-medium":
        setNewSpeed(300);
        break;
      case "fast":
        setNewSpeed(1);
        break;
    }
  })
});
document.querySelectorAll(`.options>input[name="board-size"]`).forEach(radio => {
  radio.addEventListener("change", event => {

    switch (event.target.id) {
      case "small":
        gameDimentions.x = 10;
        gameDimentions.y = 10;
        break;
      case "size-medium":
        gameDimentions.x = 16;
        gameDimentions.y = 16;
        break;
      case "large":
        gameDimentions.x = 20;
        gameDimentions.y = 20;
        break;
    }
    game.reset();
  })
});


document.querySelector(`.options>input[name="graphics"]`).addEventListener("click", event => {
  options.graphicsDebug = !options.graphicsDebug;
});
document.querySelector(`.options>input[name="ai"]`).addEventListener("click", event => {
  options.aiDebug = !options.aiDebug;
});

document.querySelector("#reset").addEventListener("click", event => {
  game.reset();
})

document.querySelectorAll(`.options>input[name="player"]`).forEach(radio => {
  radio.addEventListener("change", event => {

    switch (event.target.id) {
      case "computer":
        options.aiEnabled = true;
        break;
      case "human":
        options.aiEnabled = false;
        break;
    }
    game.reset();
  })
});