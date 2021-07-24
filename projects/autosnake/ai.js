// const game = {
//   addNewAppleListner: (listner) => {
//     appleListners.add(listner);
//   },
//   getCurrentAppleLocation: () => {
//     return currentInstance.appleLocation;
//   },
//   getCurrentSnake: () => {
//     return currentInstance.snake;
//   },
//   reset: () => {
//     previousTail = { x: gameCenter.x - 2, y: gameCenter.y };
//     currentInstance = { snake: [{ x: gameCenter.x - 1, y: gameCenter.y }, gameCenter, { x: gameCenter.x + 1, y: gameCenter.y }], appleLocation: null, newApple: false }
//     nextHead = { x: gameCenter.x + 2, y: gameCenter.y };
//     mainDirection = new dir("right");
//     createNewApple();
//   },
//   addNewMoveListner: (listner) => {
//     moveListners.add(listner);
//   },
//   setDirection: (dir) => {
//     headDir = currentInstance.snake[currentInstance.snake.length - 1].dir;
//     if (-dir.x !== headDir.x || -dir.y !== headDir.y) {
//       //if the asked direction is not oppsite to the main direction ie no 180 turns.
//       mainDirection = dir;
//     }
//   },
//   dimentions: gameDimentions
// }

let moves = []
let currentApple = null;
let currentAppleCellID = -1;

const up = new dir("up");
const down = new dir("down");
const left = new dir("left");
const right = new dir("right");
const allDirections = [up, right, down, left];

up.clock = right;
right.clock = down;
down.clock = left;
left.clock = up;

up.antiClock = left;
left.antiClock = down;
down.antiClock = right;
right.antiClock = up;

const controlGrid = [];
const basisControlGraph = [];
const connectedQuads = new Map();

const snakeSquares = new Set();
const snakeSquaresMap = new Map();



const gridCoridnatesToGraphID = ({ x, y }) => {
  return Math.floor(x / 2) + Math.floor(y / 2) * (game.dimentions.x / 2);
}
const simpleConvert = (x, y) => {
  return y * (game.dimentions.x / 2) + x;
}
function setupControlGrid() {

  //create the basic control grid 
  for (let x = 0; x < game.dimentions.x; x++) {
    const col = []
    if ((x & 1) == 0) {
      for (let y = 0; y < game.dimentions.y; y++) {
        col[y] = (y & 1) == 0 ? right : up;
      }
    } else {
      for (let y = 0; y < game.dimentions.y; y++) {
        col[y] = (y & 1) == 0 ? down : left;
      }
    }
    controlGrid[x] = col;
  }
  //greate basic game graph

  for (let x = 0; x < (game.dimentions.x / 2); x++) {
    for (let y = 0; y < (game.dimentions.y / 2); y++) {
      const id = simpleConvert(x, y);
      let adjacent = [];
      if (y > 0) {
        adjacent.push([simpleConvert(x, y - 1), up]);
      }
      if (x > 0) {
        adjacent.push([simpleConvert(x - 1, y), left]);
      }
      if (y < (gameDimentions.y / 2) - 1) {
        adjacent.push([simpleConvert(x, y + 1), down]);
      }
      if (x < (gameDimentions.x / 2) - 1) {
        adjacent.push([simpleConvert(x + 1, y), right]);
      }
      basisControlGraph[id] = adjacent;
    }
  }


}
function setupCapturePath() {
  for (let x = 0; x < (game.dimentions.x / 2); x++) {
    //y == 0 
    if (x > 0) {
      connectTwoQuads([simpleConvert(x - 1, 0), simpleConvert(x, 0)]);
    }
    for (let y = 1; y < (game.dimentions.y / 2); y++) {
      connectTwoQuads([simpleConvert(x, y - 1), simpleConvert(x, y)]);
    }
  }
}

setupControlGrid();
setupCapturePath();
function directionBetweenAtoB(a, b) {
  const tempDir = new dir(a, b);
  return allDirections.find(a => a.equals(tempDir));
}

