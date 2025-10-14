# Nil AI API Diagnostic System

Comprehensive automated testing and failure investigation system for Nil AI API authentication.

## Overview

The diagnostic system provides automated testing to identify why an API key might fail, comparing SDK authentication against bearer token authentication, and generating actionable recommendations.

---

## Components

### 1. DiagnosticService (`auth/DiagnosticService.js`)

Core diagnostic engine that runs comprehensive tests.

**Features:**
- SDK authentication testing
- Bearer token authentication testing
- Endpoint availability checks
- Service health monitoring
- Usage statistics retrieval
- Automated diagnosis generation
- Prioritized recommendations

**Usage:**
```javascript
import { DiagnosticService } from './auth/DiagnosticService.js';

const diagnostic = new DiagnosticService({
  apiKey: 'your-api-key',
  bearerToken: 'Nillion2025',
  model: 'google/gemma-3-27b-it',
  baseURL: 'https://nilai-a779.nillion.network/v1',
  verbose: true
});

const results = await diagnostic.runFullDiagnostic();
console.log(results.diagnosis);
console.log(results.recommendations);
```

---

### 2. CLI Diagnostic Tool (`testing/diagnosticTool.js`)

Command-line interface for running diagnostics.

**Installation:**
```bash
chmod +x testing/diagnosticTool.js
```

**Usage:**
```bash
# Run with API key
node testing/diagnosticTool.js YOUR_API_KEY

# Run with bearer token only (no API key)
node testing/diagnosticTool.js

# Save reports to file
node testing/diagnosticTool.js YOUR_API_KEY --save

# Output as JSON
node testing/diagnosticTool.js YOUR_API_KEY --json

# Custom bearer token
node testing/diagnosticTool.js YOUR_API_KEY --bearer-token CUSTOM_TOKEN

# Full options
node testing/diagnosticTool.js YOUR_API_KEY \
  --bearer-token Nillion2025 \
  --base-url https://nilai-a779.nillion.network/v1 \
  --model google/gemma-3-27b-it \
  --save \
  --json
```

**Output:**
- Colored terminal output with test results
- Diagnosis with severity indicators
- Prioritized recommendations
- Optional JSON export
- Saved reports in `diagnostic-reports/` directory

---

### 3. BearerTokenService (`verification-ui/src/services/BearerTokenService.js`)

Browser-compatible bearer token authentication service for Electron app.

**Features:**
- Models endpoint testing
- Health checks
- Usage statistics
- Chat completions testing (expected to fail)
- Comparison with API key results
- Diagnosis generation

**Usage:**
```javascript
import { BearerTokenService } from './services/BearerTokenService';

const bearerService = new BearerTokenService({
  bearerToken: 'Nillion2025',
  baseURL: 'https://nilai-a779.nillion.network/v1',
  model: 'google/gemma-3-27b-it'
});

// Test connection
const result = await bearerService.testConnection();

// Run full test suite
const fullResults = await bearerService.runFullTest();

// Compare with API key results
const comparison = await bearerService.compareWithAPIKey(apiKeyResults);
```

---

### 4. DiagnosticPanel Component (`verification-ui/src/components/DiagnosticPanel.js`)

React component for the Electron app providing visual diagnostics.

**Features:**
- One-click diagnostic testing
- Visual status cards with color-coded results
- Real-time test execution
- Detailed test breakdowns
- Prioritized recommendations
- Export results as JSON

**Integration:**
```javascript
import { DiagnosticPanel } from './components/DiagnosticPanel';

<DiagnosticPanel
  apiKey={currentApiKey}
  baseURL="https://nilai-a779.nillion.network/v1"
  model={selectedModel}
/>
```

---

## Diagnostic Scenarios

The system identifies 6 primary scenarios:

### 1. ALL_WORKING
- **Severity**: Success
- **Description**: Both SDK and bearer token work
- **Action**: No action needed

### 2. SDK_ONLY
- **Severity**: Success/Info
- **Description**: SDK works, bearer token limited
- **Action**: Continue using SDK (expected behavior)

### 3. API_KEY_ISSUE
- **Severity**: Error
- **Description**: Bearer works but SDK fails
- **Action**: Check API key format and subscription
- **Common Causes**:
  - Invalid API key format (not 64 hex characters)
  - Expired subscription
  - Incorrectly copied key
  - Subscription not active

