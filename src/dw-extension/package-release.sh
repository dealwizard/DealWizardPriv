#!/bin/zsh
# filepath: /home/lkuklis/src/DealWizardPriv/src/dw-extension/package-release.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Default environment
ENV="production"

# Parse command line arguments
while getopts "e:" opt; do
  case $opt in
    e)
      ENV=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

# Validate environment
if [[ ! -f "src/config/config.${ENV}.json" ]]; then
  echo "Error: Configuration file for environment '${ENV}' not found."
  echo "Available environments:"
  ls -1 src/config/config.*.json | sed 's|src/config/config.\(.*\).json|\1|'
  exit 1
fi

echo "Building extension for ${ENV} environment..."

# Remove existing dist directory if it exists
if [ -d "dist" ]; then
  echo "Removing existing dist directory..."
  rm -rf dist
fi

# Run build with specified environment
echo "Running webpack build..."
NODE_ENV=$ENV npx webpack --env NODE_ENV=$ENV

# Define paths for packaging
DIST_DIR="dist"
MANIFEST_PATH="${DIST_DIR}/manifest.json"

# Check if dist directory exists after build
if [ ! -d "$DIST_DIR" ]; then
    echo "Error: ${DIST_DIR} directory not found after build. Build may have failed."
    exit 1
fi

# Check if manifest.json exists
if [ ! -f "$MANIFEST_PATH" ]; then
    echo "Error: manifest.json not found in ${DIST_DIR} directory after build."
    exit 1
fi

# Extract version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' "$MANIFEST_PATH" | cut -d'"' -f4)

if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from manifest.json."
    exit 1
fi

# Create zip file name with environment and version
ZIP_NAME="DealWizzard_${ENV}_${VERSION}.zip"

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

echo "Package complete! Extension is ready for distribution."
