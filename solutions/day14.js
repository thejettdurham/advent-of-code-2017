const { knotHash } = require("./day10");
const R = require("ramda");
const hexToBinary = require("hex-to-binary");

console.log("Calculating...");

const input = "hxtvlmkl";
const inputRows = R.map(x => `${input}-${x}`, R.range(0, 128));
const hashGrid = R.map(
  R.pipe(knotHash, hexToBinary, R.split(""), R.map(Number)),
  inputRows
);

const countSquares = R.pipe(R.map(R.reject(R.equals(0))), R.flatten, R.length)(hashGrid);

console.log("Part 1: " + countSquares);

const coord = (x, y) =>
  x < 0 || y < 0 || x > 127 || y > 127 ? 0 : hashGrid[x][y];

const removeGroup = (x, y) => {
  if (coord(x, y) === 0) return;
  hashGrid[x][y] = 0;
  removeGroup(x + 1, y);
  removeGroup(x - 1, y);
  removeGroup(x, y + 1);
  removeGroup(x, y - 1);
};

let groups = 0;
for (let x = 0; x < 128; x++)
  for (let y = 0; y < 128; y++)
    if (coord(x, y) === 1) {
      groups++;
      removeGroup(x, y);
    }

console.log("Part 2: " + groups);