### 4. AUTHENTICATION_FAILURE
- **Severity**: Error
- **Description**: Both methods fail but service is up
- **Action**: Verify credentials with support

### 5. SERVICE_DOWN
- **Severity**: Critical
- **Description**: Service unavailable
- **Action**: Wait and retry, check service status

### 6. NO_API_KEY
- **Severity**: Warning
- **Description**: No API key provided for testing
- **Action**: Provide API key for complete diagnostics

---

## Test Suite

### SDK Authentication Tests
1. **Connection Test**: Verifies API key works with Nillion SDK
2. **Response Time**: Measures authentication latency
3. **Error Detection**: Captures specific failure reasons

### Bearer Token Tests
1. **Models Endpoint** (`GET /v1/models`): Expected to work
2. **Health Check** (`GET /health`): Service status
3. **Usage Statistics** (`GET /usage`): Token usage data
4. **Chat Completions** (`POST /v1/chat/completions`): Expected to fail with 500

### Endpoint Availability
- `/models` - Model list availability
- `/health` - Service health status
- `/chat/completions` - Chat endpoint status

---

## Bearer Token "Nillion2025" - Research Findings

### Status: ✅ **ACTIVE & FUNCTIONAL** (Read-Only)

**Evidence:**
- Successfully processed 392 queries (2.5M tokens)
- Works for `/models`, `/health`, `/usage`, `/attestation/report`
- Returns proper 403 when token is missing (proves authentication works)
- Returns 500 for `/chat/completions` (permission issue, not auth failure)

### What Works ✅
- `GET /v1/models` - List available models
- `GET /v1/health` - Service health status
- `GET /v1/usage` - Token usage statistics
- `GET /v1/attestation/report` - TEE attestation data

### What Doesn't Work ❌
- `POST /v1/chat/completions` - Returns 500 Internal Server Error
- Write operations - Read-only token
- Model inference - Requires SDK authentication

### Technical Details
- **Format**: Simple 12-character string (not JWT)
- **Authentication**: HTTP Bearer token
- **Permissions**: Read-only operations
- **Purpose**: Testing, API discovery, monitoring
- **Recommendation**: Use SDK for production

See [BEARER-TOKEN-RESEARCH.md](./BEARER-TOKEN-RESEARCH.md) for full research findings.

---

## Recommendations System

### Priority Levels

**CRITICAL** (Red)
- Service completely down
- Total authentication failure
- Immediate action required

**HIGH** (Red)
- API key validation failed
- Subscription issues
- Incorrect key format
- Urgent action recommended

**MEDIUM** (Yellow)
- SDK not installed
- Configuration issues
- Best practices
- Action suggested

**INFO** (Blue)
- System working correctly
- Helpful information
- No action needed

### Example Recommendations

**API Key Issue Detected:**
1. **[HIGH]** Verify API key format
   - Ensure exactly 64 hexadecimal characters
   - Action: Check key at subscription portal

2. **[HIGH]** Check subscription status
   - Visit https://subscription.nillion.com
   - Verify subscription is active

3. **[MEDIUM]** Verify key source
   - Ensure key copied correctly
   - Action: Re-copy from subscription portal

4. **[MEDIUM]** Check SDK installation
   - Run: `npm install @nillion/nilai-ts`
   - Ensure SDK is up to date

---

## Report Formats

### Terminal Output
- Color-coded status indicators
- Section headers with icons
- Detailed test results
- Prioritized recommendations
- Response times and metrics

### JSON Export
```json
{
  "timestamp": "2025-10-14T09:10:26.840Z",
  "config": {
    "apiKey": "3d4f7b2a...",
    "bearerToken": "Nillion2025",
    "model": "google/gemma-3-27b-it",
    "baseURL": "https://nilai-a779.nillion.network/v1"
  },
  "tests": {
    "sdk": {
      "success": false,
      "error": "Invalid API key format",
      "responseTime": 234
    },
    "bearer": {
      "models": {
        "success": true,
        "data": [...],
        "responseTime": 734
      },
      "chat": {
        "success": false,
        "expectedFailure": true,
        "status": 500
      }
    }
  },
  "diagnosis": {
    "scenario": "API_KEY_ISSUE",
    "severity": "error",
    "message": "Bearer token works but API key fails..."
  },
  "recommendations": [...]
}
```

