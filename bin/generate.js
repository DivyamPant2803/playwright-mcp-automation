#!/usr/bin/env node

import('../dist/cli/generate.js').catch(err => {
  console.error('Error loading CLI:', err);
  process.exit(1);
});
