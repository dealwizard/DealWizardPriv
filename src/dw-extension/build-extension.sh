#!/bin/zsh
# filepath: /home/lkuklis/src/DealWizardPriv/src/dw-extension/build-extension.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Default environment
ENV="development"

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

echo "Build complete! Extension files are in the dist/ directory."
