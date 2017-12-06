/*
* Accepts input directly as a string
*
* Example usage:
*
* const Day6 = require("./Day6");
* const yourInput = "....."; (pasting directly into REPL should work, tab characters will be preserved)
* Day6.run(yourInput);
*/

const R = require("ramda");

const processInput = R.pipe(R.split("\t"), R.map(Number));

const sortAscending = R.sort((a, b) => b - a);
const getFirstIndexOfLargestBlock = origList =>
  R.pipe(sortAscending, R.head, R.indexOf(R.__, origList))(origList);

const reallocate = R.curry((idx, list) =>
  R.pipe(
    (idx, list) => [idx, list, list[idx]],
    ([idx, list, val]) => [idx, R.update(idx, 0, list), val],
    ([a, b, val]) => [a, b, val, R.range(1, val + 1)],
    ([idx, list, blocks, cycleRange]) =>
      R.reduce(
        (acc, it) =>
          R.pipe(
            R.add(idx),
            R.modulo(R.__, R.length(list)),
            R.adjust(R.inc, R.__, acc)
          )(it),
        list,
        cycleRange
      )
  )(idx, list)
);

const runReallocation = input =>
  R.pipe(getFirstIndexOfLargestBlock, reallocate(R.__, input))(input);

const serializeOutput = R.join("\t");

const algorithm = input => {
  let acc = new Set([]);
  let data = input;
  let cycleMarker = "";

  let cyclesToFirstRepeat = 0;
  let cyclesTilNextRepeat = 0;
  while (true) {
    const output = runReallocation(data);
    const serialized = serializeOutput(output);

    if (serialized === cycleMarker) {
      cyclesTilNextRepeat = acc.size;
      break;
    }

    if (acc.has(serialized) && cycleMarker === "") {
      cycleMarker = serialized;
      cyclesToFirstRepeat = acc.size;
      acc = new Set([]);
    }

    acc.add(serialized);
    data = output;
    if (acc.size % 10000 === 0) console.log(acc.size);
  }

  return [cyclesToFirstRepeat + 1, cyclesTilNextRepeat];
};

const parts = R.pipe(processInput, algorithm);

const run = input => {
  const [part1ans, part2ans] = parts(input);

  console.log(
    `Given your input, Part 1 is ${part1ans} and Part 2 is ${part2ans}`
  );
};

module.exports = {
  // string => [number, number]
  parts,
  // Runs both parts and logs the results
  // string => number
  run
};