### Text Report
```
═══════════════════════════════════════════════════════════════
  NIL AI API DIAGNOSTIC REPORT
═══════════════════════════════════════════════════════════════
Generated: 2025-10-14 09:10:26

Configuration:
  Base URL: https://nilai-a779.nillion.network/v1
  Model: google/gemma-3-27b-it
  API Key: 3d4f7b2a...
  Bearer Token: Nillion2025

─────────────────────────────────────────────────────────────
DIAGNOSIS
─────────────────────────────────────────────────────────────
Scenario: API_KEY_ISSUE
Severity: ERROR
Description: Bearer token works but API key fails...

[... detailed test results ...]

RECOMMENDATIONS
─────────────────────────────────────────────────────────────
1. [HIGH] Verify API key format
   Ensure your API key is exactly 64 hexadecimal characters.
   Action: Check your API key at https://subscription.nillion.com

[... more recommendations ...]
```

---

## Integration Guide

### Electron App Integration

1. **Import Component:**
```javascript
import { DiagnosticPanel } from './components/DiagnosticPanel';
```

2. **Add to Tabs:**
```javascript
{activeTab === 'diagnostics' && (
  <DiagnosticPanel
    apiKey={currentApiKey}
    baseURL="https://nilai-a779.nillion.network/v1"
    model={selectedModel}
  />
)}
```

3. **Update Header:**
```javascript
<TabButton
  active={activeTab === 'diagnostics'}
  onClick={() => onTabChange('diagnostics')}
>
  <Activity />
  Diagnostics
</TabButton>
```

### CLI Integration

Add to your npm scripts:
```json
{
  "scripts": {
    "diagnose": "node testing/diagnosticTool.js",
    "diagnose:save": "node testing/diagnosticTool.js --save"
  }
}
```

---

## Troubleshooting Workflow

### Step 1: Run Diagnostics
```bash
node testing/diagnosticTool.js YOUR_API_KEY --save
```

### Step 2: Review Diagnosis
Check the scenario:
- **ALL_WORKING**: ✅ Everything fine
- **SDK_ONLY**: ✅ Expected behavior
- **API_KEY_ISSUE**: ⚠️ Action required
- **BOTH_FAILED**: ❌ Critical issue

### Step 3: Follow Recommendations
Execute recommendations in priority order:
1. **CRITICAL**: Immediate action
2. **HIGH**: Urgent fixes
3. **MEDIUM**: Important improvements
4. **INFO**: Optional enhancements

### Step 4: Re-test
```bash
node testing/diagnosticTool.js YOUR_API_KEY
```

### Step 5: Export Report (if issue persists)
```bash
node testing/diagnosticTool.js YOUR_API_KEY --save --json
```
Share the JSON report with support.

---

## API Key Validation Checklist

✅ **Format Validation**
- [ ] Exactly 64 characters
- [ ] All hexadecimal (0-9, a-f)
- [ ] No spaces or special characters
- [ ] No line breaks

✅ **Source Verification**
- [ ] Copied from official subscription portal
- [ ] Not a sample/placeholder key
- [ ] Not an expired key
- [ ] Matches your active subscription

✅ **Subscription Status**
- [ ] Subscription is active
- [ ] Payment method valid
- [ ] Not past expiration date
- [ ] Correct subscription tier

✅ **Technical Checks**
- [ ] SDK installed (`@nillion/nilai-ts`)
- [ ] Node.js version 18+
- [ ] Network connectivity
- [ ] No firewall blocking API

---

## Common Error Patterns

### "401 Unauthorized"
**Cause**: Invalid API key or missing authentication
**Solution**:
1. Verify API key format (64 hex characters)
2. Check subscription status
3. Ensure SDK is installed
4. Re-copy key from portal

### "500 Internal Server Error" (Bearer Token Chat)
**Cause**: Expected behavior - bearer token is read-only
**Solution**: Use SDK for chat completions
**Note**: This is NOT an error - bearer tokens cannot do chat

