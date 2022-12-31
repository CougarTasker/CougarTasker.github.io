interface Coordinates {
  x: number;
  y: number;
}
export type CellCoordinates = Coordinates;
export type TileCoordinates = Coordinates;
const primeB = 49157;
const primeA = 98317;
export type coordinatesHash = number;

/**
 * converts a coordinate down to a single value
 * @param coords the location to hash
 * @returns a unique single number for this location
 */
export const hashCoordinates = (coords: Coordinates): coordinatesHash => coords.x * primeA + coords.y * primeB;
