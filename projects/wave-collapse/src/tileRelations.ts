import { Map, Set } from "immutable";
import { CellCoordinates, coordinatesHash, hashCoordinates } from "./TileCoordinates";
import { TileName } from "./TileName";

type mustContainAny = Map<coordinatesHash, [CellCoordinates, Set<TileName>]>;

type MapTypes<T> = T extends Map<infer K, infer V>
  ? { key: K; value: V }
  : never;

type tileAdjacencyRules = Map<TileName, mustContainAny>;

const directions: Record<"up" | "down" | "left" | "right", CellCoordinates> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
function updateDirectionToInclude(
  base: TileName,
  offset: CellCoordinates,
  adjacent: TileName,
  rules: tileAdjacencyRules
): tileAdjacencyRules {
  const existingRules = rules.get(base) || Map();
   const offsetHash = hashCoordinates(offset);
  const existingTiles: Set<TileName> =
    existingRules.get(offsetHash)?.[1] || Set();
 
  return rules.set(
    base,
    existingRules.set(offsetHash, [
      offset,
      existingTiles.add(adjacent),
    ])
  );
}
type relationMutator = (input: tileAdjacencyRules) => tileAdjacencyRules;
const vertical =
  (top: TileName, bottom: TileName): relationMutator =>
  (rules) => {
    const topUpdated = updateDirectionToInclude(
      top,
      directions.down,
      bottom,
      rules
    );
    return updateDirectionToInclude(bottom, directions.up, top, topUpdated);
  };

const horizontal =
  (left: TileName, right: TileName): relationMutator =>
  (rules) => {
    const leftUpdated = updateDirectionToInclude(
      left,
      directions.right,
      right,
      rules
    );
    return updateDirectionToInclude(right, directions.left, left, leftUpdated);
  };

const fourSides =
  (
    base: TileName,
    top: TileName,
    bottom: TileName,
    left: TileName,
    right: TileName
  ): relationMutator =>
    buildRelations(
      vertical(top, base),
      vertical(base, bottom),
      horizontal(left, base),
      horizontal(base, right)
    );

function buildRelations(
  ...relationBuilders: relationMutator[]
): relationMutator {
  return (rules: tileAdjacencyRules) => {
    return relationBuilders.reduce((val, builder) => builder(val), rules);
  }
}
const e = TileName.Empty;
export const tileRelations = buildRelations(
  vertical(e, e),
  horizontal(e, e),
  fourSides(TileName.GrassMiddle, e, e, e, e)
)(Map());
