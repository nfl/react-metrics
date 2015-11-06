#!/bin/bash

set -e -o pipefail

if [ "$USE_CLOUD" = "true" ]; then
  ./scripts/sauce/sauce_connect_teardown.sh
fi
