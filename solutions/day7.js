/*
* This one needs to be run by piping in your text on the command line
*
* Example usage (from bash:
*
* cat input.txt | node day7.js
*/

const R = require("ramda");

const readline = require("readline");
const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
let inputLines = [];
r1.on("close", () => {
  run(inputLines);
});
r1.on("line", line => {
  inputLines = [...inputLines, line];
});

const inputParseExpr = /(.*)\s\((.*)\)( -> (.*))?/;

const parseInputLine = R.pipe(
  R.bind(inputParseExpr.exec, inputParseExpr),
  matches => [matches[1], matches[2], matches[4]],
  ([name, weightStr, childrenStr]) => ({
    name,
    weight: Number(weightStr),
    children: R.isNil(childrenStr) ? null : R.split(", ", childrenStr)
  })
);
const parseInput = R.map(parseInputLine);

const associateParents = nodes =>
  R.reduce(
    (acc, node) =>
      R.ifElse(
        R.propEq("children", null),
        R.always(acc),
        R.pipe(
          R.prop("children"),
          R.reduce(
            (iAcc, child) =>
              R.set(R.lensPath([child, "parent"]), node.name, iAcc),
            acc
          )
        )
      )(node),
    R.indexBy(R.prop("name"), nodes),
    nodes
  );

const buildDoubleLinkedTree = R.pipe(parseInput, associateParents);
const findRootNode = R.find(R.pipe(R.prop("parent"), R.isNil));

const getChildren = tree => node =>
  R.pipe(R.prop("children"), R.map(R.prop(R.__, tree)))(node);

const getBranchWeight = tree => node =>
  R.ifElse(
    R.propEq("children", null),
    R.always([]),
    R.pipe(getChildren(tree), children =>
      R.pipe(
        R.pluck("weight"),
        w => [w, R.map(getBranchWeight(tree), children)],
        R.flatten,
        R.sum
      )(children)
    )
  )(node);

const getPgmWithDifferentWeight = pgms =>
  R.pipe(
    R.countBy(R.prop("branchWeight")),
    R.invert,
    R.prop(1),
    R.ifElse(
      R.isNil,
      R.always(null),
      R.pipe(R.head, Number, val => R.find(R.propEq("branchWeight", val))(pgms))
    )
  )(pgms);

const getCorrectedWeight = pgms => R.pipe(
  R.countBy(R.prop("branchWeight")),
  R.invert,
  R.values,
  R.flatten,
  ([wrong, right]) => right - wrong,
  delta => R.pipe(
    getPgmWithDifferentWeight,
    R.prop("weight"),
    R.add(delta),
  )(pgms),
)(pgms);

const getBranchesWeights = (tree, previousPgms = {}) => node =>
  R.pipe(
    getChildren(tree),
    R.map(child => ({
      name: child.name,
      weight: child.weight,
      branchWeight: child.weight + getBranchWeight(tree)(child)
    })),
    pgms =>
      R.pipe(
        getPgmWithDifferentWeight,
        R.ifElse(
          R.isNil,
          () => getCorrectedWeight(previousPgms),
          R.pipe(
            R.prop("name"),
            R.prop(R.__, tree),
            getBranchesWeights(tree, pgms)
          )
        )
      )(pgms)
  )(node);

// returns a tuple of answers: [part1, part2]
const parts = R.pipe(buildDoubleLinkedTree, indexedTree =>
  R.pipe(R.values, findRootNode, rootNode => [
    R.prop("name", rootNode),
    getBranchesWeights(indexedTree)(rootNode)
  ])(indexedTree)
);

const run = input => {
  const answers = parts(input);
  const part1ans = answers[0];
  const part2ans = answers[1];

  console.log(
    `Given your input, Part 1 is ${part1ans} and Part 2 is ${part2ans}`
  );
};
