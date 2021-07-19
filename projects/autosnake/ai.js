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


const controlGrid = [];
const basisControlGraph = [];
const connectedQuads = new Map();//[x,y] to [[x,y],[x,y]]
const toConnect = [];//[[x,y],[x,y]]
const toDisconnect = []; // /[[x,y],[x,y]]

const gridCoridnatesToGraph = ({ x, y }) => {
  return Math.floor(x / 2) + Math.floor(y / 2) * (game.dimentions.x / 2);
}
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
    if (y < gameDimentions.y - 1) {
      adjacent.push(simpleConvert(x, y + 1));
    }
    if (x < gameDimentions.x - 1) {
      adjacent.push(simpleConvert(x + 1, y));
    }
    basisControlGraph[id] = adjacent;
  }
}


function connectTwoQuads([a, b]) {
  //add the connection the the graph
  const aList = connectedQuads.get(a);
  if (aList == undefined) {
    connectedQuads.set(a, [b]);
  } else {
    connectedQuads.get(a).push(b);
  }
  const bList = connectedQuads.get(b);
  if (bList == undefined) {
    connectedQuads.set(b, [a]);
  } else {
    connectedQuads.get(b).push(a);
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
  const Aconnected = connectedQuads.get(a)
  const AindexB = Aconnected.indexOf(b);
  Aconnected.splice(AindexB, 1);
  const Bconnected = connectedQuads.get(b);
  const BindexA = Bconnected.indexOf(b);
  Bconnected.splice(BindexA, 1);
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


game.controlGrid = controlGrid;


game.addNewAppleListner(apple => {
  currentApple = apple;
});

game.addNewMoveListner((snake) => {
  //the next move has allready been selected pick the z
  const snakeHead = snake[snake.length - 1];
  if (controlGrid && controlGrid.length > 0) {
    game.setDirection(controlGrid[snakeHead.x][snakeHead.y]);
  }



});

