var canvas = document.querySelector(".canvas-container canvas");
var ctx = canvas.getContext("2d");
var canvasContainer = document.querySelector(".canvas-container");
var colors = {
    black: "#292e1e",
    darkBlack: "#0e0f0a",
    white: "#f7fff7",
    blue: "#7bdff2",
    green: "#9cde9f",
    teal: "#48a9a6",
    orange: "#ff8811",
    red: "#ed254e"
};
var options = {
    numberOfColumns: function () { return 10; },
    numberOfRows: function () { return Math.floor(canvasContainer.offsetHeight / options.cellSize()); },
    gameSizeFactor: function () { return 0.9; },
    cellSize: function () { return Math.floor(canvasContainer.offsetWidth * options.gameSizeFactor()
        / options.numberOfColumns()); }
};
var updateSize = function () {
    canvas.width = options.cellSize() * options.numberOfColumns();
    canvas.height = options.cellSize() * options.numberOfRows();
};
updateSize();
var tileMap = new Image();
window.addEventListener('load', function () {
    tileMap.src = './tiles.png'; // Set source path
    tileMap.addEventListener('load', renderLoop, false);
    window.addEventListener('resize', updateSize);
});
var renderLoop = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // for(i in tiles){
    //   tiles[i].draw(
    //     { x: i % options.numberOfColumns(), 
    //       y: Math.floor(i / options.numberOfColumns()) 
    //     });
    // }
    state = [];
    for (x = 0; x < options.numberOfColumns(); x++) {
        for (y = 0; y < options.numberOfRows(); y++) {
        }
    }
    window.requestAnimationFrame(renderLoop);
};
var tileMapProperties = {
    width: function () { return tileMap.naturalWidth(); },
    height: function () { return tileMap.naturalWidth(); },
    tileWidth: function () { return 16; },
    tileHeight: function () { return 16; },
    rows: function () { return tileMapProperties.width() / tileMapProperties.tileWidth(); },
    columns: function () { return tileMapProperties.height() / tileMapProperties.tileHeight(); }
};
var drawTile = function (tile, cell) {
    ctx.drawImage(tileMap, tile.x * tileMapProperties.tileWidth(), tile.y * tileMapProperties.tileHeight(), tileMapProperties.tileWidth(), tileMapProperties.tileHeight(), cell.x * options.cellSize(), cell.y * options.cellSize(), (options.cellSize() - 2), (options.cellSize() - 2));
};
var cur = 0;
var tiles = [
    {
        draw: function (cell) { return drawTile({ x: 0, y: 0 }, cell); },
        name: "GrassLeft",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 1, y: 0 }, cell); },
        name: "GrassMiddle",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 2, y: 0 }, cell); },
        name: "GrassRight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 3, y: 0 }, cell); },
        name: "HalfGrassLeft",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 4, y: 0 }, cell); },
        name: "HalfGrassRight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 5, y: 0 }, cell); },
        name: "lightDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 6, y: 0 }, cell); },
        name: "LightToDarkDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 7, y: 0 }, cell); },
        name: "DarkestDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 0, y: 1 }, cell); },
        name: "LeftDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 1, y: 1 }, cell); },
        name: "MediumDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 2, y: 1 }, cell); },
        name: "RightDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 3, y: 1 }, cell); },
        name: "slightBottomLeftHighlightDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 4, y: 1 }, cell); },
        name: "slightBottomRightHighlightDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 5, y: 1 }, cell); },
        name: "slightTopHighlightDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 6, y: 1 }, cell); },
        name: "slightBottomHighlightDirt",
        constraints: []
    },
    {
        draw: function (cell) { },
        name: "empty",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 0, y: 2 }, cell); },
        name: "leftBottomDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 1, y: 2 }, cell); },
        name: "MiddleBottomDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 2, y: 2 }, cell); },
        name: "RightBottomDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 5, y: 2 }, cell); },
        name: "singleDirt",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 0, y: 3 }, cell); },
        name: "rockTopLeft",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 1, y: 3 }, cell); },
        name: "rockTop",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 2, y: 3 }, cell); },
        name: "rockTopRight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 3, y: 3 }, cell); },
        name: "rockTopLeftHighlight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 4, y: 3 }, cell); },
        name: "rockTopRightHighlight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 5, y: 3 }, cell); },
        name: "StoneTopLeft",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 6, y: 3 }, cell); },
        name: "StoneTop",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 7, y: 3 }, cell); },
        name: "StoneTopRight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 0, y: 4 }, cell); },
        name: "rockleft",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 1, y: 4 }, cell); },
        name: "rockDark",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 2, y: 4 }, cell); },
        name: "rockRight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 3, y: 4 }, cell); },
        name: "rockBottomLeftHighlight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 4, y: 4 }, cell); },
        name: "rockBottomRightHighlight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 5, y: 4 }, cell); },
        name: "StoneLeft",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 6, y: 4 }, cell); },
        name: "StoneMiddle",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 7, y: 4 }, cell); },
        name: "StoneRight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 0, y: 5 }, cell); },
        name: "rockBottomLeft",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 1, y: 5 }, cell); },
        name: "rockBottom",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 2, y: 5 }, cell); },
        name: "rockBottomRight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 3, y: 5 }, cell); },
        name: "rockForwardsDiagoinalHighlight",
        constraints: []
    },
    {
        draw: function (cell) { return drawTile({ x: 4, y: 5 }, cell); },
        name: "rockBackwardsDiagonalHighlight",
        constraints: []
    }
];
