#!/usr/bin/env node

/**
 * Diagnostic Tool - Comprehensive Nil AI API Testing
 *
 * Tests API key authentication and bearer token authentication,
 * identifies failure points, and generates diagnostic reports.
 *
 * Usage:
 *   node testing/diagnosticTool.js [api-key] [options]
 *
 * Options:
 *   --json          Output results as JSON
 *   --save          Save report to file
 *   --bearer-token  Custom bearer token (default: Nillion2025)
 */

import { DiagnosticService } from '../auth/DiagnosticService.js';
import fs from 'fs/promises';
import path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    apiKey: null,
    bearerToken: 'Nillion2025',
    baseURL: 'https://nilai-a779.nillion.network/v1',
    model: 'google/gemma-3-27b-it',
    outputJson: false,
    saveReport: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--json') {
      config.outputJson = true;
    } else if (arg === '--save') {
      config.saveReport = true;
    } else if (arg === '--bearer-token' && args[i + 1]) {
      config.bearerToken = args[++i];
    } else if (arg === '--base-url' && args[i + 1]) {
      config.baseURL = args[++i];
    } else if (arg === '--model' && args[i + 1]) {
      config.model = args[++i];
    } else if (!arg.startsWith('--') && !config.apiKey) {
      config.apiKey = arg;
    }
  }

  return config;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
${colors.bright}Nil AI Diagnostic Tool${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node testing/diagnosticTool.js [api-key] [options]

${colors.cyan}Arguments:${colors.reset}
  api-key                 Your Nil AI API key (optional if testing bearer token only)

${colors.cyan}Options:${colors.reset}
  --json                  Output results as JSON
  --save                  Save diagnostic report to file
  --bearer-token <token>  Custom bearer token (default: Nillion2025)
  --base-url <url>        Custom base URL
  --model <name>          Custom model name
  -h, --help              Show this help message

${colors.cyan}Examples:${colors.reset}
  # Run diagnostics with API key
  node testing/diagnosticTool.js your-api-key-here

  # Test bearer token only
  node testing/diagnosticTool.js

  # Save report to file
  node testing/diagnosticTool.js your-api-key --save

  # Output as JSON
  node testing/diagnosticTool.js your-api-key --json
`);
}

/**
 * Print colored header
 */
function printHeader(text) {
  const line = '═'.repeat(70);
  console.log(`\n${colors.cyan}${line}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.cyan}${line}${colors.reset}\n`);
}

/**
 * Print section header
 */
function printSection(text) {
  console.log(`\n${colors.bright}${colors.blue}▶ ${text}${colors.reset}`);
  console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}`);
}

/**
 * Get color for severity
 */
function getSeverityColor(severity) {
  const severityColors = {
    critical: colors.bgRed + colors.white,
    error: colors.red,
    warning: colors.yellow,
    success: colors.green,
    info: colors.cyan
  };
  return severityColors[severity] || colors.white;
}

/**
 * Print test result
 */
function printTestResult(name, result) {
  const icon = result.success ? '✓' : '✗';
  const color = result.success ? colors.green : colors.red;
  const status = result.success ? 'PASS' : 'FAIL';

  console.log(`  ${color}${icon} ${name}${colors.reset}`);
  console.log(`    Status: ${color}${status}${colors.reset}`);

  if (result.responseTime) {
    console.log(`    Response Time: ${colors.dim}${result.responseTime}ms${colors.reset}`);
  }

  if (result.success && result.data) {
    if (Array.isArray(result.data)) {
      console.log(`    Data: ${colors.dim}${result.data.length} items${colors.reset}`);
    } else if (typeof result.data === 'object') {
      const keys = Object.keys(result.data);
      console.log(`    Data: ${colors.dim}${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}${colors.reset}`);
    }
  }

  if (!result.success && result.error) {
    console.log(`    Error: ${colors.red}${result.error}${colors.reset}`);
  }

  if (result.note) {
    console.log(`    Note: ${colors.yellow}${result.note}${colors.reset}`);
  }

  console.log();
}

/**
 * Format diagnostic results as text report
 */
