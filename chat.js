#!/usr/bin/env node

import { NilaiOpenAIClient, NilAuthInstance } from '@nillion/nilai-ts';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const API_KEY = process.env.NIL_API_KEY || process.argv[2];
const BASE_URL = process.env.NIL_BASE_URL || 'https://nilai-a779.nillion.network/v1/';
const MODEL = process.env.NIL_MODEL || 'google/gemma-3-27b-it';

// Validate API key is provided
if (!API_KEY) {
  console.error('❌ Error: No API key provided');
  console.error('');
  console.error('Please provide your Nil AI API key in one of these ways:');
  console.error('  1. Environment variable: export NIL_API_KEY="your-api-key"');
  console.error('  2. Command line argument: node chat.js your-api-key');
  console.error('  3. Create .env file: NIL_API_KEY=your-api-key');
  console.error('');
  console.error('Get your API key from: https://docs.nillion.com');
  process.exit(1);
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
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

// Create Nillion client using the confirmed working method
function createNilaiClient() {
  return new NilaiOpenAIClient({
    baseURL: BASE_URL,
    apiKey: API_KEY,
    nilauthInstance: NilAuthInstance.SANDBOX,
  });
}

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${colors.green}You: ${colors.reset}`
});

// Chat history to maintain context
let chatHistory = [];

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logAI(message) {
  console.log(`${colors.cyan}Nil AI: ${colors.reset}${message}`);
}

function logSystem(message) {
  console.log(`${colors.gray}[System] ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}[Error] ${message}${colors.reset}`);
}

// Display welcome message
function showWelcome() {
  console.clear();
  console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                    🤖 Nil AI Chat Session                 ║
║                      SANDBOX Environment                  ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  logSystem('Connected to Nil AI using official Nillion SDK');
  logSystem(`Model: ${MODEL}`);
  logSystem(`Base URL: ${BASE_URL}`);
  logSystem(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 8)}`);

  console.log(`\n${colors.yellow}Available commands:${colors.reset}`);
  console.log('  - Type your message and press Enter to chat');
  console.log('  - "exit" or "quit" - End the session');
  console.log('  - "test" - Run API connectivity test');
  console.log('  - "clear" - Clear chat history');
  console.log('  - "history" - Show chat history');
  console.log('  - "help" - Show this help message');

  console.log(`\n${colors.green}Ready to chat! Type your message:${colors.reset}\n`);
}

