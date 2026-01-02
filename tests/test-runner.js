#!/usr/bin/env node

/**
 * MomentumTracker PWA Test Runner
 * 
 * This script runs all tests for the MomentumTracker PWA including:
 * - Unit tests
 * - Component tests  
 * - Bug-specific tests
 * - Performance tests
 * - PWA functionality tests
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  unit: {
    pattern: 'tests/unit/**/*.test.{ts,tsx,js,jsx}',
    description: 'Unit tests for individual functions and utilities'
  },
  component: {
    pattern: 'tests/component/**/*.test.{ts,tsx,js,jsx}',
    description: 'Component tests for React components'
  },
  e2e: {
    pattern: 'tests/e2e/**/*.test.{ts,tsx,js,jsx}',
    description: 'End-to-end tests for user flows'
  },
  pwa: {
    pattern: 'tests/pwa/**/*.test.{ts,tsx,js,jsx}',
    description: 'PWA-specific functionality tests'
  },
  performance: {
    pattern: 'tests/performance/**/*.test.{ts,tsx,js,jsx}',
    description: 'Performance and load tests'
  },
  bugSpecific: {
    pattern: 'tests/bug-specific.test.{ts,tsx,js,jsx}',
    description: 'Tests specifically for bug fixes'
  }
};

// Test results tracker
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Check if Jest is available
function checkJest() {
  try {
    execSync('npx jest --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log('❌ Jest is not installed or not available');
    console.log('Please install Jest: npm install --save-dev jest @types/jest ts-jest');
    return false;
  }
}

// Run tests for a specific category
function runTests(category, pattern) {
  console.log(`\n🧪 Running ${category}...`);
  console.log(`📋 ${TEST_CONFIG[category].description}`);
  
  return new Promise((resolve) => {
    const jestProcess = spawn('npx', [
      'jest', 
      pattern,
      '--config', 'tests/jest.config.js',
      '--verbose',
      '--coverage'
    ], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    jestProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${category} tests passed\n`);
        testResults.passed++;
      } else {
        console.log(`❌ ${category} tests failed\n`);
        testResults.failed++;
        testResults.errors.push(`${category} tests failed with exit code ${code}`);
      }
      testResults.total++;
      resolve(code === 0);
    });
  });
}

// Run validation for bug fixes
function runBugFixValidation() {
  console.log('\n🔍 Running Bug Fix Validation...');
  
  try {
    // Dynamically import the validation functions
    const { runAllValidations } = require('./bug-fix-validation');
    const allValid = runAllValidations();
    
    if (allValid) {
      console.log('✅ Bug fix validation passed\n');
      testResults.passed++;
    } else {
      console.log('❌ Bug fix validation failed\n');
      testResults.failed++;
      testResults.errors.push('Bug fix validation failed');
    }
    testResults.total++;
    return allValid;
  } catch (error) {
    console.log(`❌ Bug fix validation failed: ${error.message}\n`);
    testResults.failed++;
    testResults.errors.push(`Bug fix validation error: ${error.message}`);
    testResults.total++;
    return false;
  }
}

// Run PWA specific checks
function runPwaChecks() {
  console.log('\n📱 Running PWA Functionality Checks...');
  
  let allPassed = true;
  
  // Check if required PWA files exist
  const requiredFiles = [
    'public/manifest.json',
    'public/service-worker.js',
    'public/assets/icon-192x192.png',
    'public/assets/icon-512x512.png'
  ];
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      allPassed = false;
    }
  }
  
  // Check manifest.json content
  if (fs.existsSync('public/manifest.json')) {
    try {
      const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
      const requiredManifestFields = ['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color'];
      
      for (const field of requiredManifestFields) {
        if (manifest[field]) {
          console.log(`✅ Manifest has ${field}: ${manifest[field]}`);
        } else {
          console.log(`❌ Manifest missing ${field}`);
          allPassed = false;
        }
      }
    } catch (error) {
      console.log(`❌ Invalid manifest.json: ${error.message}`);
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log('✅ PWA checks passed\n');
    testResults.passed++;
  } else {
    console.log('❌ PWA checks failed\n');
    testResults.failed++;
  }
  testResults.total++;
  
  return allPassed;
}

// Main test runner function
async function runAllTests() {
  console.log('🚀 Starting MomentumTracker PWA Test Suite...\n');
  
  // Check if Jest is available
  if (!checkJest()) {
    console.log('\n⚠️  Jest is required to run the full test suite.');
    console.log('Running validation script only...\n');
    
    // Run validation without Jest
    runBugFixValidation();
    runPwaChecks();
    
    printSummary();
    return;
  }
  
  // Run all test categories
  const categories = ['unit', 'component', 'e2e', 'pwa', 'performance', 'bugSpecific'];
  
  for (const category of categories) {
    const pattern = TEST_CONFIG[category].pattern;
    if (fs.existsSync(pattern.replace(/\*\*\/\*\.test\.\{ts,tsx,js,jsx\}/, '')) || 
        fs.existsSync(pattern.replace(/tests\/.*$/, 'tests'))) {
      await runTests(category, pattern);
    } else {
      console.log(`\n⚠️  No ${category} tests found at pattern: ${pattern}`);
      testResults.total++;
    }
  }
  
  // Run bug fix validation
  runBugFixValidation();
  
  // Run PWA checks
  runPwaChecks();
  
  // Print final summary
  printSummary();
}

// Print test results summary
function printSummary() {
  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  console.log(`Total tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    testResults.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  const successRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(2) : 0;
  console.log(`\nSuccess Rate: ${successRate}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! The MomentumTracker PWA is ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run the test suite
runAllTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});