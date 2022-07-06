


type fatNode<T> = {
  empty:boolean,
  height:number,
  ballanceFactor?:number
  payload?:
  left?:
  right?:
}[]



type node<T> = {
  height: number,
  ballanceFactor:number,
  empty: null | {
    payload: value<T>,
    left: node<T>,
    right:  node<T>
  }
}



type value<T> = {
  hash: number,
  value: T
}
type valueComparison<T> = {
  hash: (value: T) => number,
  equal: (a: T, b: T) => boolean
}



const comparisonMethods = <T>(comp: valueComparison<T>) => {
  return {
    wrap: (a: T): value<T> => { return { hash: comp.hash(a), value: a } },
    compare: (l: value<T>, r: value<T>): -1 | 0 | 1 => {
      if (l.hash < r.hash) {
        return -1
      } else if (l.hash == r.hash && comp.equal(l.value, r.value)) {
        return 0
      } else {
        return 1
      }
    }
  }
}

type version = {
  id: number,
  previous: version | null
}






const updateBallanceInformation = <T>(node: branchAny<T>): branchAny<T> => {
  node.height = Math.max(node.left.height, node.right.height) + 1;
  node.ballanceFactor = node.right.height - node.left.height;
}

const reballanceNode = <T>(node: branchAny<T>): branchAny<T> => {
  updateBallanceInformation(node);
  const ballanceDiff = Math.abs(node.ballanceFactor);
  if (ballanceDiff == 2) {
    return ballanceNode(node)
  } else {
    //no ballancing needed 
    return node;
  }
}
const ballanceNode = <T>(root: branchAny<T>): branchAny<T> => {
  const rotateRight = <T>(root: branchLeft<T>): branchRight<T> => {
    const middle = root.left.right;
    const newChild: branchAny<T> = {
      ...root,
      left: middle
    }
    const newRoot: branchRight<T> = {
      ...root.left,
      right: newChild
    }
    updateBallanceInformation(newChild);
    updateBallanceInformation(newRoot);
    return newRoot;
  }
  const rotateLeft = <T>(root: branchRight<T>): branchLeft<T> => {
    const middle = root.right.left;
    const newChild: branchAny<T> = {
      ...root,
      right: middle
    }
    const newRoot: branchLeft<T> = {
      ...root.right,
      left: newChild
    }
    updateBallanceInformation(newChild);
    updateBallanceInformation(newRoot);
    return newRoot;
  }

  // double rotations actually guarntee a branch with two branch children

  const rotateRightLeft = (root: branchRightLeft<T>): branchAny<T> => {
    return rotateLeft({
      ...root,
      right: rotateRight(root.right)
    });
  }
  const rotateLeftRight = (root: branchLeftRight<T>): branchAny<T> => {
    return rotateRight({
      ...root,
      left: rotateLeft(root.
        left)
    });
  }

  if (root.ballanceFactor > 0) {
    // right heavy 
    if (root.ballanceFactor < 0) {
      // @ts-ignore rl heavy 
      return rotateRightLeft(root)
    } else {
      // @ts-ignore
      return rotateLeft(root)
    }
  } else {
    // left heavy
    if (root.ballanceFactor > 0) {
      // @ts-ignore lr heavy
      return rotateLeftRight(root)
    } else {
      // @ts-ignore
      return rotateRight(root)
    }
  }
}

const emptyNode: empty = { type: "empty", height: 0, ballanceFactor: 0 }
const insertValue = <T>(root: node<T>, value: T, compare: valueComparison<T>): node<T> => {
  const hash = compare.hash(value);
  if (root.type == "empty") {
    return {
      type: "branch",
      ballanceFactor: 0,
      height: 1,
      payload: { value, hash },
      left: emptyNode,
      right: emptyNode
    }
  } else if (root.type == "branch") {
    let newRoot: branchAny<T>
    if (hash > root.payload.hash) {
      newRoot = {
        ...root,
        right: insertValue(root.right, value, compare)
      }
    } else if (hash == root.payload.hash && compare.equal(value, root.payload.value)) {
      return root
    } else {
      newRoot = {
        ...root,
        left: insertValue(root.left, value, compare)
      }
    }

    return updateBallanceInformation(newRoot);
  } else {
    return emptyNode;
  }
}

