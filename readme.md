# Advent of Code 2017

This year for AoC I'm looking to stretch my understanding of applying functional programming techniques in ES6 with Ramda. I have two primary goals for each solution:

- They should be implemented using as much of the Functional paradigm as possible (vs Imperative or Procedural)
- The solution should run in the Ramda REPL

I can already predict that some solutions will not run in the REPL as they will require third-party libraries (we usually have an md5 problem or two each year), but ideally those will be few and far between.

# Running with Node

The source for each solution is written in vanilla ES6 without ECMAScript modules, so the code should run directly with `node` without transpilation.

Each solution has a usage example in comments at the top, but in general each solution will export a `run` function that will execute the solution with your input. Exactly how you provide this input will vary between solutions.

# Ramda REPL Solutions

- [Day 1](https://goo.gl/iNiKFm)
- [Day 2](https://goo.gl/xokHhb)
- Day 3 (implementation was too long to share 😩)
- [Day 4](https://goo.gl/FeRJh2)
- [Day 5](https://goo.gl/yW8szg) **Note**: This is the functional implementation that demonstrates the algorithm, but cannot run on the full input size without exceeding the maximum call stack size
- Day 6, no REPL due to length of runtime