

interface nodeBase {
  type: string
  height: number
  ballanceFactor: number
}

interface empty extends nodeBase {
  type: "empty",
  height: 0,
  ballanceFactor: 0,
}
interface branch<L, R, T> extends nodeBase {
  type: "branch"
  payload: { value: T, hash: number }
  left: L
  right: R
}
type branchAny<T> = branch<node<T>, node<T>, T>
type leaf<T> = branch<empty, empty, T>
type branchLeft<T> = branch<branchAny<T>, node<T>, T>
type branchRight<T> = branch<node<T>, branchAny<T>, T>
type branchLeftRight<T> = branch<branchRight<T>, node<T>, T>
type branchRightLeft<T> = branch<node<T>, branchLeft<T>, T>
type node<T> = empty | branchAny<T>
type valueComparison<T> = {
  hash: (value: T) => number,
  equal: (a: T, b: T) => boolean
}


const updateBallanceInformation = <T>(node: branchAny<T>): void => {
  node.height = Math.max(node.left.height, node.right.height) + 1;
  node.ballanceFactor = node.right.height - node.left.height;
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

    updateBallanceInformation(newRoot);
    const ballanceDiff = Math.abs(newRoot.ballanceFactor);
    if (ballanceDiff == 2) {
      return ballanceNode(newRoot)
    } else {
      //no ballancing needed 
      return newRoot;
    }
  } else {
    return emptyNode;
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

export { emptyNode, insertValue as insert, toTree }