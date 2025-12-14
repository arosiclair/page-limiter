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

# Run npm install to update package-lock.json
if [ -f "package-lock.json" ]; then
    npm install
    echo "Updated package-lock.json via npm install"
fi

# Update public/manifest.json if it exists
if [ -f "public/manifest.json" ]; then
    jq --arg version "$new_version" '.version = $version' public/manifest.json > public/manifest.json.tmp && mv public/manifest.json.tmp public/manifest.json
    echo "Updated public/manifest.json to version $new_version"
fi

# Commit the changes
git add package.json package-lock.json public/manifest.json 2>/dev/null
git commit -m "bump version to $new_version"
echo "Committed changes with message: bump version to $new_version"

# Create git tag
git_tag="v$new_version"
if git rev-parse "$git_tag" >/dev/null 2>&1; then
    echo "Warning: Git tag $git_tag already exists"
else
    git tag "$git_tag"
    echo "Created git tag $git_tag"
fi