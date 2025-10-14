#!/usr/bin/env node

import { AuthManager, AuthMode } from './auth/AuthManager.js';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    authMode: AuthMode.SDK, // Default to SDK
    apiKey: null,
    bearerToken: null,
    model: null,
    baseURL: null,
    compare: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--auth-mode' || arg === '-m') {
      config.authMode = args[++i];
    } else if (arg === '--api-key' || arg === '-k') {
      config.apiKey = args[++i];
    } else if (arg === '--bearer-token' || arg === '-t') {
      config.bearerToken = args[++i];
    } else if (arg === '--model') {
      config.model = args[++i];
    } else if (arg === '--base-url') {
      config.baseURL = args[++i];
    } else if (arg === '--compare' || arg === '-c') {
      config.compare = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (!arg.startsWith('--') && !config.apiKey) {
      // First non-flag argument is treated as API key for backwards compatibility
      config.apiKey = arg;
    }
  }

  // Get from environment variables if not provided
  config.apiKey = config.apiKey || process.env.NIL_API_KEY;
  config.bearerToken = config.bearerToken || process.env.NIL_BEARER_TOKEN || 'Nillion2025';
  config.model = config.model || process.env.NIL_MODEL || 'google/gemma-3-27b-it';
  config.baseURL = config.baseURL || process.env.NIL_BASE_URL;

  return config;
}

function showHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           Nil AI API Tester - Dual Authentication         ║
╚═══════════════════════════════════════════════════════════╝

USAGE:
  node index.js [OPTIONS] [API_KEY]

OPTIONS:
  -m, --auth-mode <mode>    Authentication mode: 'sdk' or 'bearer'
                            Default: sdk (recommended)

  -k, --api-key <key>       API key for SDK authentication
  -t, --bearer-token <token> Bearer token for bearer authentication
                            Default: Nillion2025 (testing)

  --model <model>           Model to use
                            Default: google/gemma-3-27b-it

  --base-url <url>          Base URL for API
                            Default: https://nilai-a779.nillion.network/v1/

  -c, --compare             Compare both authentication methods side-by-side

  -h, --help                Show this help message

EXAMPLES:
  # Test with SDK authentication (recommended)
  node index.js your-api-key
  node index.js --auth-mode sdk --api-key your-api-key

  # Test with Bearer token (deprecated - testing only)
  node index.js --auth-mode bearer --bearer-token Nillion2025

  # Compare both methods side-by-side
  node index.js --compare --api-key your-api-key --bearer-token Nillion2025

  # Using environment variables
  export NIL_API_KEY=your-api-key
  node index.js

AUTHENTICATION MODES:
  ✅ SDK (Recommended)
     Uses official @nillion/nilai-ts SDK with NUC token generation
     This is the ONLY officially supported method

  ⚠️  Bearer Token (Deprecated - Testing Only)
     Uses raw HTTP with Authorization: Bearer header
     Expected to FAIL with 401 Unauthorized
     Provided for testing and comparison purposes only

