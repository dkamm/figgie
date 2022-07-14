#!/usr/bin/env bash

set -x

# Remove old static dir
if [ -d backend/cmd/server/static ]; then
    rm -rf backend/cmd/server/static
fi

# Make dummy static dir
mkdir -p backend/cmd/server/static
touch backend/cmd/server/static/index.html

# Build server
pushd backend
go build -o bin/figgieserver cmd/server/main.go
popd

# Run server
./backend/bin/figgieserver