/*
* This one needs to be run by piping in your text on the command line
*
* Example usage (from bash:
*
* cat input.txt | node day12.js
*/

const R = require("ramda");
const logMe = x => {
  console.log(x);
  return x;
};
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

const inputParseExpr = /(.*) <-> (.*)/;

const parseInputLine = R.pipe(
  R.bind(inputParseExpr.exec, inputParseExpr),
  m => [m[1], m[2]],
  ([id, connects]) => [Number(id), R.split(", ", connects)],
  ([_, connectsStr]) => [_, R.map(Number, connectsStr)]
);

const parseInputIntoGraph = R.pipe(
  R.reduce(
    (acc, line) =>
      R.pipe(parseInputLine, ([id, connects]) =>
        R.pipe(assocNewSetOrUnionExisting(id, connects), o =>
          R.reduce(
            (acc2, connect) => assocNewSetOrUnionExisting(connect, [id])(acc2),
            o,
            connects
          )
        )(acc)
      )(line),
    {}
  )
);

const assocNewSetOrUnionExisting = (id, connects) => obj =>
  R.ifElse(
    R.pipe(R.prop(id), R.either(R.isNil, R.isEmpty)),
    R.assoc(id, new Set(connects)),
    R.pipe(
      R.prop(id),
      x => [...x, ...connects],
      x => new Set(x),
      R.assoc(id, R.__, obj)
    )
  )(obj);

const getNodesLeadingToPoint = (graph, startNode, seenNodes = new Set()) => {
  seenNodes.add(startNode);

  const children = graph[startNode];

  return R.reduce(
    (seen, node) => {
      if (seen.has(node)) return seen;

      return getNodesLeadingToPoint(graph, node, seen);
    },
    seenNodes,
    children
  );
};

const getConnectedGroups = (graph, startNode, groups = []) => {
  const group = getNodesLeadingToPoint(graph, startNode);
  const gs = [group, ...groups];
  const trimmedGraph = R.omit([...group], graph);

  return R.length(R.keys(trimmedGraph)) > 0
    ? getConnectedGroups(trimmedGraph, R.head(R.keys(trimmedGraph)), gs)
    : gs;
};

const part1 = R.pipe(
  parseInputIntoGraph,
  graph => getNodesLeadingToPoint(graph, 0),
  s => s.size
);

const part2 = R.pipe(
  parseInputIntoGraph,
  graph => getConnectedGroups(graph, 0),
  logMe,
  R.length
);

const parts = input => [part1(input), part2(input)];

// string[] => void
const run = input => {
  const partsAns = parts(input);
  const part1Ans = partsAns[0];
  const part2Ans = partsAns[1];

  console.log(
    `Given your input, Part 1 is ${part1Ans} and Part 2 is ${part2Ans}`
  );
};