// Test API connectivity
async function testConnection() {
  logSystem('Testing API connection...');

  try {
    const client = createNilaiClient();
    const startTime = Date.now();

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'user', content: 'Hello! Please respond with just "Connection test successful!"' }
      ],
      max_tokens: 50
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.choices && response.choices[0] && response.choices[0].message) {
      log(`${colors.green}✅ API Connection Test PASSED${colors.reset}`);
      logSystem(`Response time: ${responseTime}ms`);
      logSystem(`Tokens used: ${response.usage ? response.usage.total_tokens : 'N/A'}`);
      logAI(response.choices[0].message.content);
      return true;
    } else {
      logError('Unexpected response format');
      return false;
    }
  } catch (error) {
    logError(`API connection failed: ${error.message}`);

    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Details: ${JSON.stringify(error.response.data, null, 2)}`);
    }

    console.log(`\n${colors.yellow}Troubleshooting tips:${colors.reset}`);
    console.log('1. Check if the API key is still valid');
    console.log('2. Verify internet connection');
    console.log('3. Ensure the Nillion SDK is properly installed');

    return false;
  }
}

// Send message to Nil AI
async function sendMessage(userMessage) {
  try {
    // Add user message to history
    chatHistory.push({ role: 'user', content: userMessage });

    logSystem('Sending message to Nil AI...');

    const client = createNilaiClient();
    const startTime = Date.now();

    // Prepare messages (include chat history for context)
    const messages = chatHistory.slice(-10); // Keep last 10 messages for context

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.choices && response.choices[0] && response.choices[0].message) {
      const aiMessage = response.choices[0].message.content;

      // Add AI response to history
      chatHistory.push({ role: 'assistant', content: aiMessage });

      // Display response
      console.log(''); // Empty line for spacing
      logAI(aiMessage);

      // Show metadata
      logSystem(`Response time: ${responseTime}ms | Tokens: ${response.usage ? response.usage.total_tokens : 'N/A'}`);

      return true;
    } else {
      logError('Received unexpected response format');
      console.log('Full response:', JSON.stringify(response, null, 2));
      return false;
    }

  } catch (error) {
    logError(`Failed to send message: ${error.message}`);

    if (error.response) {
      logError(`HTTP Status: ${error.response.status}`);
      if (error.response.data) {
        logError(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }

    // Provide helpful suggestions
    console.log(`\n${colors.yellow}Try these solutions:${colors.reset}`);
    console.log('1. Type "test" to check API connectivity');
    console.log('2. Check your internet connection');
    console.log('3. Try a shorter message');

    return false;
  }
}

// Show chat history
function showHistory() {
  if (chatHistory.length === 0) {
    logSystem('No chat history yet. Start chatting!');
    return;
  }

  console.log(`\n${colors.yellow}📜 Chat History (${chatHistory.length} messages):${colors.reset}\n`);

  chatHistory.forEach((msg, index) => {
    const timestamp = new Date().toLocaleTimeString();
    if (msg.role === 'user') {
      console.log(`${colors.green}[${index + 1}] You: ${colors.reset}${msg.content}`);
    } else {
      console.log(`${colors.cyan}[${index + 1}] Nil AI: ${colors.reset}${msg.content}`);
    }
  });
  console.log('');
}

// Clear chat history
function clearHistory() {
  chatHistory = [];
  console.clear();
  logSystem('Chat history cleared!');
  showWelcome();
}

// Show help
function showHelp() {
  console.log(`\n${colors.yellow}📋 Available Commands:${colors.reset}`);
  console.log(`${colors.green}Chat Commands:${colors.reset}`);
  console.log('  • Type any message to chat with Nil AI');
  console.log('  • Multi-line messages supported');
  console.log('');
  console.log(`${colors.blue}System Commands:${colors.reset}`);
  console.log('  • "test" - Test API connection and response time');
  console.log('  • "clear" - Clear chat history and start fresh');
  console.log('  • "history" - Show all previous messages');
  console.log('  • "help" - Show this help message');
  console.log('  • "exit" or "quit" - End the chat session');
  console.log('');
  console.log(`${colors.magenta}Tips:${colors.reset}`);
  console.log('  • Chat maintains context from previous messages');
  console.log('  • Responses are limited to 500 tokens');
  console.log('  • Connection uses official Nillion SDK');
  console.log('');
}

// Handle user input
function handleInput(input) {
  const command = input.trim().toLowerCase();

  // Handle system commands
  switch (command) {
    case 'exit':
    case 'quit':
      logSystem('Goodbye! Chat session ended.');
      rl.close();
      process.exit(0);
      break;

    case 'test':
      testConnection().then(() => {
        console.log('');
        rl.prompt();
      });
      return;

    case 'clear':
      clearHistory();
      rl.prompt();
      return;

    case 'history':
      showHistory();
      rl.prompt();
      return;

    case 'help':
      showHelp();
      rl.prompt();
      return;

    case '':
      // Empty input, just show prompt again
      rl.prompt();
      return;
  }

  // If not a system command, treat as chat message
  if (input.trim().length > 0) {
    sendMessage(input.trim()).then(() => {
      console.log('');
      rl.prompt();
    });
  } else {
    rl.prompt();
  }
}

// Handle program termination
process.on('SIGINT', () => {
  console.log('\n');
  logSystem('Chat session interrupted. Goodbye!');
  rl.close();
  process.exit(0);
});

// Main function
async function main() {
  showWelcome();

  // Initial connection test
  logSystem('Running initial connection test...');
  const connectionOk = await testConnection();

  if (!connectionOk) {
    logError('Initial connection test failed. You can still try chatting or run "test" command.');
  }

  console.log('');

  // Set up readline event handlers
  rl.on('line', handleInput);

  rl.on('close', () => {
    logSystem('Chat session ended. Goodbye! 👋');
    process.exit(0);
  });

  // Start interactive session
  rl.prompt();
}

// Start the chat application
main().catch(error => {
  logError(`Failed to start chat application: ${error.message}`);
  process.exit(1);
});