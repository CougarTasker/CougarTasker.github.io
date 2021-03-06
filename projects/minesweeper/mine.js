
const createStage = ({ rows, cols }) => {
  const game = document.getElementById("game");
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
        floodFill(view, { x, y }, dimentions);
        updateStage(view)
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
const createView = ({ rows, cols, bombCount }) => {
  let stage = [];
  let changedCells = [];
  let blankCell = { isMarked: false, isKnown: false, count: 0 };
  let knownBombRanges = [];
  let knownSafeRanges = [];
  let noIdeaCell = [];
  for (let x = 0; x < cols; x++) {
    let row = [];
    for (let y = 0; y < rows; y++) {
      row[y] = Object.create(blankCell);
    }
    stage[x] = row;
  }
  // min (included) and max (excluded):

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
    if (item.count >= 0) {
      bombs++;
      item.count = -1;
      incrementSurronding(x, y);
    }
  }
  return {
    stage,
    changedCells,
    knownBombRanges,
    knownSafeRanges,
    noIdeaCell,
    triggeredBomb: false,
    markedCount: 0,
    firstMove:true
  };
}
const updateStage = ({ stage, changedCells, markedCount, triggeredBomb }, ignoreKnown = false) => {
  let cell;
  const htmlGame = document.querySelector(`#game`)
  htmlGame.classList.remove("pass", "fail");
  htmlMessage = document.querySelector(`#gameMessage`);
  htmlMessage.textContent = null;
  if (view.knownBombRanges.length == 0 && view.knownSafeRanges.length == 0) {
    htmlMessage.textContent = "No certain options avalible making guess";
  }
  if (triggeredBomb) {
    htmlMessage.textContent = "Failure bomb triggered";
    htmlGame.classList.add("fail");
  }
  if (markedCount == dimentions.bombCount) {
    htmlMessage.textContent = "Success mines cleared";
    htmlGame.classList.add("pass");
  }
  const gameOver = triggeredBomb || markedCount == dimentions.bombCount
  const updateCell = (x, y) => {
    const htmlCell = document.querySelector(`div[game-x = "${x}"][game-y = "${y}"]`);
    const cell = stage[x][y];
    if("steps" in cell){
      htmlCell.style = `transition-delay: ${20*cell.steps}ms;`
    }
    const count = cell.count
    const cellKnown = cell.isKnown || ignoreKnown || gameOver
    if (cell.isMarked) {
      htmlCell.innerHTML = "&#9873;";
    }else if (cellKnown) {
      if (count < 0) {
        htmlCell.innerHTML = "&times;";
      } else if (count > 0) {
        htmlCell.textContent = count;
      }
    } else {
      htmlCell.innerHTML = null;
    }


    htmlCell.setAttribute("game-is-known", cellKnown);
    htmlCell.setAttribute("game-is-marked", cell.isMarked);
    htmlCell.setAttribute("game-is-bomb", cell.count < 0);
  }
  if (changedCells.length === 0 || gameOver) {
    for (let x = 0; x < stage.length; x++) {
      for (let y = 0; y < stage[x].length; y++) {
        updateCell(x, y);
      }
    }
  } else {
    while (cell = changedCells.pop()) {
      updateCell(cell.x, cell.y);
    }
  }

}
const markCellAsBomb = (view, { x, y }) => {
  let cell = view.stage[x][y];
  if (cell.isMarked) {
    return false;
  }
  cell.isMarked = true;
  view.markedCount += 1;
  view.changedCells.push({ x, y });

  cell.ranges.forEach(range => {
    if (!range.complete) {
      range.cells = range.cells.filter(cell => cell.x !== x || cell.y !== y);
      range.bombs--;
      if (range.bombs === 0) {
        range.complete = true;
        view.knownSafeRanges.push(range)
      }
    }
  })
  cell.ranges = [];
  return true;
}

const makeCellKnown = (view, dimentions, { x, y }) => {
  let cell = view.stage[x][y];
  if (cell.isKnown) {
    return false;
  }
  cell.isKnown = true;
  if (cell.count < 0) {
    view.triggeredBomb = true;
  }
  view.changedCells.push({ x, y });

  if (cell.count > 0) {
    //skip zero cells as they aren't going to have any unknown cells areound them 
    createRanges(view, dimentions, { x, y })
  }

  cell.ranges?.forEach(range => {
    if (!range.complete) {
      range.cells = range.cells.filter(cell => cell.x !== x || cell.y !== y);
      if (range.cells.length === range.bombs) {
        view.knownBombRanges.push(range);
        range.complete = true;
      }
    }
  });

  cell.ranges = [];
  return cell
}
const blankRange = { complete: false };