function connectTwoQuads([a, b]) {
  //add the connection the the graph
  const aList = connectedQuads.get(a);
  if (aList == undefined) {
    connectedQuads.set(a, new Set([b]));
  } else {
    connectedQuads.get(a).add(b);
  }
  const bList = connectedQuads.get(b);
  if (bList == undefined) {
    connectedQuads.set(b, new Set([a]));
  } else {
    connectedQuads.get(b).add(a);
  }
  const width = game.dimentions.x / 2;
  const ATopLeft = { x: a % width, y: Math.floor(a / width) };
  const BTopLeft = { x: b % width, y: Math.floor(b / width) };
  const ab = directionBetweenAtoB(ATopLeft, BTopLeft);
  const right = ab.clock;
  const ba = right.clock;
  aCenter = {
    x: ATopLeft.x * 2 + 1,
    y: ATopLeft.y * 2 + 1
  }
  bOffset = {
    x: Math.floor(ab.x * 1.5 + right.x * 0.5),
    y: Math.floor(ab.y * 1.5 + right.y * 0.5)
  }
  aOffset = {
    x: Math.floor(ab.x * 0.5 - right.x * 0.5),
    y: Math.floor(ab.y * 0.5 - right.y * 0.5)
  }
  controlGrid[aCenter.x + bOffset.x][aCenter.y + bOffset.y] = ba;
  controlGrid[aCenter.x + aOffset.x][aCenter.y + aOffset.y] = ab;
}
function detachTwoQuads([a, b]) {
  //add the connection the the graph
  const Aconnected = connectedQuads.get(a);
  if (Aconnected == undefined || !Aconnected.has(b)) {
    return false;
  }
  if (Aconnected.size == 1) {
    connectedQuads.delete(a)
  } else {
    Aconnected.delete(b)
  }


  const Bconnected = connectedQuads.get(b);
  if (Bconnected.size == 1) {
    connectedQuads.delete(b)
  } else {
    Bconnected.delete(a);
  }


  const width = game.dimentions.x / 2;
  const ATopLeft = { x: a % width, y: Math.floor(a / width) };
  const BTopLeft = { x: b % width, y: Math.floor(b / width) };

  const ab = directionBetweenAtoB(ATopLeft, BTopLeft);
  const right = ab.clock;
  const left = ab.antiClock;
  aCenter = {
    x: ATopLeft.x * 2 + 1,
    y: ATopLeft.y * 2 + 1
  }
  bOffset = {
    x: Math.floor(ab.x * 1.5 + right.x * 0.5),
    y: Math.floor(ab.y * 1.5 + right.y * 0.5)
  }
  aOffset = {
    x: Math.floor(ab.x * 0.5 - right.x * 0.5),
    y: Math.floor(ab.y * 0.5 - right.y * 0.5)
  }
  controlGrid[aCenter.x + bOffset.x][aCenter.y + bOffset.y] = left;
  controlGrid[aCenter.x + aOffset.x][aCenter.y + aOffset.y] = right;
}
function getQuadToSquare({ x, y }) {
  const toDir = (x & 1) == 0 ?
    ((y & 1) == 0 ? right : up) :
    ((y & 1) == 0 ? down : left)

  const newPos = { x: (Math.floor(x / 2) - toDir.x), y: (Math.floor(y / 2) - toDir.y) };
  if (newPos.x < 0 || newPos.y < 0 || newPos.x >= game.dimentions.x / 2 || newPos.y >= game.dimentions.y / 2) {
    return -1;
  }
  return newPos.x + newPos.y * game.dimentions.x / 2;
}
function getNextQuads() {
  const out = new Map();
  let count = 1;
  if (!snakeHead) {
    return out;
  }
  let currentSquare = {
    x: snakeHead.x,
    y: snakeHead.y
  }
  let hasNotCompleteLoop = true;
  //step forwards one because we cant control where the snake is going to right now anymore
  currentSquare = controlGrid[currentSquare.x][currentSquare.y].add(currentSquare);
  while (hasNotCompleteLoop) {
    currentSquare = controlGrid[currentSquare.x][currentSquare.y].add(currentSquare);
    const to = gridCoridnatesToGraphID(currentSquare);
    const from = getQuadToSquare(currentSquare);
    if (currentSquare.x == snakeHead.x && currentSquare.y == snakeHead.y) {
      hasNotCompleteLoop = false;
    }
    if (from != -1 && !out.has(from) && connectedQuads.get(from) == undefined) {
      out.set(from, {
        count,
        to
      });
    }
    count += 1;
  }
  return out;
}

