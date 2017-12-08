/*
* This one needs to be run by piping in your text on the command line
*
* Example usage (from bash:
*
* cat input.txt | node day8.js
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

const comparisons = {
  "==": R.equals,
  "!=": R.compose(R.not, R.equals),
  "<": R.lt,
  ">": R.gt,
  "<=": R.lte,
  ">=": R.gte
};

const operations = {
  inc: R.add,
  dec: R.flip(R.subtract)
};

const instructionExpr = /(.*)\s(.*)\s(.*)\sif\s(.*)\s(.*)\s(.*)/;
const parseInput = R.pipe(
  R.bind(instructionExpr.exec, instructionExpr),
  matches => ({
    register: matches[1],
    operation: operations[matches[2]],
    value: Number(matches[3]),
    compRegister: matches[4],
    compOperation: comparisons[matches[5]],
    compValue: Number(matches[6])
  })
);

const initRegistersFromInstructions = R.pipe(
  R.pluck("register"),
  R.uniq,
  registerNames =>
    R.pipe(R.length, R.repeat(0), R.zipObj(registerNames))(registerNames)
);

const instructionApplicationReducer = ([maxVal, registers], instruction) => {
  const {
    register,
    operation,
    value,
    compRegister,
    compOperation,
    compValue
  } = instruction;

  const srcValue = registers[compRegister];

  if (compOperation(srcValue, compValue)) {
    const updated = operation(value, registers[register]);

    const xForm = { [register]: operation(value) };
    return [R.max(updated, maxVal), R.evolve(xForm, registers)];
  }

  return [maxVal, registers];
};

const applyInstructionsToRegisters = instructions => initialRegisters =>
  R.reduce(instructionApplicationReducer, [-Infinity, initialRegisters], instructions);

const getLargestRegisterValue = R.pipe(R.values, R.reduce(R.max, -Infinity));

const parts = R.pipe(R.map(parseInput), instructions =>
  R.pipe(
    initRegistersFromInstructions,
    applyInstructionsToRegisters(instructions),
    ([maxVal, registers]) => [getLargestRegisterValue(registers), maxVal]
  )(instructions),
);

const run = input => {
  const partsAns = parts(input);
  const part1Ans = partsAns[0];
  const part2Ans = partsAns[1];

  console.log(
    `Given your input, Part 1 is ${part1Ans} and Part 2 is ${part2Ans}`
  );
};
