



const createStage = (view) => {
  const { rows, cols } = view.dimentions;
  const game = document.getElementById("game");
  document.querySelector(`#inputs>#restartButton`).addEventListener("click", () => {
    reset(view);
  });

  document.querySelector(`#inputs>#flagButton`).addEventListener("click", (e) => {
    const elm = e.currentTarget.firstElementChild;
    if (elm.textContent == "flag") {
      elm.textContent = "outlined_flag";
    } else {
      elm.textContent = "flag"
    }
  });
  document.querySelector(`#inputs>#stepButton`).addEventListener("click", (e) => {

  });
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const space = document.createElement('div');
      space.setAttribute('game-x', x.toString());
      space.setAttribute('game-y', y.toString());
      space.setAttribute("game-is-known", false);
      space.setAttribute("game-is-marked", false);
      space.addEventListener("click", (e) => {
        const x = parseInt(e.target.getAttribute('game-x'), 10);
        const y = parseInt(e.target.getAttribute('game-y'), 10);
        const outline = document.querySelector(`#inputs>#flagButton>span`).textContent;
        if (outline == "outlined_flag") {
          makeCellKnown(view, { x, y });
        } else {
          markCellAsBomb(view, { x, y });
        }
      });
      // space.addEventListener("contextmenu", e => {
      // })
      game.appendChild(space);
    }
  }
}
const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const cellStates = { unknown: 0, marked: 1, known: 2 }
const gameStates = { start: 0, playing: 1, won: 2, lost: 3 }

const createView = (dimentions, bombCount) => {
  let { rows, cols } = dimentions
  let stage = [];
  let changedCells = [];
  let safeCells = dimentions.rows * dimentions.cols - bombCount
  let blankCell = { state: cellStates.unknown, count: 0, steps: 0 };
  for (let x = 0; x < cols; x++) {
    let row = [];
    for (let y = 0; y < rows; y++) {
      const cell = Object.create(blankCell);
      cell.x = x;
      cell.y = y;
      row[y] = cell;

    }
    stage[x] = row;
  }
  // min (included) and max (excluded):


  return {
    stage,
    //2d array of bombs each one with a count of its surrounding bombs and the
    // number of steps from the starting press
    // the cells state, unknown, marked, known
    state: gameStates.start,
    changedCells,
    safeCells,
    dimentions: { rows, cols },
    bombCount,
    markedCount: 0,
    correctlyMarkedCount: 0,
  };
}

