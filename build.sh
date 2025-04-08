#!/bin/bash

# Fetch the current version from manifest.json
CURRENT_VERSION=$(grep -o '"version": "[0-9]\+\.[0-9]\+\.[0-9]\+"' manifest.json | sed 's/"version": "\(.*\)"/\1/')

# Show the current version
echo "Current version in manifest.json: $CURRENT_VERSION"
echo ""

# Prompt user to confirm that the changelog has been updated
echo "Before proceeding, ensure that you have updated the changelog with changes related to this version."
read -p "Have you updated the changelog? (yes to proceed, no to exit): " CHANGELOG_CONFIRMATION

# If the user has not updated the changelog, exit
if [[ "$CHANGELOG_CONFIRMATION" != "yes" ]]; then
  echo "Please update the changelog before running this script."
  exit 1
fi

echo ""

# Ask for a new version number
read -p "Enter the new version number (or type 'exit' to quit): " NEW_VERSION

# Check if the user wants to exit
if [[ "$NEW_VERSION" == "exit" ]]; then
  echo "Exiting without making changes."
  exit 0
fi

# Validate the new version number
if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version number format. Please use the format 'X.Y.Z' (e.g., 1.2.3)."
  exit 1
fi

# Update the version in manifest.json
sed -i.bak -E "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" manifest.json

if [[ $? -eq 0 ]]; then
  echo "Version updated to $NEW_VERSION in manifest.json."
else
  echo "Failed to update the version in manifest.json."
  exit 1
fi

# Run web-ext build
echo ""
echo ""
echo "Building the web extension with web-ext..."
web-ext build
echo ""
echo ""

if [[ $? -eq 0 ]]; then
  echo "Build completed successfully."
else
  echo "Build failed."
  exit 1
fi

# Prompt user for confirmation to push the changes and tag
echo ""
echo ""
read -p "Are you ready to push the release to GitHub? (yes to push, no to exit): " PUSH_CONFIRMATION

if [[ "$PUSH_CONFIRMATION" != "yes" ]]; then
  echo "Release process aborted. Nothing was pushed."
  exit 0
fi

# Push changes and create the tag
echo ""
echo "Pushing changes to GitHub..."

# Add all changes (including manifest.json and other files, if applicable)
git add .

# Commit changes with the proper version bump message
git commit -m "Bump version to v${NEW_VERSION}"

# Push changes to the main branch
git push origin main

# Create a new tag for the version and push it
git tag "v${NEW_VERSION}"
git push origin "v${NEW_VERSION}"

echo ""
echo ""

if [[ $? -eq 0 ]]; then
  echo "Release version v${NEW_VERSION} pushed successfully."
else
  echo "Failed to push release version v${NEW_VERSION}."
  exit 1
fi