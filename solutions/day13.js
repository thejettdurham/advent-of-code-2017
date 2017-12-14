/*
* This one needs to be run by piping in your text on the command line
*
* Example usage (from bash):
*
* cat input.txt | node day13.js
*/

const R = require("ramda");

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

const parseInputLine = R.pipe(
  R.split(": "),
  R.map(Number),
  ([depth, range]) => ({
    depth,
    range
  })
);

const parseInput = R.pipe(R.map(parseInputLine), R.indexBy(R.prop("depth")));

const buildFirewall = secureLayers =>
  R.pipe(
    R.values,
    R.last,
    R.prop("depth"),
    lastLayer => R.range(0, lastLayer + 1),
    R.map(
      R.pipe(
        depth => R.propOr({ depth, range: 0 }, depth, secureLayers),
        R.assoc("scannerPos", 0),
        R.assoc("scannerDir", "down")
      )
    ),
    R.indexBy(R.prop("depth"))
  )(secureLayers);

const objLength = R.pipe(R.keys, R.length);

const getUpdatedScannerDir = (range, scannerPos, scannerDir) => {
  if (range === 0) return scannerDir;

  if (scannerPos === 0) return "down";

  if (scannerPos + 1 === range) return "up";

  return scannerDir;
};

const moveScanners = R.map(({ depth, range, scannerPos, scannerDir }) => ({
  depth,
  range,
  scannerDir: getUpdatedScannerDir(range, scannerPos, scannerDir),
  scannerPos:
    range === 0
      ? 0
      : getUpdatedScannerDir(range, scannerPos, scannerDir) === "up"
        ? scannerPos - 1
        : scannerPos + 1
}));

const moveThroughFirewall = (firewall, catches, inDepth) =>
  R.pipe(R.inc, newInDepth =>
    R.ifElse(R.gte(R.__, objLength(firewall)), R.always(catches), x =>
      R.pipe(
        R.ifElse(
          R.pipe(
            x => R.prop(x, firewall),
            R.both(
              R.compose(R.not, R.propEq("range", 0)),
              R.propEq("scannerPos", 0)
            )
          ),
          R.pipe(
            x => R.path([x, "range"], firewall),
            range => R.append([newInDepth, range], catches)
          ),
          R.always(catches)
        ),
        newCatches =>
          R.pipe(
            () => moveScanners(firewall),
            fw => moveThroughFirewall(fw, newCatches, newInDepth)
          )(newCatches)
      )(x)
    )(newInDepth)
  )(inDepth);

const calculateSeverity = R.pipe(R.map(([d, r]) => d * r), R.sum);

const moveThroughFirewallUntilNotCaught = (catches, fw) => {
  let nfw = fw;
  let delays = 0;
  let ncatches = catches;

  do {
    if (delays % 1000 === 0) console.log(delays);
    nfw = moveScanners(nfw);
    ncatches = moveThroughFirewall(nfw, [], -1);
    delays++;
  } while(!R.isEmpty(ncatches));

  return delays;
};

const parts = R.pipe(parseInput, buildFirewall, fw =>
  R.pipe(
    fw => moveThroughFirewall(fw, [], -1),
    catches => [
      calculateSeverity(catches),
      moveThroughFirewallUntilNotCaught(catches, fw)
    ]
  )(fw)
);

const run = input => {
  const partsAns = parts(input);
  const part1Ans = partsAns[0];
  const part2Ans = partsAns[1];

  console.log(
    `Given your input, Part 1 is ${part1Ans} and Part 2 is ${part2Ans}`
  );
};
