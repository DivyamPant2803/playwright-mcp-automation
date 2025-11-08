#!/usr/bin/env node

import('../dist/cli/test.js').catch(err => {
  console.error('Error loading CLI:', err);
  process.exit(1);
});
