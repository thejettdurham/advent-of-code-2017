/*
* Accepts input directly as a string
*
* Example usage:
*
* const Day3 = require("./Day3");
* const yourInput = ".....";
* Day3.run(yourInput);
*/

const R = require("ramda");

const isEven = R.pipe(R.modulo(R.__, 2), R.equals(0));
const getEdgeDist = R.pipe(
  Math.sqrt,
  Math.ceil,
  R.ifElse(isEven, R.divide(R.__, 2), R.pipe(R.dec, R.divide(R.__, 2)))
);
const sideLengthForEdgeDist = R.ifElse(
  R.equals(0),
  R.identity,
  R.pipe(R.multiply(2), R.add(1))
);
const getMaxValForEdgeDist = R.pipe(sideLengthForEdgeDist, x => Math.pow(x, 2));
const getLinearDistanceFromMaxVal = R.ifElse(
  (maxVal, val) => R.equals(0, maxVal),
  R.always(0),
  R.subtract
);

const getDeviationFromAdjustedDist = (dist, edgeDist) =>
  Math.abs(-dist + edgeDist);

const getDeviation = R.curry((input, edgeDist) =>
  R.pipe(
    getMaxValForEdgeDist,
    getLinearDistanceFromMaxVal(R.__, input),
    R.ifElse(R.F, R.always(0), R.modulo(R.__, 2 * edgeDist)),
    x => getDeviationFromAdjustedDist(x, edgeDist)
  )(edgeDist)
);

const getStepsToInput = input =>
  R.pipe(getEdgeDist, R.converge(R.add, [R.identity, getDeviation(input)]))(
    input
  );

// PART 2 FUNCTIONS

const getGridEdgeLength = R.pipe(R.flatten, R.length, Math.sqrt);
const addEmptyPerimeter = R.pipe(
  R.map(
    // Add zeroes to the head and tail of each existing row
    R.pipe(R.append(0), R.prepend(0))
  ),
  grid =>
    R.pipe(
      // add zero-rows to the head and tail of the grid
      R.head,
      R.length,
      R.repeat(0, R.__),
      emptyRow => R.pipe(R.append(R.__, grid), R.prepend(emptyRow))(emptyRow)
    )(grid)
);
const getInitialAllocationIndex = R.pipe(getGridEdgeLength, d => [
  d - 2,
  d - 1
]);
const allocateValueAtIndex = R.curry((grid, index, val) =>
  R.assocPath(index, val, grid)
);
const idxWasFinalAllocatableIndex = ([rowIdx, colIdx], grid) =>
  R.pipe(getGridEdgeLength, R.dec, R.both(R.equals(rowIdx), R.equals(colIdx)))(
    grid
  );

const idxIsBottomRow = ([rowIdx, _], grid) =>
  R.pipe(getGridEdgeLength, R.dec, R.equals(rowIdx))(grid);
const idxIsTopRow = ([rowIdx, _], grid) => R.equals(0, rowIdx);
const idxIsFirstCol = ([_, colIdx], grid) => R.equals(0, colIdx);
const idxIsLastCol = ([_, colIdx], grid) =>
  R.pipe(getGridEdgeLength, R.dec, R.equals(colIdx))(grid);

const applyIdxTransform = R.zipWith(R.add);
const moveLeft = applyIdxTransform([0, -1]);
const moveRight = applyIdxTransform([0, 1]);
const moveDown = applyIdxTransform([1, 0]);
const moveUp = applyIdxTransform([-1, 0]);

const allAdjacentIndexTransforms = [
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
];
const getValOrZeroFromGridAtIndex = R.curry((grid, idx) =>
  R.ifElse(R.any(R.lt(R.__, 0)), R.always(0), ([row, col]) =>
    R.pipe(R.nth(R.__, grid), R.defaultTo([]), R.nth(col), R.defaultTo(0))(row)
  )(idx)
);

const getNextVal = R.curry((grid, idx) =>
  R.pipe(
    R.map(R.pipe(applyIdxTransform(idx), getValOrZeroFromGridAtIndex(grid))),
    R.sum
  )(allAdjacentIndexTransforms)
);

const getNextIdx = R.curry((lastIdx, grid) =>
  R.cond([
    [idxWasFinalAllocatableIndex, R.F],
    [R.both(idxIsLastCol, R.compose(R.not, idxIsTopRow)), moveUp],
    [R.both(idxIsTopRow, R.compose(R.not, idxIsFirstCol)), moveLeft],
    [R.both(idxIsFirstCol, R.compose(R.not, idxIsBottomRow)), moveDown],
    [R.both(idxIsBottomRow, R.compose(R.not, idxIsLastCol)), moveRight],
    [
      R.T,
      () => {
        throw new Error("Could not find move instruction");
      }
    ]
  ])(lastIdx, grid)
);

const getFirstValLargerThanInputOrCompleteGrid = R.curry((input, grid, idx) =>
  R.pipe(
    getNextVal(grid),
    R.ifElse(
      R.lt(input),
      R.identity,
      R.pipe(allocateValueAtIndex(grid, idx), updatedGrid =>
        R.pipe(
          getNextIdx(idx),
          // return the completed grid for the next recursion if there's no next index
          R.ifElse(
            R.equals(false),
            R.always(updatedGrid),
            getFirstValLargerThanInputOrCompleteGrid(input, updatedGrid)
          )
        )(updatedGrid)
      )
    )
  )(idx)
);

const findFirstValueInSquaresGridLargerThanInput = R.curry((start, input) =>
  R.pipe(addEmptyPerimeter, enlargedGrid =>
    R.pipe(
      getInitialAllocationIndex,
      getFirstValLargerThanInputOrCompleteGrid(input, enlargedGrid),
      R.ifElse(R.is(Number), R.identity, nextGrid =>
        findFirstValueInSquaresGridLargerThanInput(nextGrid, input)
      )
    )(enlargedGrid)
  )(start)
);

const part1 = getStepsToInput;
const part2 = findFirstValueInSquaresGridLargerThanInput([[1]]);

const run = input => {
  const part1ans = part1(input);
  const part2ans = part2(input);

  console.log(
    `Given your input, Part 1 is ${part1ans} and Part 2 is ${part2ans}`
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