function getMovesNeededBetweenDirections(pre, next) {
  if (pre.clock.equals(next)) {
    return 1
  }
  if (pre.equals(next)) {
    return 2;
  }
  return 3;
}
//need to add the size of the path into the metric of how good it is 
function bfsToSnake(loc) {
  const start = Date.now();
  const maxSearchTime = 1000 / 60 * 2;
  const quadLoc = (gridID) => {
    return {
      x: gridID % (game.dimentions.x / 2),
      y: Math.floor(gridID / game.dimentions.x / 2)
    }
  }
  startPos = gridCoridnatesToGraphID(loc);
  appleDirection = controlGrid[loc.x][loc.y];
  if (snakeSquares.size == 0) {
    return [];
  }
  if (connectedQuads.has(startPos)) {
    return [];
  }

  let frontier = [{ path: [startPos], lastDirection: appleDirection, steps: 0 }];
  let visited = new Set();
  let bestPath = [];
  const value = getNextQuads();
  let leastSteps = Number.MAX_SAFE_INTEGER;
  let foundAPath = false;
  while ((frontier.length > 0) && (Date.now() - start < maxSearchTime || !foundAPath)) {
    cur = frontier.shift();
    const headQuad = cur.path[0];
    visited.add(headQuad);

    const thisSteps = value.get(headQuad)
    if (thisSteps != undefined) {

      const lastStep = getMovesNeededBetweenDirections(
        cur.lastDirection,
        directionBetweenAtoB(headQuad, quadLoc(thisSteps.to))
      );
      const pathLenght = thisSteps.count + cur.steps + lastStep;
      if (pathLenght < leastSteps) {
        leastSteps = pathLenght;
        foundAPath = true;
        bestPath = [thisSteps.to, ...cur.path];
      }
    }
    basisControlGraph[headQuad].forEach(([cell, direction]) => {
      if (!visited.has(cell) && !connectedQuads.has(cell)) {
        frontier.push({
          path: [cell, ...cur.path],
          lastDirection: direction,
          steps: cur.steps + getMovesNeededBetweenDirections(cur.lastDirection, direction)
        });
      }
    });
  }
  return bestPath;
}


function connectPath(path) {
  for (let i = 1; i < path.length; i++) {
    connectTwoQuads([path[i], path[i - 1]]);
  }
}
function simplifyPath() {
  toPrune = []
  for ([quad, connections] of connectedQuads.entries()) {
    if (quad == headQuad) {
      //skip changing the headQuad
    } else if (snakeSquares.has(quad)) {
      for (otherQuad of connections.values()) {
        if (otherQuad != headQuad && !snakeSquares.has(otherQuad)) {
          toPrune.push([quad, otherQuad]);
        }
      }
    } else {
      for (otherQuad of connections.values()) {
        if (otherQuad != headQuad) {
          toPrune.push([quad, otherQuad]);
        }
      }
    }
  }
  for (prune of toPrune) {
    detachTwoQuads(prune);
  }
}

function getApple() {
  if (capturedTheSnake) {
    //can't get the apple untill the snake is cpatured on a path;
    setTimeout(() => {
      if (capturedTheSnake) {
        simplifyPath();
        if (!snakeSquares.has(currentAppleCellID)) {
          //only connect the apple if its not on the path.
          connectPath(bfsToSnake(currentApple));
        }
      }
    }, 1);
  }

}

