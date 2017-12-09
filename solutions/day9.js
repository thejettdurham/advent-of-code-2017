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

const streamReducerInitial = {
  score: 0,
  groupLevel: 0,
  thisReadMode: readModes.normal,
  lastReadMode: null,
  garbageChars: 0
};

const streamReducer = (acc, char, idx) => {
  const { score, groupLevel, thisReadMode, lastReadMode, garbageChars } = acc;

  if (thisReadMode === readModes.cancelNext)
    return { ...acc, thisReadMode: lastReadMode, lastReadMode: thisReadMode };

  if (thisReadMode === readModes.garbage) {
    if (char === "!")
      return {
        ...acc,
        thisReadMode: readModes.cancelNext,
        lastReadMode: thisReadMode
      };

    if (char === ">")
      return {
        ...acc,
        thisReadMode: readModes.normal,
        lastReadMode: thisReadMode
      };

    return {
      ...acc,
      garbageChars: garbageChars + 1,
      lastReadMode: thisReadMode
    };
  }

  if (char === "}")
    return {
      ...acc,
      score: score + groupLevel,
      groupLevel: groupLevel - 1,
      lastReadMode: thisReadMode
    };

  if (char === "{")
    return { ...acc, groupLevel: groupLevel + 1, lastReadMode: thisReadMode };

  if (char === "<")
    return {
      ...acc,
      thisReadMode: readModes.garbage,
      lastReadMode: thisReadMode
    };

  if (char === ",") return { ...acc, lastReadMode: thisReadMode };

  throw new Error(
    `Unknown char ${char} at idx ${idx} in readmode ${thisReadMode}`
  );
};

const run = input => {
  const parts = R.pipe(
    R.nth(0),
    R.split(""),
    R.addIndex(R.reduce)(streamReducer, streamReducerInitial),
  )(input);

  const part1Ans = parts.score;
  const part2Ans = parts.garbageChars;

  console.log(
    `Given your input, Part 1 is ${part1Ans} and Part 2 is ${part2Ans}`
  );
};
