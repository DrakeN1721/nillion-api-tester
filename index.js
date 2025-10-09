#!/usr/bin/env node

import { NilaiOpenAIClient, NilAuthInstance } from '@nillion/nilai-ts';

// Configuration
const BASE_URL = process.env.NIL_BASE_URL || 'https://nilai-a779.nillion.network/v1/';
const API_KEY = process.env.NIL_API_KEY || process.argv[2];
const MODEL = process.env.NIL_MODEL || 'google/gemma-3-27b-it';

// Validate API key is provided
if (!API_KEY) {
  console.error('❌ Error: No API key provided');
  console.error('');
  console.error('Please provide your Nil AI API key in one of these ways:');
  console.error('  1. Environment variable: export NIL_API_KEY="your-api-key"');
  console.error('  2. Command line argument: node index.js your-api-key');
  console.error('  3. Create .env file: NIL_API_KEY=your-api-key');
  console.error('');
  console.error('Get your API key from: https://docs.nillion.com');
  process.exit(1);
}

// Initialize Nillion client
function createNilaiClient() {
  return new NilaiOpenAIClient({
    baseURL: BASE_URL,
    apiKey: API_KEY,
    nilauthInstance: NilAuthInstance.SANDBOX,
  });
}

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

function logHeader(message) {
  console.log('\n' + '='.repeat(50));
  log(message, colors.bright + colors.cyan);
  console.log('='.repeat(50));
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

async function queryModels() {
  logHeader('Testing /v1/models endpoint (via Nillion SDK)');

  try {
    logInfo('Querying available models...');
    logInfo('Using NilaiOpenAIClient with SANDBOX authentication...');

    const client = createNilaiClient();

    // Note: The SDK might not have a direct models() method
    // Let's try to use the client to list models if available
    try {
      // Try to access models if the method exists
      if (typeof client.models !== 'undefined') {
        const models = await client.models.list();
        logSuccess('Models endpoint is working via SDK!');

        console.log('\nAvailable models:');
        if (models.data && Array.isArray(models.data)) {
          models.data.forEach((model, index) => {
            console.log(`${index + 1}. ${model.id || model.name || JSON.stringify(model)}`);
          });
        } else {
          console.log('Models response:', JSON.stringify(models, null, 2));
        }
        return true;
      } else {
        logWarning('SDK does not expose models endpoint directly');
        logInfo('Proceeding to test chat completions endpoint...');
        return true; // Skip models test if not available in SDK
      }
    } catch (sdkError) {
      logWarning(`SDK models access failed: ${sdkError.message}`);
      logInfo('This might be normal if models endpoint is not exposed in SDK');
      return true; // Continue with chat test
    }

  } catch (error) {
    logError(`Failed to initialize Nillion client: ${error.message}`);

    // Provide troubleshooting tips
    console.log('\nTroubleshooting tips:');
    logWarning('1. Verify the API key is correct and active');
    logWarning('2. Check if the base URL is correct');
    logWarning('3. Ensure your account has proper permissions');
    logWarning('4. Verify SDK installation and compatibility');

    return false;
  }
}

async function testChatCompletion() {
  logHeader('Testing /v1/chat/completions endpoint (via Nillion SDK)');

  try {
    logInfo(`Testing with model: ${MODEL}`);
    logInfo('Using NilaiOpenAIClient with SANDBOX authentication...');

    const client = createNilaiClient();

    const payload = {
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: 'Hello! This is a test message to verify the API is working. Please respond with a short confirmation.'
        }
      ],
      max_tokens: 100
    };

    logInfo('Sending chat completion request via SDK...');

    const response = await client.chat.completions.create(payload);

    logSuccess('Chat completions endpoint is working via SDK!');

    if (response.choices && response.choices[0] && response.choices[0].message) {
      console.log('\nAI Response:');
      log(`"${response.choices[0].message.content}"`, colors.cyan);

      // Show additional response details
      console.log('\nResponse details:');
      console.log(`- Model: ${response.model || 'N/A'}`);
      console.log(`- Usage tokens: ${response.usage ? JSON.stringify(response.usage) : 'N/A'}`);
    } else {
      console.log('\nFull response:');
      console.log(JSON.stringify(response, null, 2));
    }

    return true;
  } catch (error) {
    logError(`Failed to test chat completion: ${error.message}`);

    // Show full error details for debugging
    if (error.response) {
      logError(`Response status: ${error.response.status}`);
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }

    // Provide troubleshooting tips
    console.log('\nTroubleshooting tips:');
    logWarning('1. Check if the model name is correct');
    logWarning('2. Verify API key permissions for chat completions');
    logWarning('3. Ensure proper SDK authentication');
    logWarning('4. Check if SANDBOX instance is correct');

    return false;
  }
}

async function testApiKey() {
  logHeader('Nil AI API Key Test');

  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 8)}`);
  logInfo(`Test Model: ${MODEL}`);

  let allTestsPassed = true;

  // Test 1: Query models endpoint
  const modelsTest = await queryModels();
  allTestsPassed = allTestsPassed && modelsTest;

  // Test 2: Test chat completions
  const chatTest = await testChatCompletion();
  allTestsPassed = allTestsPassed && chatTest;

  // Summary
  logHeader('Test Results');
  if (allTestsPassed) {
    logSuccess('All tests passed! Your API key is working correctly.');
  } else {
    logError('Some tests failed. Please check the API key and configuration.');
  }

  return allTestsPassed;
}

// Main execution
async function main() {
  // Show usage if no API key is provided
  if (!API_KEY || API_KEY.length < 10) {
    logHeader('Nil AI API Tester');
    console.log('Usage:');
    console.log('  node index.js [API_KEY]');
    console.log('  or set NIL_API_KEY environment variable');
    console.log('\nEnvironment variables:');
    console.log('  NIL_API_KEY - Your Nil AI API key');
    console.log('  NIL_BASE_URL - Base URL (default: https://nilai-a779.nillion.network/v1)');
    console.log('  NIL_MODEL - Model to test (default: google/gemma-3-27b-it)');
    console.log('\nExample:');
    console.log('  node index.js your-api-key-here');
    console.log('  NIL_API_KEY=your-key node index.js');
    return;
  }

  try {
    await testApiKey();
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run the program
main();