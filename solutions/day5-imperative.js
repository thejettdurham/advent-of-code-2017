/*
* This one needs to be run by piping in your text on the command line
*
* Example usage (from bash:
*
* cat input.txt | node day4.js
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

const part1Adjuster = R.inc;
const part2Adjuster = R.ifElse(R.gte(R.__, 3), R.dec, R.inc);

const inMaze = (idx, rightBound) => idx >= 0 || idx >= rightBound - 1;

const doIt = R.curry((adjuster, input) => {
  let idx = 0;
  let steps = 0;
  let rightBound = input.length;
  let nextIdx = 0;

  do {
    nextIdx = input[idx];
    input = R.adjust(adjuster, idx, input);
    idx = nextIdx + idx;
    steps = !inMaze(idx, rightBound) ? steps : R.inc(steps);
  } while (inMaze(idx, rightBound));

  return steps;
});

const part1 = doIt(part1Adjuster);
const part2 = doIt(part2Adjuster);

const run = rawInput => {
  const input = R.map(Number, rawInput);
  const part1Ans = part1(input);
  console.log(`Steps for Part 1 = ${part1Ans}`);

  console.log("Calculating steps for Part 2, this will take a few minutes :(");
  const part2Ans = part2(input);
  console.log(`Steps for Part 2 = ${part2Ans}`);

};