For more information, see: docs/AUTH-METHODS.md
`);
}

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

async function testAuthentication(authProvider, modeName) {
  logHeader(`Testing ${modeName} Authentication`);

  const info = authProvider.getInfo();

  // Display provider information
  logInfo(`Mode: ${info.name}`);
  logInfo(`Status: ${info.status}`);
  logInfo(`Description: ${info.description}`);

  if (info.deprecated) {
    logWarning('⚠️  This authentication method is DEPRECATED');
    logWarning('   Expected result: 401 Unauthorized (Authentication Failed)');
  }

  console.log('\nConfiguration:');
  Object.entries(info.config).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  // Test connection
  console.log('\n📡 Testing connection...');
  const result = await authProvider.testConnection();

  console.log('\n' + '─'.repeat(60));

  if (result.success) {
    logSuccess(`${modeName} authentication SUCCESSFUL!`);
    console.log(`\nResponse: "${result.response}"`);
    console.log(`\nDetails:`);
    console.log(`  Model: ${result.model}`);
    console.log(`  Response Time: ${result.responseTime}ms`);
    console.log(`  Tokens Used: ${result.usage ? JSON.stringify(result.usage) : 'N/A'}`);

    if (result.warning) {
      logWarning(`\n⚠️  ${result.warning}`);
    }

    return true;
  } else {
    logError(`${modeName} authentication FAILED`);
    console.log(`\nError: ${result.error}`);

    if (result.expectedFailure) {
      logInfo('✓ This failure was expected - bearer token authentication is deprecated');
    }

    if (result.note) {
      logInfo(`Note: ${result.note}`);
    }

    if (result.details) {
      console.log(`\nDetails:`);
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }

    return false;
  }
}

async function compareAuthMethods(config) {
  logHeader('Authentication Methods Comparison');

  console.log('This will test both authentication methods side-by-side:\n');
  console.log('  1. SDK Authentication (Official - Expected to work)');
  console.log('  2. Bearer Token Authentication (Deprecated - Expected to fail)\n');

  if (!config.apiKey) {
    logError('API key is required for comparison mode');
    console.log('\nProvide an API key using:');
    console.log('  --api-key your-key');
    console.log('  or set NIL_API_KEY environment variable');
    process.exit(1);
  }

  try {
    const results = await AuthManager.compareAuthMethods({
      apiKey: config.apiKey,
      bearerToken: config.bearerToken,
      model: config.model,
      baseURL: config.baseURL
    });

    // Display results
    logHeader('Comparison Results');

    console.log('\n📊 SDK Authentication:');
    console.log('─'.repeat(60));
    if (results.comparison.sdk.success) {
      logSuccess('✅ WORKING');
      console.log(`Response: "${results.comparison.sdk.response}"`);
      console.log(`Response Time: ${results.comparison.sdk.responseTime}ms`);
    } else {
      logError('❌ FAILED');
      console.log(`Error: ${results.comparison.sdk.error}`);
    }

    console.log('\n📊 Bearer Token Authentication:');
    console.log('─'.repeat(60));
    if (results.comparison.bearer.success) {
      logWarning('⚠️  WORKING (Unexpected!)');
      console.log(`Response: "${results.comparison.bearer.response}"`);
      console.log(`Response Time: ${results.comparison.bearer.responseTime}ms`);
    } else {
      logInfo('✓ FAILED (As Expected)');
      console.log(`Error: ${results.comparison.bearer.error}`);
    }

    // Show recommendation
    logHeader('Recommendation');
    console.log(`\n${results.recommendation}\n`);

    // Summary table
    console.log('\n📋 Summary:');
    console.log('┌────────────────┬──────────┬─────────────────┐');
    console.log('│ Method         │ Status   │ Response Time   │');
    console.log('├────────────────┼──────────┼─────────────────┤');
    console.log(`│ SDK            │ ${results.comparison.sdk.success ? '✅ PASS  ' : '❌ FAIL  '} │ ${results.comparison.sdk.responseTime ? results.comparison.sdk.responseTime + 'ms' : 'N/A'} `.padEnd(17) + '│');
    console.log(`│ Bearer Token   │ ${results.comparison.bearer.success ? '⚠️  PASS  ' : '✓ FAIL  '} │ ${results.comparison.bearer.responseTime ? results.comparison.bearer.responseTime + 'ms' : 'N/A'} `.padEnd(17) + '│');
    console.log('└────────────────┴──────────┴─────────────────┘\n');

  } catch (error) {
    logError(`Comparison failed: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  const config = parseArgs();

  // Show header
  console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║              🤖 Nil AI API Tester v2.0                    ║
║              Dual Authentication Support                  ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}`);

  // Comparison mode
  if (config.compare) {
    await compareAuthMethods(config);
    return;
  }

  // Determine which authentication method to use
  let authProvider;
  let credential;

  if (config.authMode === AuthMode.SDK) {
    if (!config.apiKey) {
      logError('API key is required for SDK authentication');
      console.log('\nProvide an API key using:');
      console.log('  node index.js your-api-key');
      console.log('  or use --api-key flag');
      console.log('  or set NIL_API_KEY environment variable');
      console.log('\nFor help: node index.js --help');
      process.exit(1);
    }
    credential = { apiKey: config.apiKey, model: config.model, baseURL: config.baseURL };
  } else if (config.authMode === AuthMode.BEARER) {
    if (!config.bearerToken) {
      logError('Bearer token is required for bearer authentication');
      console.log('\nProvide a bearer token using:');
      console.log('  --bearer-token your-token');
      console.log('  or set NIL_BEARER_TOKEN environment variable');
      process.exit(1);
    }
    credential = { bearerToken: config.bearerToken, model: config.model, baseURL: config.baseURL };
  } else {
    logError(`Invalid authentication mode: ${config.authMode}`);
    console.log('\nValid modes: sdk, bearer');
    console.log('For help: node index.js --help');
    process.exit(1);
  }

  try {
    // Create authentication provider
    authProvider = AuthManager.create(config.authMode, credential);

    // Test authentication
    const success = await testAuthentication(authProvider, config.authMode.toUpperCase());

    // Final summary
    logHeader('Test Summary');
    if (success) {
      logSuccess('✅ All tests passed! Authentication is working.');
    } else {
      logError('❌ Authentication test failed.');

      if (config.authMode === AuthMode.BEARER) {
        console.log('\n💡 This is expected behavior:');
        console.log('   Bearer token authentication is deprecated and no longer supported.');
        console.log('   Please use SDK authentication instead:');
        console.log('   node index.js --auth-mode sdk --api-key your-api-key');
      } else {
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Verify your API key is valid');
        console.log('   2. Check your internet connection');
        console.log('   3. Ensure @nillion/nilai-ts SDK is installed');
        console.log('   4. Try: npm install @nillion/nilai-ts');
      }
    }

    console.log('\n' + '═'.repeat(60) + '\n');

  } catch (error) {
    logError(`Failed to initialize authentication: ${error.message}`);
    console.log('\nFor help: node index.js --help');
    process.exit(1);
  }
}

// Run the program
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