function formatTextReport(results) {
  let report = '';

  // Header
  report += '\n' + '═'.repeat(70) + '\n';
  report += '  NIL AI API DIAGNOSTIC REPORT\n';
  report += '═'.repeat(70) + '\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  // Configuration
  report += 'Configuration:\n';
  report += `  Base URL: ${results.config?.baseURL || 'N/A'}\n`;
  report += `  Model: ${results.config?.model || 'N/A'}\n`;
  report += `  API Key: ${results.config?.apiKey ? results.config.apiKey.substring(0, 8) + '...' : 'Not provided'}\n`;
  report += `  Bearer Token: ${results.config?.bearerToken || 'N/A'}\n\n`;

  // Diagnosis
  report += '─'.repeat(70) + '\n';
  report += 'DIAGNOSIS\n';
  report += '─'.repeat(70) + '\n';
  report += `Scenario: ${results.diagnosis?.scenario || 'Unknown'}\n`;
  report += `Severity: ${results.diagnosis?.severity?.toUpperCase() || 'UNKNOWN'}\n`;
  report += `Description: ${results.diagnosis?.description || 'No diagnosis available'}\n\n`;

  // Test Results Summary
  report += '─'.repeat(70) + '\n';
  report += 'TEST RESULTS SUMMARY\n';
  report += '─'.repeat(70) + '\n\n';

  // SDK Authentication
  const sdkTest = results.tests?.sdk;
  if (sdkTest) {
    report += 'SDK Authentication:\n';
    if (sdkTest.skipped) {
      report += `  Status: SKIPPED (${sdkTest.reason})\n`;
    } else {
      report += `  Status: ${sdkTest.success ? 'SUCCESS' : 'FAILED'}\n`;
      if (sdkTest.error) {
        report += `  Error: ${sdkTest.error}\n`;
      }
      if (sdkTest.responseTime) {
        report += `  Response Time: ${sdkTest.responseTime}ms\n`;
      }
    }
    report += '\n';
  }

  // Bearer Token Authentication
  const bearerTest = results.tests?.bearer;
  if (bearerTest) {
    report += 'Bearer Token Authentication:\n';
    if (bearerTest.models) {
      report += `  Models Endpoint: ${bearerTest.models.success ? 'SUCCESS' : 'FAILED'}\n`;
      if (bearerTest.models.data) {
        report += `  Models Found: ${bearerTest.models.data.length}\n`;
      }
    }
    if (bearerTest.chat) {
      report += `  Chat Endpoint: ${bearerTest.chat.success ? 'SUCCESS' : 'FAILED'}\n`;
    }
    report += '\n';
  }

  // Endpoint Availability
  const endpointsTest = results.tests?.endpoints;
  if (endpointsTest) {
    report += 'Endpoint Availability:\n';
    for (const [endpoint, result] of Object.entries(endpointsTest)) {
      report += `  ${endpoint}: ${result.success ? 'AVAILABLE' : 'UNAVAILABLE'}\n`;
    }
    report += '\n';
  }

  // Service Health
  const healthTest = results.tests?.health;
  if (healthTest) {
    report += 'Service Health:\n';
    report += `  Status: ${healthTest.success ? 'HEALTHY' : 'UNHEALTHY'}\n`;
    if (healthTest.data?.uptime) {
      report += `  Uptime: ${healthTest.data.uptime}\n`;
    }
    if (healthTest.data?.status) {
      report += `  Status: ${healthTest.data.status}\n`;
    }
    report += '\n';
  }

  // Usage Statistics
  const usageTest = results.tests?.usage;
  if (usageTest) {
    report += 'Usage Statistics:\n';
    report += `  Status: ${usageTest.success ? 'AVAILABLE' : 'UNAVAILABLE'}\n`;
    if (usageTest.data) {
      report += `  Total Queries: ${usageTest.data.queries || 'N/A'}\n`;
      report += `  Total Tokens: ${usageTest.data.total_tokens || 'N/A'}\n`;
    }
    report += '\n';
  }

  // Recommendations
  report += '─'.repeat(70) + '\n';
  report += 'RECOMMENDATIONS\n';
  report += '─'.repeat(70) + '\n\n';

  results.recommendations.forEach((rec, index) => {
    report += `${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}\n`;
    report += `   ${rec.description}\n`;
    if (rec.action) {
      report += `   Action: ${rec.action}\n`;
    }
    if (rec.link) {
      report += `   Learn more: ${rec.link}\n`;
    }
    report += '\n';
  });

  report += '═'.repeat(70) + '\n';
  report += 'End of Report\n';
  report += '═'.repeat(70) + '\n';

  return report;
}

/**
 * Print diagnostic results in human-readable format
 */
