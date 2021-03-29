
const createStage = ({ rows, cols }) => {
  const game = document.getElementById("game");
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const space = document.createElement('div');
      space.setAttribute('game-x', x.toString());
      space.setAttribute('game-y', y.toString());
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
      changedCells.push({ x, y });
    }
    stage[x] = row;
  }
  // min (included) and max (excluded):
  const getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  const incrementSurronding = (x, y) => {
    const range = {
      x:{
        min: Math.max(0, x-1),
        max: Math.min(rows-1, x + 1)
      },
      y:{
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
  while (cell = changedCells.pop()) {
    const { x, y } = cell;
    const htmlCell = document.querySelector(`div[game-x = "${x}"][game-y = "${y}"]`);
    htmlCell.textContent = stage[x][y].count;
  }
}

const dimentions = { rows: 16, cols: 16, bombCount: 10 };
createStage(dimentions);

document.querySelector(`#inputs>.button`).addEventListener("click",()=>{
  
  const view = createView(dimentions);
  updateStage(view);
});

document.querySelector(`#game>div`).addEventListener("click", (e) => {
  const x = e.target.setAttribute('game-x');
  const y = e.target.setAttribute('game-y');
});