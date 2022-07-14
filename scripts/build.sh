#!/usr/bin/env bash

set -x

# Build frontend
pushd frontend
yarn build
popd

# Remove old static dir
rm -rf backend/cmd/server/static

# Copy built frontend to static dir
cp -r frontend/dist backend/cmd/server/static/

# Build server
pushd backend
GOOS=linux GOARCH=amd64 go build -ldflags "-X main.mode=production" -o bin/figgieserver cmd/server/main.go
popd