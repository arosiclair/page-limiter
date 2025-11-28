#!/bin/bash

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in current directory"
    exit 1
fi

# Check if an argument was provided
if [ -z "$1" ]; then
    echo "Usage: $0 <patch|minor|major>"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq to use this script."
    exit 1
fi

# Get the version from package.json using jq
current_version=$(jq -r '.version' package.json)

if [ -z "$current_version" ] || [ "$current_version" = "null" ]; then
    echo "Error: Could not find version in package.json"
    exit 1
fi

# Split version into components
IFS='.' read -r major minor patch <<< "$current_version"

# Bump version based on argument
case "$1" in
    patch)
        patch=$((patch + 1))
        ;;
    minor|feature)
        minor=$((minor + 1))
        patch=0
        ;;
    major)
        major=$((major + 1))
        minor=0
        patch=0
        ;;
    *)
        echo "Error: Invalid argument. Use 'patch', 'minor'/'feature', or 'major'"
        exit 1
        ;;
esac

# Construct new version
new_version="$major.$minor.$patch"

# Update package.json
jq --arg version "$new_version" '.version = $version' package.json > package.json.tmp && mv package.json.tmp package.json

echo "Updated package.json to version $new_version"

# Update package-lock.json if it exists
if [ -f "package-lock.json" ]; then
    jq --arg version "$new_version" '.version = $version' package-lock.json > package-lock.json.tmp && mv package-lock.json.tmp package-lock.json
    echo "Updated package-lock.json to version $new_version"
fi

# Update public/manifest.json if it exists
if [ -f "public/manifest.json" ]; then
    jq --arg version "$new_version" '.version = $version' public/manifest.json > public/manifest.json.tmp && mv public/manifest.json.tmp public/manifest.json
    echo "Updated public/manifest.json to version $new_version"
fi