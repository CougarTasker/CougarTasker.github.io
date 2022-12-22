import { Set, Map, Collection } from "immutable";

const randomIndex = (size: number) => Math.floor(size * Math.random());
export function selectRandomElementFromCollection<K>(
  set: Set<K>): [K | undefined, Set<K>];
export function selectRandomElementFromCollection<K, V>(
  map: Map<K, V>): [[K, V] | undefined, Collection<K, V>];
export function selectRandomElementFromCollection<K, V>(
  map: Map<K, V> | Set<K>): [[K, V] | undefined, Collection<K, V>] | [K | undefined, Set<K>] {
  if (Set.isSet(map)) {
    let index = randomIndex(map.count());
    const element = map.find(() => {
      index -= 1;
      return index < 0;
    });
    if (element === undefined) {
      return [undefined, map];
    }
    return [element, map.filter((val) => val !== element)];
  }
  let index = randomIndex(map.count());
  const element = map.findEntry(() => {
    index -= 1;
    return index < 0;
  });
  if (element === undefined) {
    return [undefined, map];
  }
  return [element, map.filter((_, key) => key !== element[0])];
}
