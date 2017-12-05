/*
* NOTE: This implementation currently does not work, as the recursion is not tail-call-optimized and the call stack
* is blown out quite quickly.
*
* This one needs to be run by piping in your text on the command line
*
* Example usage (from bash:
*
* cat input.txt | node day4.js
*/

const R = require("ramda");

// This bit just handles reading from the text file

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

const getStartingInput = R.applySpec({
  idx: R.always(0),
  nextIdx: R.always(0),
  steps: R.always(0),
  rightBound: R.length,
  input: R.identity
});

const inMaze = (x) => x.idx >= 0 || x.idx >= x.rightBound - 1;

const part1Adjuster = R.inc;
const part2Adjuster = R.ifElse(R.gte(R.__, 3), R.dec, R.inc);

// Each step in this pipeline basically updates a value in the input hash with values from other parts of the hash
const algorithm = R.curry((adjuster, input) => R.pipe(
  x => R.assoc("nextIdx", R.nth(x.idx, x.input), x),
  x => R.evolve({
    input: R.adjust(adjuster, x.idx)
  }, x),
  x => R.evolve({
    idx: R.add(x.nextIdx)
  }, x),
  x => R.evolve({
    steps: R.ifElse(R.always(!inMaze(x)), R.identity, R.inc)
  }, x),
  R.ifElse(inMaze, algorithm(adjuster), R.prop("steps"))
)(input));

const runFromRawInput = processor => R.pipe(
  R.map(Number),
  getStartingInput,
  algorithm(processor)
);

const part1Process = runFromRawInput(part1Adjuster);
const part2Process = runFromRawInput(part2Adjuster);
const run = rawInput => {
  const part1Ans = part1Process(rawInput);
  const part2Ans = part2Process(rawInput);

  console.log(part1Ans);
};