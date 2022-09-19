import { Map, Set } from "immutable";
import { CellCoordinates, Options } from "./game";
import { COLLAPSE_FAILURE } from "./getPossibleTileGrid";
import { TileName } from "./TileName";

export type PossibleTileGrid = Map<CellCoordinates, Set<TileName>>;

export function isValidTile(
  tile: TileName,
  cell: CellCoordinates,
  grid: PossibleTileGrid
): boolean {
  return true;
}


export function collapseCell(
  tile: TileName,
  cell: CellCoordinates,
  grid: PossibleTileGrid
): PossibleTileGrid {
  return grid;
}

type collapse = (tile: TileName,
  cell: CellCoordinates,
  grid: PossibleTileGrid) => PossibleTileGrid | typeof COLLAPSE_FAILURE 


function chainCollapse(...chain:collapse[]):collapse{
  return (tile,cell,grid)=>{
    let res: ReturnType<collapse> = grid;
    for(const fun of chain){
      if (res === COLLAPSE_FAILURE) {
        return COLLAPSE_FAILURE;
      }
      res = fun(tile,cell,res)
    }
    return res
  }
}
function offset(x:number,y:number,
  grid:PossibleTileGrid,
  base:CellCoordinates={x:0,y:0},
  width: number = Options.numberOfColumns(),
  height: number = Options.numberOfRows()): Set<TileName> {
    const proper:CellCoordinates = {x:base.x+x, y:base.y+y}
    if(proper.x < 0 || proper.x >= width){
      return Set([TileName.Empty])
    }else if(proper.y < 0 || proper.y >= height){
      return Set([TileName.Empty])
    }
  }
function vertical(top:TileName,bottom:TileName):collapse {
    return (tile, cell, grid){
      return grid
      if(tile === top){

      }else if(tile === bottom){

      }else{
        return grid;
      }
    }
}