function printResults(results) {
  printHeader('NIL AI API DIAGNOSTIC REPORT');

  // Configuration
  console.log(`${colors.dim}Configuration:${colors.reset}`);
  console.log(`  Base URL: ${colors.cyan}${results.config?.baseURL || 'N/A'}${colors.reset}`);
  console.log(`  Model: ${colors.cyan}${results.config?.model || 'N/A'}${colors.reset}`);
  console.log(`  API Key: ${colors.cyan}${results.config?.apiKey ? results.config.apiKey.substring(0, 8) + '...' : 'Not provided'}${colors.reset}`);
  console.log(`  Bearer Token: ${colors.cyan}${results.config?.bearerToken || 'N/A'}${colors.reset}`);

  // Diagnosis
  printSection('DIAGNOSIS');
  const diagColor = getSeverityColor(results.diagnosis?.severity || 'info');
  console.log(`  Scenario: ${colors.bright}${results.diagnosis?.scenario || 'Unknown'}${colors.reset}`);
  console.log(`  Severity: ${diagColor}${results.diagnosis?.severity?.toUpperCase() || 'UNKNOWN'}${colors.reset}`);
  console.log(`  ${results.diagnosis?.description || 'No diagnosis available'}`);

  // SDK Authentication
  if (results.tests?.sdk) {
    printSection('SDK AUTHENTICATION');
    if (results.tests.sdk.skipped) {
      console.log(`  ${colors.yellow}⊘ Skipped: ${results.tests.sdk.reason}${colors.reset}\n`);
    } else {
      printTestResult('API Key Authentication', results.tests.sdk);
    }
  }

  // Bearer Token Authentication
  if (results.tests?.bearer) {
    printSection('BEARER TOKEN AUTHENTICATION');
    if (results.tests.bearer.models) {
      printTestResult('Models Endpoint (GET /v1/models)', results.tests.bearer.models);
    }
    if (results.tests.bearer.chat) {
      printTestResult('Chat Endpoint (POST /v1/chat/completions)', results.tests.bearer.chat);
    }
  }

  // Endpoint Availability
  if (results.tests?.endpoints) {
    printSection('ENDPOINT AVAILABILITY');
    for (const [endpoint, result] of Object.entries(results.tests.endpoints)) {
      printTestResult(endpoint, result);
    }
  }

  // Service Health
  if (results.tests?.health) {
    printSection('SERVICE HEALTH');
    printTestResult('Health Check', results.tests.health);
    if (results.tests.health.data?.uptime) {
      console.log(`  ${colors.dim}Uptime: ${results.tests.health.data.uptime}${colors.reset}\n`);
    }
  }

  // Usage Statistics
  if (results.tests?.usage) {
    printSection('USAGE STATISTICS');
    printTestResult('Usage Stats', results.tests.usage);
    if (results.tests.usage.data) {
      console.log(`  ${colors.dim}Queries: ${results.tests.usage.data.queries || 'N/A'}${colors.reset}`);
      console.log(`  ${colors.dim}Total Tokens: ${results.tests.usage.data.total_tokens || 'N/A'}${colors.reset}\n`);
    }
  }

  // Subscription Status
  if (results.tests?.subscription) {
    printSection('SUBSCRIPTION STATUS');
    printTestResult('Subscription Verification', results.tests.subscription);
  }

  // Recommendations
  printSection('RECOMMENDATIONS');
  results.recommendations.forEach((rec, index) => {
    const priorityColor = rec.priority === 'critical' ? colors.bgRed + colors.white :
                         rec.priority === 'high' ? colors.red :
                         rec.priority === 'medium' ? colors.yellow :
                         colors.cyan;

    const title = rec.title || rec.action || 'Recommendation';
    console.log(`  ${colors.bright}${index + 1}. ${title}${colors.reset}`);
    console.log(`     ${priorityColor}[${rec.priority.toUpperCase()}]${colors.reset} ${rec.description}`);
    if (rec.action && rec.action !== title) {
      console.log(`     ${colors.dim}Action: ${rec.action}${colors.reset}`);
    }
    if (rec.link) {
      console.log(`     ${colors.dim}Learn more: ${rec.link}${colors.reset}`);
    }
    console.log();
  });

  console.log(`${colors.cyan}${'═'.repeat(70)}${colors.reset}\n`);
}

/**
 * Save diagnostic report to file
 */
async function saveReport(results, config) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportsDir = path.join(process.cwd(), 'diagnostic-reports');

  // Create reports directory if it doesn't exist
  try {
    await fs.mkdir(reportsDir, { recursive: true });
  } catch (error) {
    console.error(`${colors.red}Failed to create reports directory: ${error.message}${colors.reset}`);
    return;
  }

  // Save JSON report
  const jsonPath = path.join(reportsDir, `diagnostic-${timestamp}.json`);
  try {
    await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));
    console.log(`${colors.green}✓ JSON report saved: ${jsonPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to save JSON report: ${error.message}${colors.reset}`);
  }

  // Save text report
  const textPath = path.join(reportsDir, `diagnostic-${timestamp}.txt`);
  try {
    const textReport = formatTextReport(results);
    await fs.writeFile(textPath, textReport);
    console.log(`${colors.green}✓ Text report saved: ${textPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to save text report: ${error.message}${colors.reset}`);
  }
}

/**
 * Main function
 */
async function main() {
  const config = parseArgs();

  printHeader('NIL AI API DIAGNOSTIC TOOL');
  console.log(`${colors.dim}Starting comprehensive diagnostic tests...${colors.reset}\n`);

  // Create diagnostic service
  const diagnostic = new DiagnosticService(config);

  // Run full diagnostic
  let results;
  try {
    results = await diagnostic.runFullDiagnostic();
  } catch (error) {
    console.error(`${colors.red}${colors.bright}Diagnostic failed: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }

  // Output results
  if (config.outputJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    printResults(results);
  }

  // Save report if requested
  if (config.saveReport) {
    await saveReport(results, config);
  }

  // Exit with appropriate code
  const exitCode = results.diagnosis.severity === 'critical' ||
                   results.diagnosis.severity === 'error' ? 1 : 0;
  process.exit(exitCode);
}

// Run main function
main().catch(error => {
  console.error(`${colors.red}${colors.bright}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});
