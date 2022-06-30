

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
interface leaf extends nodeBase {
  type: "leaf",
  payload: number,
  height: 0,
  ballanceFactor: 0,
}
interface branch extends nodeBase {
  type: "branch"
  payload: number
  left: node
  right: node
}

type node = empty | leaf | branch

type error = string


const updateBallanceInformation = (node: branch): void => {
  node.height = Math.max(node.left.height, node.right.height) + 1;
  node.ballanceFactor = node.right.height - node.left.height;
}
const ballanceNode = (root: node): node | error => {
  const rotateRight = (root: node): node | error => {
    if (root.type != "branch" || root.left.type != "branch") {
      return "can only rotate branches"
    }
    const newRoot = root.left;
    const middle = newRoot.right;
    newRoot.right = root;
    root.left = middle;
    updateBallanceInformation(root);
    updateBallanceInformation(newRoot);
    return newRoot;
  }
  const rotateLeft = (root: node): node | error => {
    if (root.type != "branch" || root.right.type != "branch") {
      return "can only rotate branches"
    }
    const newRoot = root.right;
    const middle = newRoot.left;
    newRoot.left = root;
    root.right = middle;
    updateBallanceInformation(root);
    updateBallanceInformation(newRoot);
    return newRoot;
  }
  const rotateRightLeft = (root: node): node | error => {
    if (root.type != "branch"
      || root.right.type != "branch"
      || root.right.left.type != "branch") {
      return "can only rotate branches"
    }
    const newRight = rotateRight(root.right);
    if (typeof newRight == "string") {
      return newRight
    }
    root.right = newRight;
    return rotateLeft(root);
  }
  const rotateLeftRight = (root: node): node | error => {
    if (root.type != "branch"
      || root.left.type != "branch"
      || root.left.right.type != "branch") {
      return "can only rotate branches"
    }
    const newleft = rotateLeft(root.left);
    if (typeof newleft == "string") {
      return newleft
    }
    root.left = newleft;
    return rotateLeft(root);
  }
  if (root.type != "branch") {
    return "can only ballance branches"
  }
  if (root.ballanceFactor > 0) {
    // right heavy
    if (root.right.type != "branch") {
      return "how is the right side heavy but not a branch?"
    }
    if (root.ballanceFactor < 0) {
      return rotateRightLeft(root)
    } else {
      return rotateLeft(root)
    }
  } else {
    // left heavy
    if (root.left.type != "branch") {
      return "how is the left side heavy but not a branch?"
    }
    if (root.ballanceFactor > 0) {
      return rotateLeftRight(root)
    } else {
      return rotateRight(root)
    }
  }
}

const emptyNode: empty = { type: "empty", height: 0, ballanceFactor: 0 }
const insert = (root: node, value: number): node | error => {
  if (root.type == "empty") {
    return {
      type: "leaf",
      payload: value,
      ballanceFactor: 0,
      height: 0
    }
  } else if (root.type == "leaf") {
    if (value > root.payload) {
      return {
        type: "branch",
        payload: value,
        height: 1,
        left: root,
        right: emptyNode,
        ballanceFactor: -1
      }
    } else if (value == root.payload) {
      return root
    } else {
      return {
        type: "branch",
        payload: value,
        height: 1,
        left: emptyNode,
        right: root,
        ballanceFactor: 1
      }
    }
  } else if (root.type == "branch") {
    if (value > root.payload) {
      const updatedSubtree = insert(root.right, value);
      if (typeof updatedSubtree == "string") {
        return updatedSubtree
      }
      root.right = updatedSubtree
    } else if (value == root.payload) {
      return root
    } else {
      const updatedSubtree = insert(root.left, value);
      if (typeof updatedSubtree == "string") {
        return updatedSubtree
      }
      root.left = updatedSubtree
    }

    updateBallanceInformation(root);
    const ballanceDiff = Math.abs(root.ballanceFactor);
    if (ballanceDiff == 2) {
      return ballanceNode(root)
    } else if (ballanceDiff > 2) {
      return "cannot re-ballance diffrance more than 2"
    } else {
      //no ballancing needed 
      return root
    }
  }
  return "missing node type"
}
const toTree = (items: number[]): node | error => {
  let tree: node | error = emptyNode
  for (let item of items) {
    if (typeof tree == "string") {
      return tree;
    }
    tree = insert(tree, item);
  }
  return tree;
}

export { emptyNode, insert, toTree }