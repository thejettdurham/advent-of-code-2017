/*
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

const splitLine = R.split(" ");
const phraseHasDuplicateWords = phrase =>
  R.pipe(R.uniq, R.length, R.ifElse(R.equals(R.length(phrase)), R.F, R.T))(
    phrase
  );
const passPhraseHasNoDuplicateWords = R.ifElse(
  phraseHasDuplicateWords,
  R.always(0),
  R.always(1)
);

const sortString = R.pipe(R.split(""), R.sort((a, b) => a > b), R.join(""));
const passPhraseHasNoAnagrams = R.pipe(
  R.map(sortString),
  passPhraseHasNoDuplicateWords
);

const processLines = lineProcessor =>
  R.pipe(R.map(R.pipe(splitLine, lineProcessor)), R.sum);

const part1 = processLines(passPhraseHasNoDuplicateWords);
const part2 = processLines(passPhraseHasNoAnagrams);

const run = input => {
  const part1ans = part1(input);
  const part2ans = part2(input);

  console.log(
    `Given your input, Part 1 is ${part1ans} and Part 2 is ${part2ans}`
  );
};
