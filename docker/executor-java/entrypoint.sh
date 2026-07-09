#!/bin/sh
if ! javac -d /code /code/Solution.java 2>/tmp/compile_err.txt; then
  echo "COMPILE_ERROR"
  cat /tmp/compile_err.txt
  exit 1
fi

exec java -cp /code Solution
