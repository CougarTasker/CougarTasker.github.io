
const createStage = ({ rows, cols }) => {
  const game = document.getElementById("game");
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const space = document.createElement('div');
      space.setAttribute('game-x', x.toString());
      space.setAttribute('game-y', y.toString());
      space.setAttribute("game-is-known", false);
      space.addEventListener("click", (e) => {
        const x = parseInt(e.target.getAttribute('game-x'), 10);
        const y = parseInt(e.target.getAttribute('game-y'), 10);
        floodFill(view, { x, y }, dimentions);
        updateStage(view);
      });
      game.appendChild(space);
    }
  }
}
const createView = ({ rows, cols, bombCount }) => {
  let stage = [];
  let changedCells = [];
  let blankCell = { isKnown: false, count: 0 };
  for (let x = 0; x < cols; x++) {
    let row = [];
    for (let y = 0; y < rows; y++) {
      row[y] = Object.create(blankCell);
    }
    stage[x] = row;
  }
  // min (included) and max (excluded):
  const getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  const incrementSurronding = (x, y) => {
    const range = {
      x: {
        min: Math.max(0, x - 1),
        max: Math.min(rows - 1, x + 1)
      },
      y: {
        min: Math.max(0, y - 1),
        max: Math.min(cols - 1, y + 1)
      }
    }

    for (let offX = range.x.min; offX <= range.x.max; offX++) {
      for (let offY = range.y.min; offY <= range.y.max; offY++) {
        if (offX !== x || offY !== y) {
          const outsideItem = stage[offX][offY]
          if (outsideItem.count >= 0) {
            outsideItem.count++;
          }
        }
      }
    }
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
  return { stage, changedCells };
}

const updateStage = ({ stage, changedCells }) => {
  let cell;
  const updateCell = (x, y) => {
    const htmlCell = document.querySelector(`div[game-x = "${x}"][game-y = "${y}"]`);
    htmlCell.textContent = stage[x][y].count;
    htmlCell.setAttribute("game-is-known", stage[x][y].isKnown);
    htmlCell.setAttribute("game-is-bomb", stage[x][y].count < 0);
  }
  if (changedCells.length === 0) {
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

const floodFill = ({ stage, changedCells }, start, { rows, cols }) => {

  const startCell = stage[start.x][start.y];
  startCell.isKnown = true;
  changedCells.push(start);
  if (startCell.count > 0) {
    return;
  }
  if (startCell.count < 0) {
    return;
  }
  toFill = [start];
  const expand = (x, y, testInBounds) => {
    if (testInBounds(x, y)) {
      let newCell = stage[x][y];
      if (!newCell.isKnown) {
        newCell.isKnown = true;
        changedCells.push({ x, y });
        if (newCell.count === 0) {
          toFill.unshift({ x, y });
        }
      }
    }
  }

  while (toFill.length > 0) {
    const { x, y } = toFill.pop();
    expand(x - 1, y, x => x >= 0);
    expand(x + 1, y, x => x < cols);
    expand(x, y - 1, (x, y) => y >= 0);
    expand(x, y + 1, (x, y) => y < rows);

    expand(x - 1, y - 1, x => (x, y) => x >= 0    && y >= 0);
    expand(x - 1, y + 1, x => (x, y) => x >= 0    && y < rows);
    expand(x + 1, y - 1, x => (x, y) => x < cols  && y >= 0);
    expand(x + 1, y + 1, x => (x, y) => x < cols  && y < rows);
  }
}
const dimentions = { rows: 16, cols: 16, bombCount: 30 };
createStage(dimentions);
const view = createView(dimentions);
document.querySelector(`#inputs>.button`).addEventListener("click", () => {
  updateStage(view);
});

