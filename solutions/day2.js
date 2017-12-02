/*
* Accepts input directly as a string
*
* Example usage:
*
* const Day2 = require("./day2");
* const yourInput = "....."; (use backticks if pasting directly from the repl)
* Day2.run(yourInput);
*/

const R = require("ramda");

const splitRow = R.split("\n");
const splitCols = R.pipe(R.split("\t"), R.map(Number));

const maxInList = R.pipe(R.reduce(R.max, 0), R.append(R.__, []));
const minInList = R.pipe(R.reduce(R.min, Infinity), R.append(R.__, []));
const getMinAndMax = R.converge(R.concat, [minInList, maxInList]);
const diffPair = ([left, right]) => R.subtract(right, left);

const pairDividesEvenly = ([num, div]) =>
  R.pipe(R.modulo, R.equals(0))(num, div);
const dividePair = ([num, div]) => R.divide(num, div);
const removeValAtIndex = R.curry((idx, list) => R.remove(idx, 1, list));
const generateAllDivisiblePairingsFromValAndList = list => (val, idx) =>
  R.pipe(
    removeValAtIndex(idx),
    // We can optimize the search space by the fact that
    // the even-dividing predicate can't be true if div > num
    R.map(R.ifElse(R.lt(val), R.always([]), R.append(R.__, [val])))
  )(list);
const getAllDivisiblePairs = list =>
  R.pipe(
    R.addIndex(R.map)(generateAllDivisiblePairingsFromValAndList(list)),
    R.unnest,
    R.reject(R.isEmpty)
  )(list);

const calculateSpreadsheetChecksum = rowProcessor =>
  R.pipe(splitRow, R.map(R.pipe(splitCols, rowProcessor)), R.sum);

const part1 = calculateSpreadsheetChecksum(R.pipe(getMinAndMax, diffPair));
const part2 = calculateSpreadsheetChecksum(
  R.pipe(getAllDivisiblePairs, R.find(pairDividesEvenly), dividePair)
);

const run = input => {
  const part1Checksum = part1(input);
  const part2Checksum = part2(input);

  console.log(
    `Given your input, Part 1 is ${part1Checksum} and Part 2 is ${part2Checksum}`
  );
};

module.exports = {
  // string => number
  part1,
  // string => number
  part2,
  // Runs both parts and logs the results
  // string => number
  run
};
