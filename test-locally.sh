#!/bin/bash

# Script to test the package locally without publishing

echo "📦 Creating local package tarball..."
cd "/Users/divyampant/Documents/Projects/Playwright MCP/playwright-mcp-automation-package"
npm pack

TARBALL=$(ls playwright-mcp-automation-*.tgz | head -1)
echo ""
echo "✅ Created: $TARBALL"
echo ""
echo "📋 To test in another project, run:"
echo "   cd /path/to/your/test-project"
echo "   npm install $(pwd)/$TARBALL"
echo ""
echo "Or use npm link:"
echo "   cd $(pwd)"
echo "   npm link"
echo "   cd /path/to/your/test-project"
echo "   npm link playwright-mcp-automation"






