#!/usr/bin/env node

/**
 * Authentication Methods Comparison Tool
 *
 * This tool performs automated testing and comparison of both authentication methods:
 * - SDK Authentication (Official/Recommended)
 * - Bearer Token Authentication (Deprecated/Testing)
 *
 * Generates a comprehensive report showing which method works and why.
 */

import { AuthManager, AuthMode } from '../auth/AuthManager.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    apiKey: null,
    bearerToken: 'Nillion2025',
    model: 'google/gemma-3-27b-it',
    baseURL: null,
    outputFile: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--api-key' || arg === '-k') {
      config.apiKey = args[++i];
    } else if (arg === '--bearer-token' || arg === '-t') {
      config.bearerToken = args[++i];
    } else if (arg === '--model') {
      config.model = args[++i];
    } else if (arg === '--base-url') {
      config.baseURL = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      config.outputFile = args[++i];
    } else if (!arg.startsWith('--') && !config.apiKey) {
      config.apiKey = arg;
    }
  }

  // Get from environment if not provided
  config.apiKey = config.apiKey || process.env.NIL_API_KEY;
  config.bearerToken = config.bearerToken || process.env.NIL_BEARER_TOKEN || 'Nillion2025';

  return config;
}

async function runComparison(config) {
  console.log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║       Authentication Methods Comparison Tool                 ║
║       Nillion API Testing & Verification                      ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);

  if (!config.apiKey) {
    log('❌ Error: API key is required for comparison', colors.red);
    console.log('\nUsage:');
    console.log('  node testing/authComparison.js --api-key your-key');
    console.log('  or set NIL_API_KEY environment variable');
    process.exit(1);
  }

  console.log('Configuration:');
  console.log(`  API Key: ${config.apiKey.substring(0, 8)}...${config.apiKey.substring(config.apiKey.length - 8)}`);
  console.log(`  Bearer Token: ${config.bearerToken}`);
  console.log(`  Model: ${config.model}`);
  console.log(`  Base URL: ${config.baseURL || 'default'}`);
  console.log('');

  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    totalTime: 0,
    tests: []
  };

  // Test 1: SDK Authentication
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('TEST 1: SDK Authentication (Official Method)', colors.bright + colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    const sdkProvider = AuthManager.create(AuthMode.SDK, {
      apiKey: config.apiKey,
      model: config.model,
      baseURL: config.baseURL
    });

    const sdkInfo = sdkProvider.getInfo();
    console.log(`\nProvider: ${sdkInfo.name}`);
    console.log(`Status: ${sdkInfo.status}`);
    console.log(`Description: ${sdkInfo.description}`);

    console.log('\n📡 Testing connection...');
    const sdkResult = await sdkProvider.testConnection();

    results.tests.push({
      name: 'SDK Authentication',
      mode: 'sdk',
      ...sdkResult
    });

    if (sdkResult.success) {
      log(`\n✅ SDK Authentication: SUCCESS`, colors.green);
      console.log(`Response: "${sdkResult.response}"`);
      console.log(`Response Time: ${sdkResult.responseTime}ms`);
      console.log(`Tokens Used: ${sdkResult.usage ? JSON.stringify(sdkResult.usage) : 'N/A'}`);
    } else {
      log(`\n❌ SDK Authentication: FAILED`, colors.red);
      console.log(`Error: ${sdkResult.error}`);
    }

  } catch (error) {
    log(`\n❌ SDK Authentication: ERROR`, colors.red);
    console.log(`Error: ${error.message}`);
    results.tests.push({
      name: 'SDK Authentication',
      mode: 'sdk',
      success: false,
      error: error.message
    });
  }

  // Test 2: Bearer Token Authentication
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('TEST 2: Bearer Token Authentication (Deprecated Method)', colors.bright + colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  try {
    const bearerProvider = AuthManager.create(AuthMode.BEARER, {
      bearerToken: config.bearerToken,
      model: config.model,
      baseURL: config.baseURL
    });

    const bearerInfo = bearerProvider.getInfo();
    console.log(`\nProvider: ${bearerInfo.name}`);
    console.log(`Status: ${bearerInfo.status}`);
    console.log(`Description: ${bearerInfo.description}`);
    if (bearerInfo.warning) {
      log(`⚠️  Warning: ${bearerInfo.warning}`, colors.yellow);
    }

    console.log('\n📡 Testing connection...');
    const bearerResult = await bearerProvider.testConnection();

    results.tests.push({
      name: 'Bearer Token Authentication',
      mode: 'bearer',
      ...bearerResult
    });

    if (bearerResult.success) {
      log(`\n⚠️  Bearer Token Authentication: SUCCESS (Unexpected!)`, colors.yellow);
      console.log(`Response: "${bearerResult.response}"`);
      console.log(`Response Time: ${bearerResult.responseTime}ms`);
      console.log(`Tokens Used: ${bearerResult.usage ? JSON.stringify(bearerResult.usage) : 'N/A'}`);
      if (bearerResult.warning) {
        log(`\n⚠️  ${bearerResult.warning}`, colors.yellow);
      }
    } else {
      log(`\n✓ Bearer Token Authentication: FAILED (As Expected)`, colors.blue);
      console.log(`Error: ${bearerResult.error}`);
      if (bearerResult.expectedFailure) {
        log(`Note: This failure is expected - bearer token authentication is deprecated`, colors.blue);
      }
    }

  } catch (error) {
    log(`\n✓ Bearer Token Authentication: ERROR (As Expected)`, colors.blue);
    console.log(`Error: ${error.message}`);
    results.tests.push({
      name: 'Bearer Token Authentication',
      mode: 'bearer',
      success: false,
      error: error.message,
      expectedFailure: true
    });
  }

  results.totalTime = Date.now() - startTime;

  // Generate Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('COMPARISON SUMMARY', colors.bright + colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  console.log('\n┌─────────────────────────┬───────────┬──────────────┐');
  console.log('│ Method                  │ Status    │ Response Time│');
  console.log('├─────────────────────────┼───────────┼──────────────┤');

  results.tests.forEach(test => {
    const statusSymbol = test.success ? '✅' : (test.expectedFailure ? '✓' : '❌');
    const statusText = test.success ? 'PASS' : 'FAIL';
    const time = test.responseTime ? `${test.responseTime}ms` : 'N/A';
    console.log(`│ ${test.name.padEnd(23)} │ ${statusSymbol} ${statusText.padEnd(5)} │ ${time.padEnd(12)} │`);
  });

  console.log('└─────────────────────────┴───────────┴──────────────┘');

  // Recommendation
  log('\n📋 RECOMMENDATION:', colors.bright + colors.cyan);

  const sdkTest = results.tests.find(t => t.mode === 'sdk');
  const bearerTest = results.tests.find(t => t.mode === 'bearer');

  if (sdkTest?.success && !bearerTest?.success) {
    log('✅ Use SDK Authentication (as expected)', colors.green);
    console.log('   Bearer token authentication is deprecated and not working.');
    console.log('   The official Nillion SDK is the only supported method.');
  } else if (!sdkTest?.success && bearerTest?.success) {
    log('⚠️  Unexpected: Bearer token works but SDK fails', colors.yellow);
    console.log('   This is unusual - investigate SDK configuration.');
    console.log('   However, you should still use SDK for production.');
  } else if (sdkTest?.success && bearerTest?.success) {
    log('⚠️  Both methods work (unexpected for bearer token)', colors.yellow);
    console.log('   Use SDK authentication - it is the official method.');
    console.log('   Bearer token may be deprecated in the future.');
  } else {
    log('❌ Both methods failed - check credentials and network', colors.red);
    console.log('   Verify your API key and bearer token.');
    console.log('   Check internet connection.');
  }

  console.log(`\n⏱️  Total test time: ${results.totalTime}ms`);
  console.log(`🕐 Test completed at: ${results.timestamp}\n`);

  // Save results to file if requested
  if (config.outputFile) {
    const outputPath = join(process.cwd(), config.outputFile);
    writeFileSync(outputPath, JSON.stringify(results, null, 2));
    log(`\n💾 Results saved to: ${outputPath}`, colors.green);
  }

  return results;
}

// Main execution
async function main() {
  try {
    const config = parseArgs();
    const results = await runComparison(config);

    // Exit with appropriate code
    const allPassed = results.tests.every(t =>
      t.success || (t.expectedFailure && !t.success)
    );

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    log(`\n❌ Comparison failed: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

main();
