/*
* Accepts input directly as a string
*
* Example usage:
*
* const Day10 = require("./Day10");
* const yourInput = ".....";
* Day10.run(yourInput);
*
* You can also run the code directly by modifying the input at the top of this file and running directly
* node day10.js
*/

const input = "212,254,178,237,2,0,1,54,167,92,117,125,255,61,159,164";

const R = require("ramda");

const indexedReduce = R.addIndex(R.reduce);

const _listLength = 256;
const _initialList = R.range(0, _listLength); //Range is right-side exclusive
const knotSeed = [_initialList, 0, 0];
const knot = ([list, cursor, skip], length) =>
  R.pipe(
    R.concat(list), // Double the list to save from wrap-around handling here
    R.slice(cursor, length + cursor),
    R.reverse,
    indexedReduce(
      (acc, val, idx) => R.update((cursor + idx) % _listLength, val, acc),
      list
    ),
    updatedList => [
      updatedList,
      (cursor + length + skip) % _listLength,
      R.inc(skip)
    ]
  )(list);

const runRound = roundInput => lengths => {
  return R.reduce(knot, roundInput, lengths);
};

const strToAsciiList = R.map(x => x.charCodeAt(0));
const XOR = R.curry((a, b) => a ^ b);
const decToHexStr = x => x.toString(16);
const zomgLeftPad = x => x.padStart(2, "0");
const sparseHash = lengths =>
  R.head(R.reduce(acc => runRound(acc)(lengths), knotSeed, R.range(0, 64)));

const denseHash = R.pipe(
  R.splitEvery(16),
  R.map(R.pipe(R.reduce(XOR, 0), decToHexStr, zomgLeftPad)),
  R.join("")
);

const part1 = R.pipe(
  R.split(","),
  R.map(Number),
  runRound(knotSeed),
  R.nth(0),
  ([a, b]) => a * b
);

const givenLengths = [17, 31, 73, 47, 23];
const part2 = R.pipe(
  strToAsciiList,
  R.concat(R.__, givenLengths),
  sparseHash,
  denseHash
);

const run = input => {
  const p1 = part1(input);
  const p2 = part2(input);

  console.log(`Given your input, Part 1 is ${p1} and Part 2 is ${p2}`);
};

module.exports = {
  part1,
  part2,
  run
};

if (require.main === module) {
  run(input);
}
