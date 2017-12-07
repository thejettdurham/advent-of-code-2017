/*
* This one needs to be run by piping in your text on the command line
*
* Example usage (from bash:
*
* cat input.txt | node day7.js
*/

const R = require("ramda");
const logMe = R.tap(console.log);
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

const part1 = R.pipe(buildDoubleLinkedTree, R.values, findRootNode, logMe, R.prop("name"));
const part2 = () => "none";

const run = input => {
  const part1ans = part1(input);
  const part2ans = part2(input);

  console.log(
    `Given your input, Part 1 is ${part1ans} and Part 2 is ${part2ans}`
  );
};