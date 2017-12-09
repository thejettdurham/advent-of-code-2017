/*
* This one needs to be run by piping in your text on the command line
*
* Example usage (from bash:
*
* cat input.txt | node day9.js
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

const readModes = {
  normal: 0,
  garbage: 1,
  cancelNext: 2
};

const streamReducerInitial = [0, 0, readModes.normal, null];

const streamReducer = ([score, groupLevel, thisReadMode, lastReadMode], char, idx) => {
  if (thisReadMode === readModes.cancelNext) return [score, groupLevel, lastReadMode, thisReadMode];

  if (thisReadMode === readModes.garbage) {
    if (char === "!")
      return [score, groupLevel, readModes.cancelNext, thisReadMode];

    if (char === ">")
      return [score, groupLevel, readModes.normal, thisReadMode];

    return [score, groupLevel, thisReadMode, thisReadMode];
  }

  if (char === "}")
    return [score + groupLevel, groupLevel - 1, thisReadMode, thisReadMode];

  if (char === "{")
    return [score, groupLevel + 1, thisReadMode, thisReadMode];

  if (char === "<")
    return [score, groupLevel, readModes.garbage, thisReadMode];

  if (char === ",")
    return [score, groupLevel, readModes.normal, thisReadMode];

  throw new Error(`Unknown char ${char} at idx ${idx} in readmode ${thisReadMode}`)
};

const run = input => {
  R.pipe(
    R.nth(0),
    R.split(""),
    R.addIndex(R.reduce)(streamReducer, streamReducerInitial),
    logMe,
    R.nth(0)
  )(input)

};