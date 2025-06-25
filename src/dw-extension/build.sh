#!/bin/bash
# filepath: /home/lkuklis/src/DealWizardPriv/src/dw-extension/package-extension.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Define paths
DIST_DIR="dist"
MANIFEST_PATH="${DIST_DIR}/manifest.json"

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    echo "Error: ${DIST_DIR} directory not found."
    exit 1
fi

# Check if manifest.json exists
if [ ! -f "$MANIFEST_PATH" ]; then
    echo "Error: manifest.json not found in ${DIST_DIR} directory."
    exit 1
fi

# Extract version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' "$MANIFEST_PATH" | cut -d'"' -f4)

if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from manifest.json."
    exit 1
fi

# Create zip file name
ZIP_NAME="DealWizzard_${VERSION}.zip"

# Create the zip file
echo "Creating ${ZIP_NAME}..."
cd "$DIST_DIR" || exit 1
zip -r "../${ZIP_NAME}" ./*
cd ..

# Check if zip was created successfully
if [ -f "$ZIP_NAME" ]; then
    echo "Success! Created ${ZIP_NAME}"
    echo "Size: $(du -h "$ZIP_NAME" | cut -f1)"
else
    echo "Error: Failed to create zip file."
    exit 1
fi