const deleteLeftMost = <T>(root: node<T>): { left: node<T>, bottom: node<T> } => {
  if (root.type == "branch") {
    if (root.left.type != "empty") {
      const recursionResult = deleteLeftMost(root.left);
      const newRoot = {
        ...root,
        left: recursionResult.left
      }
      return {
        left: updateBallanceInformation(newRoot),
        bottom: recursionResult.bottom
      };
    } else {
      // no further left option
      if (root.right.type == "empty") {
        return { left: emptyNode, bottom: root }
      } else {
        return { left: root.right, bottom: root }
      }

    }
  } else {
    // empty
    return { left: emptyNode, bottom: emptyNode }
  }

}

const deleteValue = <T>(root: node<T>, value: T, compare: valueComparison<T>): node<T> => {
  const hash = compare.hash(value);
  if (root.type == "empty") {
    return emptyNode
  } else if (root.type == "branch") {
    let newRoot
    if (hash > root.payload.hash) {
      newRoot = {
        ...root,
        right: deleteValue(root.right, value, compare)
      }
    } else if (hash == root.payload.hash && compare.equal(value, root.payload.value)) {
      // delete root node
      // replace with next node if there is one

      // simple case the root is allready a left or rightmost node
      if (root.right.type == "empty") {
        return root.left
      }
      if (root.left.type == "empty") {
        return root.right
      }
      const { left: rightChild, bottom } = deleteLeftMost(root.right);
      newRoot = {
        ...bottom,
        right: rightChild,
        left: root.left
      }
    } else {
      newRoot = {
        ...root,
        left: deleteValue(root.left, value, compare)
      }
    }

    return updateBallanceInformation(newRoot);;
  } else {
    return emptyNode
  }
}
const hasValue = <T>(root: node<T>, value: T, compare: valueComparison<T>): boolean => {
  const hash = compare.hash(value);
  if (root.type == "empty") {
    return false
  }
  return root.type == "branch" &&
    (
      root.payload.hash == hash &&
      compare.equal(root.payload.value, value)
      || hasValue(root.left, value, compare)
      || hasValue(root.right, value, compare)
    )
}

const printInternalTree = <T>(root: node<T>,
  numberOfLabels: number): { nodes: string[], relationships: string[], root: number } => {
  if (root.type == "branch") {
    const leftPart = printInternalTree(root.left, numberOfLabels)
    const rootNode = numberOfLabels + leftPart.nodes.length
    const rightPart = printInternalTree(root.right, rootNode + 1)

    const thisPart = {
      nodes: [
        `C_${rootNode} [label="${root.payload.hash}"];`
      ],
      relationships: [leftPart.root, rightPart.root].filter(x => x >= 0).map(x => `C_${rootNode} -> C_${x};`)
    }
    return {
      nodes: leftPart.nodes.concat(thisPart.nodes).concat(rightPart.nodes),
      relationships: leftPart.relationships
        .concat(thisPart.relationships)
        .concat(rightPart.relationships),
      root: rootNode
    }
  } else {
    return { nodes: [], relationships: [], root: -1 }
  }
}

const numberCompare: valueComparison<number> = {
  hash: a => a,
  equal: (a, b) => a == b
}

const toTree = (items: number[]): node<number> => {
  let tree: node<number> = emptyNode
  for (let item of items) {
    if (typeof tree == "string") {
      return tree;
    }
    tree = insertValue(tree, item, numberCompare);
  }
  return tree;
}


class AVLTree<T>{
  #compare
  #root: node<T> = emptyNode
  constructor(compare: valueComparison<T>) {
    this.#compare = compare
  }
  add(value: T[] | T) {
    if (value instanceof Array) {
      for (let v of value) {
        this.#root = insertValue(this.#root, v, this.#compare);
      }
    } else {
      this.#root = insertValue(this.#root, value, this.#compare);
    }
  }
  delete(value: T[] | T) {
    if (value instanceof Array) {
      for (let v of value) {
        this.#root = deleteValue(this.#root, v, this.#compare);
      }
    } else {
      this.#root = deleteValue(this.#root, value, this.#compare);
    }
  }
  has(value: T): boolean {
    return hasValue(this.#root, value, this.#compare)
  }
  print(): string {
    const parts = printInternalTree(this.#root, 0);
    return `digraph treeInternal{
${parts.nodes.join('\n')}
${parts.relationships.join('\n')}
}`
  }
}
export default new AVLTree<number>(numberCompare)
export { emptyNode, insertValue, toTree, deleteValue, hasValue, numberCompare }