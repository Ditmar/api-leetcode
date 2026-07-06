#!/bin/sh
set -e

# Transpile solution.ts to solution.js capturing output to a file
esbuild /code/solution.ts --bundle=false --platform=node --outfile=/code/solution.js > /tmp/compile_err.txt 2>&1

if [ $? -ne 0 ]; then
  echo "COMPILE_ERROR"
  cat /tmp/compile_err.txt
  exit 1
fi

# Transpile the runner harness as well
esbuild /code/runner.ts --bundle=false --platform=node --outfile=/code/runner.js >> /tmp/compile_err.txt 2>&1

if [ $? -ne 0 ]; then
  echo "COMPILE_ERROR"
  cat /tmp/compile_err.txt
  exit 1
fi

# Run the harness — input piped via stdin
node /code/runner.js