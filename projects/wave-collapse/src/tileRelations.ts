import { Map, Set } from "immutable";
import { CellCoordinates } from "./game";
import { TileName } from "./TileName";

type mustContainAny = Map<CellCoordinates, Set<TileName>>;


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
  const existingTiles = existingRules.get(offset) || Set();
  return rules.set(
    base,
    existingRules.set(offset, existingTiles.add(adjacent))
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
  (rules) =>
    buildRelations(
      vertical(top, base),
      vertical(base, bottom),
      horizontal(left, base),
      horizontal(base, right)
    );

function buildRelations(
  ...relationBuilders: relationMutator[]
): tileAdjacencyRules {
  const base: tileAdjacencyRules = Map();
  return relationBuilders.reduce((val, builder) => builder(val), base);
}
const e = TileName.Empty;
export const tileRelations = buildRelations(
  vertical(e, e),
  horizontal(e, e),
  fourSides(TileName.GrassMiddle, e, e, e, e)
);
