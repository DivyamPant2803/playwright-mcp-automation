#!/bin/bash

# Script to push playwright-mcp-automation-package to GitHub
# Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "❌ Error: GitHub username required"
    echo "Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "Example: ./push-to-github.sh divyampant"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="playwright-mcp-automation"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "🚀 Setting up GitHub repository..."
echo "Repository: ${REPO_URL}"
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists. Removing it..."
    git remote remove origin
fi

# Add remote
echo "📡 Adding remote repository..."
git remote add origin "${REPO_URL}"

# Update package.json with correct repository URL
echo "📝 Updating package.json with repository URL..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|https://github.com/yourusername/playwright-mcp-automation.git|${REPO_URL}|g" package.json
    sed -i '' "s|https://github.com/yourusername/playwright-mcp-automation|https://github.com/${GITHUB_USERNAME}/playwright-mcp-automation|g" package.json
else
    # Linux
    sed -i "s|https://github.com/yourusername/playwright-mcp-automation.git|${REPO_URL}|g" package.json
    sed -i "s|https://github.com/yourusername/playwright-mcp-automation|https://github.com/${GITHUB_USERNAME}/playwright-mcp-automation|g" package.json
fi

# Commit package.json changes if any
if ! git diff --quiet package.json; then
    echo "💾 Committing package.json updates..."
    git add package.json
    git commit -m "Update repository URLs in package.json"
fi

# Set branch to main
echo "🌿 Setting branch to main..."
git branch -M main

echo ""
echo "✅ Local setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create the repository on GitHub:"
echo "   Go to: https://github.com/new"
echo "   Repository name: ${REPO_NAME}"
echo "   Description: Lightweight Playwright MCP automation - zero config, works with all AI IDEs"
echo "   Choose Public or Private"
echo "   DO NOT initialize with README, .gitignore, or license"
echo "   Click 'Create repository'"
echo ""
echo "2. Once created, run this command to push:"
echo "   git push -u origin main"
echo ""
echo "Or run this script again with --push flag:"
echo "   ./push-to-github.sh ${GITHUB_USERNAME} --push"

# If --push flag is provided, push immediately
if [ "$2" == "--push" ]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🌐 Repository: ${REPO_URL}"
    else
        echo ""
        echo "❌ Push failed. Make sure:"
        echo "   1. The repository exists on GitHub"
        echo "   2. You have push access"
        echo "   3. You're authenticated (git credential helper or SSH key)"
    fi
fi






