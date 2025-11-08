#!/usr/bin/env node

import('../dist/cli/init.js').catch(err => {
  console.error('Error loading CLI:', err);
  process.exit(1);
});
