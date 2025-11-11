#!/bin/bash

# Test script for error capture functionality
# This creates a simple test that will fail and generate error reports

echo "🧪 Testing Error Capture Functionality"
echo ""

# Create a test file that will fail
TEST_FILE="test-error-capture.spec.ts"
cat > "$TEST_FILE" << 'EOF'
import { test, expect } from '@playwright/test';

test('should capture error details on failure', async ({ page }) => {
  // Navigate to a page
  await page.goto('https://example.com');
  
  // This assertion will fail and trigger error capture
  await expect(page.locator('h1')).toHaveText('This text does not exist', { timeout: 2000 });
});

test('should capture API error details', async ({ request }) => {
  // This will fail
  const response = await request.get('https://httpstat.us/404');
  expect(response.status()).toBe(200); // This assertion will fail
});
EOF

echo "✅ Created test file: $TEST_FILE"
echo ""
echo "📋 To test error capture:"
echo "   1. Run: npx playwright test $TEST_FILE"
echo "   2. Check for reports in: test-results/error-reports/"
echo "   3. Open the HTML report to verify screenshots/videos"
echo ""
echo "🔍 To verify error capture is working:"
echo "   - Check that error-reports directory is created"
echo "   - Verify .md, .html, and .json files are generated"
echo "   - Open HTML report and check for:"
echo "     * Error message and stack trace"
echo "     * Network logs (for API tests)"
echo "     * Console logs"
echo "     * DOM state"
echo "     * Screenshot/video paths"
echo ""
echo "💡 If screenshots/videos are blank:"
echo "   - Check that paths in the report are correct"
echo "   - Verify files exist in test-results/ directory"
echo "   - Screenshots should be in test-results/ (Playwright default)"
echo "   - Videos should be in test-results/ (Playwright default)"
echo ""

