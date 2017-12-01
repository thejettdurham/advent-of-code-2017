/*
* Accepts input directly as a string
*
* Example usage:
*
* const Day1 = require("./day1");
* const yourInput = ".....";
* Day1.run(yourInput);
*/

const R = require("ramda");

const indexedReduce = R.addIndex(R.reduce);

const inputToNumberList = R.pipe(R.split(""), R.map(Number));
const appendHead = R.converge(R.concat, [
  R.identity,
  R.pipe(R.head, R.append(R.__, []))
]);
const valsInPairAreEqual = R.pipe(
  R.uniq,
  R.length,
  R.ifElse(R.equals(1), R.T, R.F)
);
const addValInPairToSumIfPairValuesMatch = R.curry((sum, pair) =>
  R.ifElse(
    valsInPairAreEqual,
    R.always(R.add(sum, R.head(pair))),
    R.always(sum)
  )(pair)
);
const sumValsWithMatchingConsecutiveDigit = R.pipe(
  R.aperture(2),
  R.reduce(addValInPairToSumIfPairValuesMatch, 0)
);

const getHalfwayPointIndexForIdx = R.curry((idx, listLength) =>
  R.pipe(
    R.divide(R.__, 2),
    R.add(idx),
    R.ifElse(R.gt(listLength), R.identity, R.subtract(R.__, listLength))
  )(listLength)
);

const addValToSumIfValHalfwayAtListMatches = list => (sum, val, idx) =>
  R.pipe(
    getHalfwayPointIndexForIdx,
    R.nth(R.__, list),
    R.append(R.__, [val]),
    addValInPairToSumIfPairValuesMatch(sum)
  )(idx, R.length(list));

const sumValsWithEqualHalfwayVals = list =>
  indexedReduce(addValToSumIfValHalfwayAtListMatches(list), 0, list);

const part1 = R.pipe(
  inputToNumberList,
  appendHead,
  sumValsWithMatchingConsecutiveDigit
);
const part2 = R.pipe(inputToNumberList, sumValsWithEqualHalfwayVals);

const run = input => {
  const part1Sum = part1(input);
  const part2Sum = part2(input);

  console.log(
    `Given your input, Part 1 is ${part1Sum} and Part 2 is ${part2Sum}`
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
