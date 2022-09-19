/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/tiles.png":
/*!***********************!*\
  !*** ./src/tiles.png ***!
  \***********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "5ff2c90ca96b1c9afd65.png";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tiles_png__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tiles.png */ "./src/tiles.png");

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
    red: "#ed254e",
};
var options = {
    numberOfColumns: function () { return 10; },
    numberOfRows: function () {
        return Math.floor(canvasContainer.offsetHeight / options.cellSize());
    },
    gameSizeFactor: function () { return 0.9; },
    cellSize: function () {
        return Math.floor((canvasContainer.offsetWidth * options.gameSizeFactor()) /
            options.numberOfColumns());
    },
};
var updateSize = function () {
    canvas.width = options.cellSize() * options.numberOfColumns();
    canvas.height = options.cellSize() * options.numberOfRows();
};
var tileMap = new Image();
window.addEventListener("load", function () {
    tileMap.src = _tiles_png__WEBPACK_IMPORTED_MODULE_0__; // Set source path
    tileMap.addEventListener("load", renderLoop, false);
    window.addEventListener("resize", updateSize);
    updateSize();
});
var renderLoop = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var grid = getTileGrid();
    for (var _i = 0, grid_1 = grid; _i < grid_1.length; _i++) {
        var binding = grid_1[_i];
        drawTile(binding.tile, binding.cell);
    }
    window.requestAnimationFrame(renderLoop);
};
var tileMapProperties = {
    width: function () { return tileMap.naturalWidth; },
    height: function () { return tileMap.naturalWidth; },
    tileWidth: function () { return 16; },
    tileHeight: function () { return 16; },
    rows: function () { return tileMapProperties.width() / tileMapProperties.tileWidth(); },
    columns: function () { return tileMapProperties.height() / tileMapProperties.tileHeight(); },
};
var drawTile = function (tile, cell) {
    ctx.drawImage(tileMap, tile.x * tileMapProperties.tileWidth(), tile.y * tileMapProperties.tileHeight(), tileMapProperties.tileWidth(), tileMapProperties.tileHeight(), cell.x * options.cellSize(), cell.y * options.cellSize(), options.cellSize() - 2, options.cellSize() - 2);
};
function getTileGrid() {
    return [
        {
            cell: { x: 0, y: 0 },
            tile: { x: 0, y: 0 },
        },
    ];
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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T0FBTztRQUNMO1lBQ0UsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ3BCLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtTQUNyQjtLQUNGLENBQUM7QUFDSixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2F2ZS1jb2xsYXBzZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vd2F2ZS1jb2xsYXBzZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dhdmUtY29sbGFwc2Uvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vd2F2ZS1jb2xsYXBzZS8uL3NyYy9nYW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHNjcmlwdFVybCA9IHNjcmlwdHNbc2NyaXB0cy5sZW5ndGggLSAxXS5zcmNcblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiaW1wb3J0IFRpbGVNYXBJbWFnZSBmcm9tIFwiLi90aWxlcy5wbmdcIjtcblxuY29uc3QgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gIFwiLmNhbnZhcy1jb250YWluZXIgY2FudmFzXCJcbik7XG5jb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuY29uc3QgY2FudmFzQ29udGFpbmVyOiBIVE1MRWxlbWVudCA9XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FudmFzLWNvbnRhaW5lclwiKTtcblxuY29uc3QgY29sb3JzID0ge1xuICBibGFjazogXCIjMjkyZTFlXCIsXG4gIGRhcmtCbGFjazogXCIjMGUwZjBhXCIsXG4gIHdoaXRlOiBcIiNmN2ZmZjdcIixcbiAgYmx1ZTogXCIjN2JkZmYyXCIsXG4gIGdyZWVuOiBcIiM5Y2RlOWZcIixcbiAgdGVhbDogXCIjNDhhOWE2XCIsXG4gIG9yYW5nZTogXCIjZmY4ODExXCIsXG4gIHJlZDogXCIjZWQyNTRlXCIsXG59O1xuY29uc3Qgb3B0aW9ucyA9IHtcbiAgbnVtYmVyT2ZDb2x1bW5zOiAoKSA9PiAxMCxcbiAgbnVtYmVyT2ZSb3dzOiAoKSA9PlxuICAgIE1hdGguZmxvb3IoY2FudmFzQ29udGFpbmVyLm9mZnNldEhlaWdodCAvIG9wdGlvbnMuY2VsbFNpemUoKSksXG4gIGdhbWVTaXplRmFjdG9yOiAoKSA9PiAwLjksXG4gIGNlbGxTaXplOiAoKSA9PlxuICAgIE1hdGguZmxvb3IoXG4gICAgICAoY2FudmFzQ29udGFpbmVyLm9mZnNldFdpZHRoICogb3B0aW9ucy5nYW1lU2l6ZUZhY3RvcigpKSAvXG4gICAgICAgIG9wdGlvbnMubnVtYmVyT2ZDb2x1bW5zKClcbiAgICApLFxufTtcbmNvbnN0IHVwZGF0ZVNpemUgPSAoKSA9PiB7XG4gIGNhbnZhcy53aWR0aCA9IG9wdGlvbnMuY2VsbFNpemUoKSAqIG9wdGlvbnMubnVtYmVyT2ZDb2x1bW5zKCk7XG4gIGNhbnZhcy5oZWlnaHQgPSBvcHRpb25zLmNlbGxTaXplKCkgKiBvcHRpb25zLm51bWJlck9mUm93cygpO1xufTtcblxuY29uc3QgdGlsZU1hcCA9IG5ldyBJbWFnZSgpO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKCkgPT4ge1xuICB0aWxlTWFwLnNyYyA9IFRpbGVNYXBJbWFnZTsgLy8gU2V0IHNvdXJjZSBwYXRoXG4gIHRpbGVNYXAuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgcmVuZGVyTG9vcCwgZmFsc2UpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB1cGRhdGVTaXplKTtcbiAgdXBkYXRlU2l6ZSgpO1xufSk7XG5pbnRlcmZhY2UgQ29vcmRpbmF0ZXMge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbn1cbnR5cGUgQ2VsbENvb3JkaW5hdGVzID0gQ29vcmRpbmF0ZXM7XG50eXBlIFRpbGVDb29yZGluYXRlcyA9IENvb3JkaW5hdGVzO1xuXG5jb25zdCByZW5kZXJMb29wID0gKCkgPT4ge1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gIGNvbnN0IGdyaWQ6IFRpbGVHcmlkID0gZ2V0VGlsZUdyaWQoKTtcbiAgZm9yIChjb25zdCBiaW5kaW5nIG9mIGdyaWQpIHtcbiAgICBkcmF3VGlsZShiaW5kaW5nLnRpbGUsIGJpbmRpbmcuY2VsbCk7XG4gIH1cbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJMb29wKTtcbn07XG5cbmNvbnN0IHRpbGVNYXBQcm9wZXJ0aWVzID0ge1xuICB3aWR0aDogKCkgPT4gdGlsZU1hcC5uYXR1cmFsV2lkdGgsXG4gIGhlaWdodDogKCkgPT4gdGlsZU1hcC5uYXR1cmFsV2lkdGgsXG4gIHRpbGVXaWR0aDogKCkgPT4gMTYsXG4gIHRpbGVIZWlnaHQ6ICgpID0+IDE2LFxuICByb3dzOiAoKSA9PiB0aWxlTWFwUHJvcGVydGllcy53aWR0aCgpIC8gdGlsZU1hcFByb3BlcnRpZXMudGlsZVdpZHRoKCksXG4gIGNvbHVtbnM6ICgpID0+IHRpbGVNYXBQcm9wZXJ0aWVzLmhlaWdodCgpIC8gdGlsZU1hcFByb3BlcnRpZXMudGlsZUhlaWdodCgpLFxufTtcblxuY29uc3QgZHJhd1RpbGUgPSAodGlsZTogVGlsZUNvb3JkaW5hdGVzLCBjZWxsOiBDZWxsQ29vcmRpbmF0ZXMpID0+IHtcbiAgY3R4LmRyYXdJbWFnZShcbiAgICB0aWxlTWFwLFxuICAgIHRpbGUueCAqIHRpbGVNYXBQcm9wZXJ0aWVzLnRpbGVXaWR0aCgpLFxuICAgIHRpbGUueSAqIHRpbGVNYXBQcm9wZXJ0aWVzLnRpbGVIZWlnaHQoKSxcbiAgICB0aWxlTWFwUHJvcGVydGllcy50aWxlV2lkdGgoKSxcbiAgICB0aWxlTWFwUHJvcGVydGllcy50aWxlSGVpZ2h0KCksXG4gICAgY2VsbC54ICogb3B0aW9ucy5jZWxsU2l6ZSgpLFxuICAgIGNlbGwueSAqIG9wdGlvbnMuY2VsbFNpemUoKSxcbiAgICBvcHRpb25zLmNlbGxTaXplKCkgLSAyLFxuICAgIG9wdGlvbnMuY2VsbFNpemUoKSAtIDJcbiAgKTtcbn07XG5cbnR5cGUgVGlsZUdyaWQgPSB7IGNlbGw6IENlbGxDb29yZGluYXRlczsgdGlsZTogVGlsZUNvb3JkaW5hdGVzIH1bXTtcblxuZnVuY3Rpb24gZ2V0VGlsZUdyaWQoKTogVGlsZUdyaWQge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIGNlbGw6IHsgeDogMCwgeTogMCB9LFxuICAgICAgdGlsZTogeyB4OiAwLCB5OiAwIH0sXG4gICAgfSxcbiAgXTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==