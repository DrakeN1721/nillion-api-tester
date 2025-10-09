#!/usr/bin/env node

import { exec, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  log(`✅ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

// Check if we're in the right directory
function checkEnvironment() {
  const requiredFiles = ['index.js', 'package.json', 'INSTRUCTIONS.md'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(join(__dirname, file)));

  if (missingFiles.length > 0) {
    logError(`Missing required files: ${missingFiles.join(', ')}`);
    logInfo('Please make sure you are in the correct directory with all the Nil AI test files.');
    return false;
  }
  return true;
}

// Get the platform-specific terminal command
function getTerminalCommand() {
  const platform = process.platform;

  if (platform === 'darwin') {
    // macOS
    return {
      command: 'osascript',
      args: [
        '-e',
        `tell application "Terminal" to do script "cd '${__dirname}' && node chat.js"`
      ]
    };
  } else if (platform === 'win32') {
    // Windows
    return {
      command: 'cmd',
      args: ['/c', 'start', 'cmd', '/k', `cd /d "${__dirname}" && node chat.js`]
    };
  } else {
    // Linux
    return {
      command: 'gnome-terminal',
      args: ['--', 'bash', '-c', `cd "${__dirname}" && node chat.js; exec bash`]
    };
  }
}

// Main start function
async function start() {
  logHeader('🚀 Nil AI Interactive Chat Starter');

  // Check environment
  if (!checkEnvironment()) {
    process.exit(1);
  }

  logInfo('Environment check passed ✓');
  logInfo('Starting interactive Nil AI chat session...');

  try {
    const { command, args } = getTerminalCommand();

    logInfo(`Opening new terminal with command: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore'
    });

    child.unref();

    // Give it a moment to start
    setTimeout(() => {
      logSuccess('New terminal opened with Nil AI chat session!');
      logInfo('The chat interface should now be running in a new terminal window.');
      logInfo('If it didn\'t open automatically, run: node chat.js');

      console.log('\n' + colors.cyan + 'Available commands in chat:' + colors.reset);
      console.log('  - Type your message and press Enter to chat');
      console.log('  - Type "exit" or "quit" to end the session');
      console.log('  - Type "test" to run API connectivity test');
      console.log('  - Type "help" for more commands');

      logSuccess('Starter completed successfully!');
    }, 1000);

  } catch (error) {
    logError(`Failed to open terminal: ${error.message}`);
    logWarning('Fallback: You can manually run the chat by executing:');
    log(`  cd ${__dirname}`, colors.yellow);
    log('  node chat.js', colors.yellow);
  }
}

// Run the starter
start();