import { PossibleTileGrid } from "./collapse";

export function cellIsEmpty(grid:PossibleTileGrid){
  const isEmpty = grid.some(({possibilities})=> possibilities.size === 0)
  if(isEmpty){
    console.error("empty option")
  }
}