const createBombs = ({ stage, bombCount, dimentions: { rows, cols } }, clickLocation) => {
  // we can assume a blank stage 

  const incrementSurronding = (x, y) => {
    surronudingCells({ x, y }, { rows, cols }, (x, y) => {
      const outsideItem = stage[x][y]
      if (outsideItem.count >= 0) {
        outsideItem.count++;
      }
    })
  }
  let bombs = 0;
  while (bombs < bombCount) {
    let x = getRndInteger(0, cols);
    let y = getRndInteger(0, rows);
    const item = stage[x][y];
    const clickDist = { x: clickLocation.x - x, y: clickLocation.y - y }
    const onClick = clickDist.x >= -1 && clickDist.y >= -1 && clickDist.x <= 1 && clickDist.y <= 1
    if (item.count >= 0 && !onClick) {
      bombs++;
      item.count = -1;
      incrementSurronding(x, y);
    }
  }
}
const reset = (view) => {
  const { rows, cols } = view.dimentions;
  view.state = gameStates.start;
  view.markedCount = 0;
  view.correctlyMarkedCount = 0;
  view.safeCells = rows * cols - view.bombCount
  updateStage(view);
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      cell = view.stage[x][y];
      cell.steps = 0;
      cell.count = 0;
      cell.state = cellStates.unknown;
    }
  }
}
const setKnownHtmlCellDetails = (htmlCell, cell) => {
  if (cell.count < 0) {
    htmlCell.innerHTML = "&times;";
  } else if (cell.count > 0) {
    htmlCell.textContent = cell.count;
  } else {
    htmlCell.innerHTML = null;
  }
};
const updateCell = (cell) => {
  const htmlCell = document.querySelector(`div[game-x = "${cell.x}"][game-y = "${cell.y}"]`);

  htmlCell.style = `transition-delay: ${20 * cell.steps}ms;`

  switch (cell.state) {
    case cellStates.unknown:
      htmlCell.innerHTML = null;
      break;
    case cellStates.known:
      setKnownHtmlCellDetails(htmlCell, cell);
      break;
    case cellStates.marked:
      htmlCell.innerHTML = "&#9873;";
      break;
    default:
      break;
  }

  //set content of the cell
  htmlCell.setAttribute("game-is-known", cell.state == cellStates.known);
  htmlCell.setAttribute("game-is-marked", cell.state == cellStates.marked);
  htmlCell.setAttribute("game-is-bomb", cell.count < 0);
}
const updateCellSame = (cell, cellState) => {
  const htmlCell = document.querySelector(`div[game-x = "${cell.x}"][game-y = "${cell.y}"]`);

  htmlCell.style = `transition-delay: ${20 * cell.steps}ms;`


  switch (cellState) {
    case cellStates.unknown:
      htmlCell.innerHTML = null;
      break;
    case cellStates.known:
      setKnownHtmlCellDetails(htmlCell, cell);
      break;
    case cellStates.marked:
      htmlCell.innerHTML = "&#9873;";
      break;
    default:
      break;
  }
  //set content of the cell
  htmlCell.setAttribute("game-is-known", cellState == cellStates.known);
  htmlCell.setAttribute("game-is-marked", cellState == cellStates.marked);
  htmlCell.setAttribute("game-is-bomb", cell.count < 0);
}
const updateStage = (view) => {
  const { stage, changedCells, state } = view;
  let cell;
  const htmlGame = document.querySelector(`#game`)
  htmlGame.classList.remove("pass", "fail");
  htmlMessage = document.querySelector(`#gameMessage`);
  htmlMessage.textContent = null;
  if (state == gameStates.lost) {
    htmlMessage.textContent = "Failure bomb triggered";
    htmlGame.classList.add("fail");
  }
  if (state == gameStates.won) {
    htmlMessage.textContent = "Success mines cleared";
    htmlGame.classList.add("pass");
  }


  if (state == gameStates.start) {
    for (let x = 0; x < stage.length; x++) {
      for (let y = 0; y < stage[x].length; y++) {
        updateCellSame(stage[x][y], cellStates.unknown);
      }
    }
  } else if (state == gameStates.won || state == gameStates.lost) {
    for (let x = 0; x < stage.length; x++) {
      for (let y = 0; y < stage[x].length; y++) {
        updateCellSame(stage[x][y], cellStates.known);
      }
    }
  } else {
    while (cell = changedCells.pop()) {
      updateCell(cell, cellStates);
    }
  }

}
const markCellAsBomb = (view, { x, y }) => {
  if (view.state == gameStates.start) {
    //they ment to mark the cell as known 
    makeCellKnown(view, { x, y });
    return;
  }
  let cell = view.stage[x][y];
  if (view.markedCount < view.bombCount && cell.state == cellStates.unknown) {
    cell.state = cellStates.marked
    view.markedCount += 1;
    if (cell.count <= 0) {
      view.correctlyMarkedCount += 1;
    }
    if (view.correctlyMarkedCount == view.bombCount) {
      view.state = gameStates.won;
    }
    view.changedCells.push(cell);
  } else if (cell.state == cellStates.marked) {
    cell.state = cellStates.unknown
    view.markedCount -= 1;
    if (cell.count <= 0) {
      view.correctlyMarkedCount -= 1;
    }
    view.changedCells.push(cell);
  }
  updateStage(view);
}
const makeCellKnown = (view, { x, y }) => {
  if (view.state == gameStates.start) {
    createBombs(view, { x, y });
    view.state = gameStates.playing
  }
  let cell = view.stage[x][y];

  cell.state = cellStates.known;
  view.safeCells -= 1;
  if (cell.count < 0) {
    view.state = gameStates.lost;
    view.safeCells = 1;
  } else if (cell.count === 0) {
    floodFill(view, { x, y })
  }
  if(view.safeCells == 0){
    view.state = gameStates.won;
  }
  view.changedCells.push(cell);
  updateStage(view);
}
const surronudingCells = ({ x, y }, { rows, cols }, callback) => {
  const square = (x, y, testInBounds) => {
    if (testInBounds(x, y)) {
      callback(x, y);
    }
  }
  square(x - 1, y, x => x >= 0);
  square(x + 1, y, x => x < cols);
  square(x, y - 1, (x, y) => y >= 0);
  square(x, y + 1, (x, y) => y < rows);

  square(x - 1, y - 1, (x, y) => x >= 0 && y >= 0);
  square(x - 1, y + 1, (x, y) => x >= 0 && y < rows);
  square(x + 1, y - 1, (x, y) => x < cols && y >= 0);
  square(x + 1, y + 1, (x, y) => x < cols && y < rows);
}
const floodFill = (view, start) => {
  const { stage, changedCells } = view;

  toFill = [start];
  while (toFill.length > 0) {
    current = toFill.pop();
    const nextSteps = (current.steps ?? 0) + 1;
    surronudingCells(current, dimentions, (x, y) => {
      let newCell = stage[x][y];
      if (newCell.state == cellStates.unknown) {
        newCell.state = cellStates.known;
        view.safeCells -= 1;
        changedCells.push(newCell);
        newCell.steps = nextSteps;
        if (newCell.count === 0) {
          toFill.unshift({ x, y, steps: nextSteps });
        }
      }
    });
  }
  return true;
}
const dimentions = { rows: 16, cols: 16 };

const view = createView(dimentions, 30);
createStage(view);



