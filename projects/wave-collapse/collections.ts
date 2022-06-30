
interface empty {
  type: "empty"
}
interface leaf {
  type: "leaf"
  payload: number
}
interface branch {
  type: "branch"
  payload: number
  left: node
  right: node
}
type node = leaf | branch | empty
type error = string



const ballanceTree = (root: node): node => {
  const rotateRight = (root: node): node | error => {
    if (root.type != "branch" || root.left.type != "branch") {
      return "can only rotate branches"
    }
    const newRoot = root.left;
    const middle = newRoot.right;
    newRoot.right = root;
    root.left = middle;
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
}


