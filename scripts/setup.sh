#!/bin/bash

set -e -o pipefail

if [ "$USE_CLOUD" = "true" ]; then
  ./scripts/sauce/sauce_connect_setup.sh
  ./scripts/sauce/sauce_connect_block.sh
fi
