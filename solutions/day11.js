/*
* This one needs to be run by piping in your text on the command line
*
* Example usage (from bash:
*
* cat input.txt | node day11.js
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

const addTuplesByElem = ([a1, a2, a3], [b1, b2, b3]) => [
  a1 + b1,
  a2 + b2,
  a3 + b3
];

const distFromCenter = ([x, y, z]) =>
  (Math.abs(x) + Math.abs(y) + Math.abs(z)) / 2;

const xFormMap = {
  n: [0, 1, -1],
  ne: [1, 0, -1],
  se: [1, -1, 0],
  s: [0, -1, 1],
  sw: [-1, 0, 1],
  nw: [-1, 1, 0]
};

const parts = R.pipe(R.split(","), R.map(R.prop(R.__, xFormMap)), steps => [
  R.pipe(R.reduce(addTuplesByElem, [0, 0, 0]), distFromCenter)(steps),
  R.pipe(
    R.reduce(
      ([maxDist, lastCoord], step) =>
        R.pipe(
          s => addTuplesByElem(s, lastCoord),
          nextCoord =>
            R.pipe(
              distFromCenter,
              R.ifElse(
                R.gt(R.__, maxDist),
                d => [d, nextCoord],
                R.always([maxDist, nextCoord])
              )
            )(nextCoord)
        )(step),
      [0, [0, 0, 0]]
    ),
    R.head
  )(steps)
]);

const run = input => {
  const stepSeq = input[0];

  const partsAns = parts(stepSeq);
  const part1Ans = partsAns[0];
  const part2Ans = partsAns[1];

  console.log(
    `Given your input, Part 1 is ${part1Ans} and Part 2 is ${part2Ans}`
  );
};
