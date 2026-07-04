#!/bin/sh

# Compile with C++17, optimisations off (reproducible behaviour).
# NOTE: no `set -e` here on purpose — with it, a failed g++ would abort
# the script before the COMPILE_ERROR block below ever runs.
if ! g++ -std=c++17 -O0 -o /code/solution /code/solution.cpp 2>/tmp/compile_err.txt; then
  echo "COMPILE_ERROR"
  cat /tmp/compile_err.txt
  exit 1
fi

# Run — memory and time limits enforced by Docker flags on the runner side
exec /code/solution