### "404 Not Found"
**Cause**: Incorrect endpoint URL
**Solution**:
1. Verify baseURL: `https://nilai-a779.nillion.network/v1`
2. Ensure trailing slash for SDK
3. Remove `/v1` for health/usage endpoints

### "Network Error"
**Cause**: Connectivity issues
**Solution**:
1. Check internet connection
2. Verify firewall settings
3. Test service status
4. Try again later

---

## Best Practices

### For Development
1. Run diagnostics before starting development
2. Save diagnostic reports for troubleshooting
3. Test API key immediately after obtaining
4. Use verbose mode for detailed debugging

### For Production
1. Monitor API key health regularly
2. Set up automated diagnostic checks
3. Keep diagnostic logs for analysis
4. Have backup authentication ready

### For Troubleshooting
1. Always run diagnostics first
2. Export results before contacting support
3. Follow recommendations in priority order
4. Re-test after each fix
5. Document successful solutions

---

## Advanced Usage

### Custom Diagnostic Scenarios

Create custom diagnostic logic:

```javascript
import { DiagnosticService } from './auth/DiagnosticService.js';

class CustomDiagnosticService extends DiagnosticService {
  async testCustomEndpoint() {
    // Your custom endpoint testing logic
  }

  generateCustomDiagnosis() {
    // Your custom diagnosis logic
  }
}
```

### Automated Monitoring

Set up periodic diagnostic checks:

```javascript
import { DiagnosticService } from './auth/DiagnosticService.js';

async function monitorApiHealth() {
  const diagnostic = new DiagnosticService({
    apiKey: process.env.NIL_API_KEY,
    verbose: false
  });

  const results = await diagnostic.runFullDiagnostic();

  if (results.diagnosis.severity === 'error' || results.diagnosis.severity === 'critical') {
    // Send alert notification
    await sendAlert(results);
  }

  // Save to monitoring database
  await saveToMonitoring(results);
}

// Run every hour
setInterval(monitorApiHealth, 60 * 60 * 1000);
```

---

## FAQ

**Q: How long do diagnostics take?**
A: Typically 3-5 seconds for complete test suite.

**Q: Can I run diagnostics without an API key?**
A: Yes, bearer token tests will still run. Full diagnostics require API key.

**Q: Are diagnostic results saved automatically?**
A: Only with `--save` flag. Otherwise results are shown in terminal only.

**Q: What's the difference between CLI and Electron diagnostics?**
A: Same tests, different interfaces. CLI is for terminal, Electron has visual UI.

**Q: Can I customize the diagnostic tests?**
A: Yes, extend DiagnosticService class and override test methods.

**Q: How often should I run diagnostics?**
A:
- After obtaining new API key: Immediately
- During development: When issues occur
- In production: Weekly or when errors detected

**Q: What does "Bearer token is read-only" mean?**
A: Bearer token "Nillion2025" can only read data (models, health, usage). It cannot perform AI inference or chat completions. This is expected and normal.

**Q: Why does bearer token return 500 for chat?**
A: The token lacks permissions for write operations. 500 is a permission error, not an authentication failure. Use SDK for chat.

---

## Support

**Issues with Diagnostics:**
- GitHub Issues: https://github.com/DrakeN1721/nillion-api-tester/issues

**API Key Problems:**
- Subscription Portal: https://subscription.nillion.com
- Documentation: https://docs.nillion.com

**General Support:**
- Run diagnostics and export report
- Include report in support request
- Describe steps taken to troubleshoot

---

## Changelog

### v1.0.0 (2025-10-14)
- Initial diagnostic system release
- CLI diagnostic tool
- DiagnosticService core engine
- BearerTokenService for browser
- DiagnosticPanel React component
- Comprehensive bearer token research
- 6 diagnostic scenarios
- Prioritized recommendations
- JSON and text report exports
- Electron app integration

---

## License

Same as parent project.

## Contributing

Contributions welcome! Please:
1. Run diagnostics on your changes
2. Include diagnostic reports in PRs
3. Document new diagnostic scenarios
4. Add tests for new features

---

**Last Updated**: 2025-10-14
**Version**: 1.0.0
**Status**: Production Ready
