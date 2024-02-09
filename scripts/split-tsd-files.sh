#!/bin/bash

set -euo pipefail

for file in dist/*.d.ts dist/structs/*.d.ts; do
  mv $file "${file%.d.ts}.d.cts"
  cp "${file%.d.ts}.d.cts" "${file%.d.ts}.d.mts"
done

for file in dist/*.d.cts dist/structs/*.d.cts; do
  echo "File: $file"
  sed -e 's/\.d\.ts/.d.cts/' -i.bak "$file"
  sed -e 's/\.js/.cjs/' -i.bak "$file"
done

for file in dist/*.d.mts dist/structs/*.d.mts; do
  echo "File: $file"
  sed -e 's/\.d\.ts/\.d\.mts/' -i.bak "$file"
  sed -e 's/\.js/.mjs/' -i.bak "$file"
done

find dist -name '*.bak' | xargs rm