const splitRanges = ({ stage }, a, b) => {
  let onlyb = b.cells;
  let onlya = a.cells;
  onlya = onlya.filter(aitem => {
    let int = false;
    onlyb = onlyb.filter(bitem => {
      if (aitem.x == bitem.x && aitem.y == bitem.y) {
        int = true;
        return false;
      }
      return true;
    })
    return !int;
  });
  const splitSuperSet = (sub, sup, splitCells) => {
    let newRange = Object.create(blankRange);
    newRange.bombs = sup.bombs - sub.bombs;
    newRange.cells = splitCells;
    newRange.cells.forEach(({ x, y }) => {
      const subCell = stage[x][y];
      subCell.ranges = [...subCell.ranges ?? [], newRange];
    })
    checkNewRangeForKnownValues(newRange);
  }
  if (onlya.length == 0 && onlyb.length > 0) {
    splitSuperSet(a, b, onlyb);
  }
  if (onlyb.length == 0 && onlya.length > 0) {
    splitSuperSet(b, a, onlya);
  }
}
checkNewRangeForKnownValues = newRange => {
  if (newRange.bombs === newRange.cells.length) {
    view.knownBombRanges.push(newRange);
    newRange.complete = true;
  } else if (newRange.bombs === 0) {
    view.knownSafeRanges.push(newRange);
    newRange.complete = true;
  }
}
const createRanges = (view, dimentions, { x, y }) => {
  let newRange = Object.create(blankRange);
  newRange.bombs = view.stage[x][y].count;
  newRange.cells = [];
  intersectingRanges = new Set();
  surronudingCells({ x, y }, dimentions, (xoff, yoff) => {
    const surrondingCell = view.stage[xoff][yoff];
    if (surrondingCell.isMarked) {
      newRange.bombs--;
    } else {
      if (!surrondingCell.isKnown) {
        newRange.cells.push({ x: xoff, y: yoff });
        surrondingCell.ranges = [...surrondingCell.ranges ?? [], newRange];
        surrondingCell.ranges.forEach(range => intersectingRanges.add(range));
      }
    }
  })
  intersectingRanges.forEach(range => {
    splitRanges(view, range, newRange);
  })
  if (newRange.cells.reduce((acc, cell) => view.stage[cell.x][cell.y].count < 0 ? acc + 1 : acc, 0) != newRange.bombs) {
    console.log("incorrect bombCount " + JSON.stringify(cell));
  }
  checkNewRangeForKnownValues(newRange);
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
const floodFill = (view, start, dimentions) => {
  view.firstMove= false;
  const { stage, changedCells } = view;
  const startCell = makeCellKnown(view, dimentions, start);
  if (!startCell) {
    return false;
  }
  if (startCell.count > 0) {
    return true;
  }
  if (startCell.count < 0) {
    return false;
  }
  toFill = [start];
  while (toFill.length > 0) {
    current = toFill.pop();
    const nextSteps = (current.steps ?? 0) + 1;
    surronudingCells(current, dimentions, (x, y) => {
      let newCell = stage[x][y];      
      if (!newCell.isKnown) {
        newCell.steps = nextSteps;
        makeCellKnown(view, dimentions, { x, y });
        if (newCell.count === 0) {
          toFill.unshift({ x, y, steps: nextSteps });
        }
      }
    });
  }
  return true;
}
const dimentions = { rows: 16, cols: 16, bombCount: 30 };
createStage(dimentions);
let view = createView(dimentions);
updateStage(view);
document.querySelector(`#inputs>#startButton`).addEventListener("click", () => {
  view = createView(dimentions);
  updateStage(view);
});

const nextStep = (view) => {
  
  const { knownBombRanges, knownSafeRanges } = view;
  while (knownBombRanges.length > 0 && view.changedCells.length == 0) {
    const cells = knownBombRanges.pop().cells;
    changed =
      cells.map(pos => markCellAsBomb(view, pos)).some(newVal => newVal);
  }


  while (knownSafeRanges.length > 0 && view.changedCells.length == 0) {
    changed = !knownSafeRanges.pop().cells
      .map(pos => floodFill(view, pos, dimentions)).some(newVal => newVal)
  }
  if (view.changedCells.length == 0) {
    let item, x, y;
    //worst case senario just guess
    do {
      x = getRndInteger(0, dimentions.cols);
      y = getRndInteger(0, dimentions.rows);
      item = view.stage[x][y];
      //if first move don't allow it to fail.
    } while (item.isKnown || item.isMarked || (view.firstMove && item.count !=0));
    floodFill(view, { x, y }, dimentions);
  }
};

document.querySelector(`#inputs>#stepButton`).addEventListener("click", (e) => {
  if (view.triggeredBomb || view.markedCount == dimentions.bombCount) {
    view = createView(dimentions);
  } else {
    nextStep(view);
  }
  updateStage(view);
});

const auto = async (max = 10000)=>{
  let runs = 0;
  let pass = 0;
  const start=Date.now();
  while (runs<max) {
    await new Promise(res=>{
      setTimeout(()=>{
        if (view.triggeredBomb || view.markedCount == dimentions.bombCount) {
          updateStage(view);
          if(!view.triggeredBomb){
            pass+=1;
          }
        runs+=1;
        view = createView(dimentions);
        } else {
        nextStep(view);
        view.changedCells = [];
        }
        res();
      },0); 
    })
    
  }
    end=Date.now();
   return {runs,pass,timediff:(end-start).toTimeString()};
}
const autoNoRefresh = async (max = 10000)=>{
  let runs = 0;
  let pass = 0;
  const start=Date.now();
  while (runs<max) {
    await new Promise(res=>{
      setTimeout(()=>{
        if (view.triggeredBomb || view.markedCount == dimentions.bombCount) {
          if(!view.triggeredBomb){
            pass+=1;
          }
        runs+=1;
        view = createView(dimentions);
        } else {
        nextStep(view);
        view.changedCells = [];
        }
        res();
      },0); 
    })
    
  }
  end=Date.now();
   return {runs,pass,timediff:(end-start).toTimeString()};
};