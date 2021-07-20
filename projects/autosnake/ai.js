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

const up = new dir("up");
const down = new dir("down");
const left = new dir("left");
const right = new dir("right");
const allDirections = [up, right, down, left];
const stepsAhead = 1; // the minimum number of steps ahead of the snake the search must use 

const controlGrid = [];
const basisControlGraph = [];
const connectedQuads = new Map();

const snakeSquares = new Set();
const snakeSquaresMap = new Map();
const toDisconnect = new Set();

const gridCoridnatesToGraphID = ({ x, y }) => {
  return Math.floor(x / 2) + Math.floor(y / 2) * (game.dimentions.x / 2);
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
  const simpleConvert = (x, y) => {
    return y * (game.dimentions.x / 2) + x;
  }
  for (let x = 0; x < (game.dimentions.x / 2); x++) {
    for (let y = 0; y < (game.dimentions.y / 2); y++) {
      const id = simpleConvert(x, y);
      let adjacent = [];
      if (y > 0) {
        adjacent.push(simpleConvert(x, y - 1));
      }
      if (x > 0) {
        adjacent.push(simpleConvert(x - 1, y));
      }
      if (y < (gameDimentions.y / 2) - 1) {
        adjacent.push(simpleConvert(x, y + 1));
      }
      if (x < (gameDimentions.x / 2) - 1) {
        adjacent.push(simpleConvert(x + 1, y));
      }
      basisControlGraph[id] = adjacent;
    }
  }


  //create a catcher path
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
  const tempDir = new dir(ATopLeft, BTopLeft);
  const ab = allDirections.findIndex(a => a.equals(tempDir));
  const right = (ab + 1) % 4;
  const ba = (ab + 2) % 4;
  aCenter = {
    x: ATopLeft.x * 2 + 1,
    y: ATopLeft.y * 2 + 1
  }
  bOffset = {
    x: Math.floor(allDirections[ab].x * 1.5 + allDirections[right].x * 0.5),
    y: Math.floor(allDirections[ab].y * 1.5 + allDirections[right].y * 0.5)
  }
  aOffset = {
    x: Math.floor(allDirections[ab].x * 0.5 - allDirections[right].x * 0.5),
    y: Math.floor(allDirections[ab].y * 0.5 - allDirections[right].y * 0.5)
  }
  controlGrid[aCenter.x + bOffset.x][aCenter.y + bOffset.y] = allDirections[ba];
  controlGrid[aCenter.x + aOffset.x][aCenter.y + aOffset.y] = allDirections[ab];
}
function detachTwoQuads([a, b]) {
  //add the connection the the graph
  const Aconnected = connectedQuads.get(a);
  if (!Aconnected.has(b)) {
    return false;
  }
  Aconnected.delete(b)
  const Bconnected = connectedQuads.get(b);
  Bconnected.delete(a);


  const width = game.dimentions.x / 2;
  const ATopLeft = { x: a % width, y: Math.floor(a / width) };
  const BTopLeft = { x: b % width, y: Math.floor(b / width) };
  const tempDir = new dir(ATopLeft, BTopLeft);
  const ab = allDirections.findIndex(a => a.equals(tempDir));
  const right = (ab + 1) % 4;
  const left = (ab + 3) % 4;
  aCenter = {
    x: ATopLeft.x * 2 + 1,
    y: ATopLeft.y * 2 + 1
  }
  bOffset = {
    x: Math.floor(allDirections[ab].x * 1.5 + allDirections[right].x * 0.5),
    y: Math.floor(allDirections[ab].y * 1.5 + allDirections[right].y * 0.5)
  }
  aOffset = {
    x: Math.floor(allDirections[ab].x * 0.5 - allDirections[right].x * 0.5),
    y: Math.floor(allDirections[ab].y * 0.5 - allDirections[right].y * 0.5)
  }
  controlGrid[aCenter.x + bOffset.x][aCenter.y + bOffset.y] = allDirections[left];
  controlGrid[aCenter.x + aOffset.x][aCenter.y + aOffset.y] = allDirections[right];
}


function bfsToSnake(loc) {
  start = gridCoridnatesToGraphID(loc);
  if (snakeSquares.size == 0) {
    return [];
  }
  let goals = snakeSquares;
  let frontier = [[start]];
  let visited = new Set([start]);
  let path = null;
  while (path == null) {
    cur = frontier.shift();
    basisControlGraph[cur[0]].forEach(cell => {
      if (!visited.has(cell)) {
        visited.add(cell);
        const newPath = [cell, ...cur];
        frontier.push(newPath);
        if (goals.has(cell)) {
          path = newPath;
        }
      }
    });
  }
  return path;
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
  setTimeout(() => {
    simplifyPath();
    connectPath(bfsToSnake(currentApple));
  }, 1);
}

game.controlGrid = controlGrid;
game.connectedQuads = connectedQuads;
game.snakeSquares = snakeSquares;

game.addNewAppleListner(apple => {
  currentApple = apple;
  getApple();
});

let capturedTheSnake = false;
let lastSnakeTail = null;
let headQuad = -1;


game.addNewMoveListner((snake) => {
  //the next move has allready been selected pick the z
  const snakeHead = snake[snake.length - 1];
  if (controlGrid && controlGrid.length > 0) {
    game.setDirection(controlGrid[snakeHead.x][snakeHead.y]);
  }

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
        if (canDeleteOldPath && connectedQuads.get(lastSnakeTailCellID).size == 1) {
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


});