function updateSnakeSquares(snake) {
  const snakeSquaresLength = snakeSquares.size
  if (snakeSquaresLength == 0) {
    for (square of snake) {
      const squareID = gridCoridnatesToGraphID(square);
      if (snakeSquares.has(squareID)) {
        snakeSquaresMap.set(squareID, 1 + snakeSquaresMap.get(squareID));
      } else {
        snakeSquares.add(squareID);
        snakeSquaresMap.set(squareID, 1);
      }

    }
    headQuad = gridCoridnatesToGraphID(snakeHead);
  } else {
    const canDeleteOldPath = (snakeSquaresLength - 1) * 4 > snake.length + 1;
    const snakeHeadCellID = gridCoridnatesToGraphID(snakeHead);
    headQuad = snakeHeadCellID;
    const lastSnakeTailCellID = gridCoridnatesToGraphID(lastSnakeTail);
    if (snakeSquares.has(snakeHeadCellID)) {
      snakeSquaresMap.set(snakeHeadCellID, 1 + snakeSquaresMap.get(snakeHeadCellID));
    } else {
      snakeSquares.add(snakeHeadCellID);
      snakeSquaresMap.set(snakeHeadCellID, 1);
    }

    if (lastSnakeTail.x != snake[0].x || lastSnakeTail.y != snake[0].y) {
      oldTailCount = snakeSquaresMap.get(lastSnakeTailCellID);
      if (oldTailCount <= 1) {
        snakeSquares.delete(lastSnakeTailCellID);
        snakeSquaresMap.delete(lastSnakeTailCellID);
        //no longer contating snake 
        if (canDeleteOldPath && currentAppleCellID != lastSnakeTailCellID && connectedQuads.get(lastSnakeTailCellID).size == 1) {
          detachTwoQuads([lastSnakeTailCellID, gridCoridnatesToGraphID(snake[0])])
        }
      } else {
        snakeSquaresMap.set(
          lastSnakeTailCellID,
          snakeSquaresMap.get(lastSnakeTailCellID) - 1
        );
      }
    }
  }
  lastSnakeTail = snake[0];
}
game.controlGrid = controlGrid;
game.connectedQuads = connectedQuads;
game.snakeSquares = snakeSquares;
game.snakeSquaresAge;

game.addNewAppleListner(apple => {
  currentApple = apple;
  currentAppleCellID = gridCoridnatesToGraphID(apple);
  getApple();
});

let capturedTheSnake = false;
let lastSnakeTail = null;
let headQuad = -1;
let snakeHead = null;

game.addNewMoveListner((snake) => {
  //the next move has allready been selected pick the z
  snakeHead = snake[snake.length - 1];
  if (controlGrid && controlGrid.length > 0) {
    game.setDirection(controlGrid[snakeHead.x][snakeHead.y]);
  }

  if (capturedTheSnake) {
    updateSnakeSquares(snake);
    getApple();
  } else {
    //not captured the snake yet
    // work out wether the snake is on the same path when it is vertical
    let vertical = true;
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x != snake[i - 1].x) {
        vertical = false;
      }
    }
    if (vertical) {
      capturedTheSnake = true;
      updateSnakeSquares(snake);
      getApple();
    }
  }

});

game.addResetListner(() => {
  snakeSquares.clear();
  snakeSquaresMap.clear();
  capturedTheSnake = false;
  if (controlGrid.length == gameDimentions.x && controlGrid[0].length == controlGrid.y) {
    let toDiconnect = []
    for ([cell, connections] of connectedQuads.entries()) {
      for (connection of connections) {
        toDiconnect.push([cell, connection]);
      }
    }
    toDiconnect.forEach(detachTwoQuads);
  } else {
    connectedQuads.clear();
    setupControlGrid();
  }
  setupCapturePath();
})