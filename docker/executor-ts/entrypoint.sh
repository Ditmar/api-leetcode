#!/bin/sh

# Transpile solution.ts
esbuild /code/solution.ts --bundle=false --platform=node --tsconfig=/code/tsconfig.json --outfile=/code/solution.js > /tmp/compile_err.txt 2>&1 || {
  echo "COMPILE_ERROR"
  cat /tmp/compile_err.txt
  exit 3
}

# Transpile runner.ts
esbuild /code/runner.ts --bundle=false --platform=node --tsconfig=/code/tsconfig.json --outfile=/code/runner.js >> /tmp/compile_err.txt 2>&1 || {
  echo "COMPILE_ERROR"
  cat /tmp/compile_err.txt
  exit 3
}

# Run the harness
node /code/runner.js