# Security Policy

## ⚠️ IMPORTANT SECURITY NOTICE

**This tool is designed EXCLUSIVELY for LOCAL development and testing purposes.**

### 🚨 CRITICAL: DO NOT

- ❌ **Deploy this application to the web or any public server**
- ❌ **Share your API keys in code, screenshots, or documentation**
- ❌ **Commit `.env` files or API keys to version control**
- ❌ **Use this tool in production environments**
- ❌ **Expose API keys through environment variables in CI/CD**
- ❌ **Store API keys in plaintext outside of local `.env` files**

### ✅ SAFE USAGE

This application is intended for:
- ✅ **Local API key validation and testing**
- ✅ **Generating verification reports for debugging**
- ✅ **Testing Nillion SDK integration locally**
- ✅ **Demonstrating API key functionality to AI assistants**

## Security Best Practices

### 1. **API Key Management**

- Store API keys ONLY in `.env` files (never committed)
- Use `.env.example` as a template (no real keys)
- Rotate API keys regularly
- Never hardcode API keys in source code
- Use environment variables for configuration

### 2. **Local Development Only**

This Electron application includes security features that:
- Detect when running on localhost
- Warn users about non-local environments
- Require explicit opt-in for browser API key testing
- Store API keys only in local browser storage

### 3. **Data Protection**

- API keys are masked in UI displays
- Exported reports contain masked API keys only
- Chat history is stored locally only
- No data is transmitted to external servers (except Nil AI API)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it by:

1. **DO NOT** open a public GitHub issue
2. Email: draken1721@protonmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)


## Security Features

This application implements **defense-in-depth** security with multiple layers of protection:

### 🔐 1. Content Security Policy (CSP)

The Electron app enforces strict CSP headers that:
- Restrict script execution to trusted sources only
- Block inline scripts and unsafe evaluations (with minimal exceptions for React)
- Limit external connections to Nil AI API only (`https://nilai-a779.nillion.network`)
- Prevent XSS attacks and code injection
- Disable object/embed tags for additional protection

**Implementation**: `verification-ui/public/electron.cjs`

### 🔑 2. Advanced API Key Validation

Before attempting any API connection, keys are validated for:

**Format Validation**:
- Exact length requirement (64 characters for Nillion keys)
- Hexadecimal character validation (0-9, a-f)
- Detection of test/placeholder keys (rejects patterns like "000...000", "test", "demo")
- Type checking to prevent injection attacks

**Real-time Feedback**:
- Instant validation as you type
- Clear error messages for invalid formats
- Prevents accidental submission of malformed keys

**Implementation**: `verification-ui/src/utils/validationUtils.js`

### ⏱️ 3. Rate Limiting

Protects against abuse and accidental API quota exhaustion:

**Default Limits**:
- **10 requests per minute** per application instance
- Configurable window and request count
- Automatic request throttling

**Features**:
- Real-time rate limit status display
- Clear "retry after X seconds" messaging
- Graceful degradation (users aren't blocked permanently)
- Prevents brute force attempts

**Implementation**: Shared `RateLimiter` instance in `nilAIService.js`

### 🔒 4. Secure Keychain Storage

Multi-tier storage security with automatic fallback:

**Tier 1 - System Keychain** (Preferred):
- **macOS**: Keychain Access (encrypted by OS)
- **Windows**: Credential Manager (encrypted by OS)
- **Linux**: Secret Service API (e.g., GNOME Keyring, KWallet)
- Keys encrypted at rest by operating system
- Requires system authentication to access
- Protected from process memory dumps

**Tier 2 - Encrypted LocalStorage** (Fallback):
- XOR encryption with device-specific key
- Device fingerprint-based key derivation
- Better than plain text storage
- Automatic fallback if keychain unavailable

**Implementation**:
- `verification-ui/src/utils/secureStorage.js`
- `verification-ui/public/electron.cjs` (keytar integration)
- `verification-ui/public/preload.cjs` (IPC bridge)

### 🛡️ 5. IPC Input Validation

All Electron IPC communications are validated:

**Validation Checks**:
- Type validation (string, object, buffer)
- Path traversal prevention (filename sanitization)
- URL protocol validation (http/https only)
- File existence verification before operations
- Input sanitization for all user-provided data

**Protected Operations**:
- File save dialogs
- PDF generation
- External link opening
- Secure credential storage/retrieval

**Implementation**: `validateIPCInput()` function in `electron.cjs`

### 🔐 6. Sandbox Mode

Enhanced Electron security configuration:

```javascript
webPreferences: {
  nodeIntegration: false,        // No Node.js in renderer
  contextIsolation: true,        // Isolate preload scripts
  enableRemoteModule: false,     // Disable remote module
  sandbox: true,                 // Enable sandbox mode
  webSecurity: true,             // Enable web security
  allowRunningInsecureContent: false  // Block mixed content
}
```

**What this prevents**:
- Renderer process from accessing Node.js APIs directly
- Cross-context contamination
- Remote code execution via Electron APIs
- Mixed content vulnerabilities
- Privilege escalation attacks

### 📊 7. Data Sanitization

**Logging Protection**:
- Automatic API key masking in all logs
- Sensitive field detection (apiKey, token, password, secret)
- First/last 8 characters shown, middle redacted
- Prevents accidental key exposure in debug logs

**Export Protection**:
- PDF reports contain masked keys only
- JSON exports sanitize sensitive fields
- Cryptographic hashes instead of plain keys
- Timestamped proof signatures

**Implementation**: `sanitizeForLogging()` in `validationUtils.js`

### 🌐 8. Browser Environment Detection

The application automatically detects and warns about:
- Localhost vs remote hosting
- Development vs production builds
- Secure contexts (HTTPS)
- Electron vs browser environment

### 🔄 9. Cryptographic Integrity

**Hash Generation**:
- SHA-256 hashing for API key proof
- Signature generation for attestations
- Tamper-evident verification reports
- Non-reversible key hashing for audit logs

**Implementation**: `hashApiKey()` and `generateSignature()` in `nilAIService.js`

## Security Checklist for Users

Before using this tool, ensure:

- [ ] Running on `localhost` only
- [ ] API key stored in `.env` file (not committed)
- [ ] `.gitignore` includes `.env`
- [ ] No API keys in source code
- [ ] Reports reviewed before sharing
- [ ] Understanding this is for LOCAL TESTING ONLY
- [ ] Keychain/encrypted storage enabled (check Settings)
- [ ] Rate limiting active (default: 10 req/min)
- [ ] CSP headers enforced (Electron only)
- [ ] Using valid API key format (64-char hex)

## Disclaimer

This tool is provided "as is" for local development and testing purposes only. Users are solely responsible for:
- Protecting their API keys
- Ensuring local-only usage
- Securing their development environment
- Complying with Nillion's terms of service

**The developers assume no liability for misuse, API key exposure, or security breaches resulting from improper usage of this tool.**

---

**Remember: NEVER deploy this application to the web. It is designed for LOCAL USE ONLY.**
