# Nillion API Authentication Methods Guide

This document provides comprehensive information about the two authentication methods supported by this testing toolkit and explains why the official SDK is required for production use.

## Table of Contents

1. [Quick Summary](#quick-summary)
2. [SDK Authentication (Recommended)](#sdk-authentication-recommended)
3. [Bearer Token Authentication (Deprecated)](#bearer-token-authentication-deprecated)
4. [Technical Comparison](#technical-comparison)
5. [Testing Both Methods](#testing-both-methods)
6. [Migration Guide](#migration-guide)
7. [Troubleshooting](#troubleshooting)

---

## Quick Summary

| Feature | SDK Authentication | Bearer Token Authentication |
|---------|-------------------|----------------------------|
| **Status** | ✅ Official & Supported | ⚠️ Deprecated / Testing Only |
| **Expected Result** | ✅ Works | ❌ 401 Unauthorized |
| **Use For** | Production | Testing/Comparison |
| **Requires** | `@nillion/nilai-ts` SDK | None (raw HTTP) |
| **Complexity** | SDK handles it | Simple but fails |
| **Future Proof** | Yes | No - deprecated |

**Recommendation**: Always use SDK Authentication for any real-world usage.

---

## SDK Authentication (Recommended)

### What is SDK Authentication?

SDK Authentication uses the official `@nillion/nilai-ts` SDK which handles all the complex authentication requirements automatically, including:

- **NUC Token Generation**: Automatic Nillion User Credential token creation
- **Request Signing**: Specialized headers and signatures
- **Instance Routing**: Proper SANDBOX/PRODUCTION environment handling
- **Token Lifecycle**: Automatic token refresh and management

### How It Works

```
API Key → Nillion SDK → NUC Token Generation → Specialized Headers → Authenticated Request → Nil AI API
```

The SDK abstracts away the complexity of Nillion's authentication system, which requires more than just a simple Bearer token.

### Installation

```bash
npm install @nillion/nilai-ts
```

### Usage Example

```javascript
import { NilaiOpenAIClient, NilAuthInstance } from '@nillion/nilai-ts';

// Create client
const client = new NilaiOpenAIClient({
  baseURL: 'https://nilai-a779.nillion.network/v1/',
  apiKey: 'your-api-key-here',
  nilauthInstance: NilAuthInstance.SANDBOX  // or PRODUCTION
});

// Make request
const response = await client.chat.completions.create({
  model: 'google/gemma-3-27b-it',
  messages: [{ role: 'user', content: 'Hello!' }],
  max_tokens: 500
});

console.log(response.choices[0].message.content);
```

### Using This Toolkit

```bash
# Basic test with SDK authentication (default)
node index.js your-api-key

# Explicit SDK mode
node index.js --auth-mode sdk --api-key your-api-key

# Interactive chat with SDK
node chat.js
```

### Configuration Options

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `apiKey` | ✅ Yes | - | Your Nillion API key |
| `baseURL` | No | `https://nilai-a779.nillion.network/v1/` | API base URL |
| `model` | No | `google/gemma-3-27b-it` | Model to use |
| `nilauthInstance` | No | `SANDBOX` | Environment (SANDBOX/PRODUCTION) |

### Why SDK is Required

According to Nillion's documentation, the API requires specialized authentication that cannot be replicated with standard HTTP Bearer tokens:

1. **NUC Token Generation**: The SDK generates temporary Nillion User Credential tokens using your API key
2. **Specialized Headers**: Requests need specific headers that the SDK adds automatically:
   - `Authorization: NUC <generated-token>`
   - `X-Nillion-Instance: sandbox`
   - `X-Nillion-SDK-Version: x.x.x`
3. **Request Signing**: The SDK signs requests with cryptographic signatures
4. **Token Refresh**: The SDK manages token lifecycle and refreshes as needed

---

## Bearer Token Authentication (Deprecated)

### ⚠️ WARNING: This Method is Deprecated

Bearer Token Authentication is provided **for testing and comparison purposes only**. According to Nillion's official documentation, this method is deprecated and expected to fail with **401 Unauthorized** errors.

### What is Bearer Token Authentication?

Bearer Token Authentication is the traditional HTTP authentication method where you pass a token in the `Authorization` header:

```
Authorization: Bearer your-token-here
```

### Why It Doesn't Work

Bearer token authentication attempts to use a simple HTTP flow:

```
Bearer Token → Raw HTTP Request → Authorization Header → Direct API Call
```

However, Nillion's API requires the specialized NUC token flow that only the SDK provides. Raw Bearer tokens (including legacy tokens like "Nillion2025") are not sufficient for authentication.

### Expected Behavior

When you test Bearer token authentication, you should see:

```
❌ 401 Unauthorized
Error: Authentication failed
Note: This is expected - bearer token authentication is deprecated
```

This is the **correct and expected behavior** - it demonstrates that the bearer token method is no longer supported.

### Testing Bearer Token Authentication

You can test bearer token authentication to verify it doesn't work:

```bash
# Test with default bearer token "Nillion2025"
node index.js --auth-mode bearer --bearer-token Nillion2025

# Compare both methods
node index.js --compare --api-key your-api-key --bearer-token Nillion2025
```

### Why Is This Feature Included?

We include bearer token testing for several reasons:

1. **Educational**: Demonstrates why SDK is required
2. **Verification**: Proves that deprecated methods no longer work
3. **Comparison**: Shows the difference between working and non-working auth
4. **Documentation**: Provides empirical evidence for technical discussions
5. **AI Assistant Proof**: Generate definitive evidence when AI assistants incorrectly suggest bearer token authentication

---

## Technical Comparison

### Request Headers Comparison

**SDK Authentication (Works):**
```http
POST /v1/chat/completions HTTP/1.1
Host: nilai-a779.nillion.network
Authorization: NUC <generated-nuc-token>
X-Nillion-Instance: sandbox
X-Nillion-SDK-Version: 1.0.0
Content-Type: application/json
```

**Bearer Token Authentication (Fails):**
```http
POST /v1/chat/completions HTTP/1.1
Host: nilai-a779.nillion.network
Authorization: Bearer Nillion2025
Content-Type: application/json
```

### Implementation Comparison

#### SDK Implementation
```javascript
import { AuthManager, AuthMode } from './auth/AuthManager.js';

// Create SDK auth provider
const provider = AuthManager.create(AuthMode.SDK, {
  apiKey: 'your-api-key',
  model: 'google/gemma-3-27b-it'
});

// Test connection - SDK handles everything
const result = await provider.testConnection();
// ✅ Expected: Success with AI response
```

#### Bearer Token Implementation
```javascript
import { AuthManager, AuthMode } from './auth/AuthManager.js';

// Create bearer token auth provider
const provider = AuthManager.create(AuthMode.BEARER, {
  bearerToken: 'Nillion2025',
  model: 'google/gemma-3-27b-it'
});

// Test connection - raw HTTP request
const result = await provider.testConnection();
// ❌ Expected: 401 Unauthorized error
```

### Feature Comparison

| Feature | SDK Auth | Bearer Token Auth |
|---------|----------|-------------------|
| NUC Token Generation | ✅ Automatic | ❌ Not available |
| Request Signing | ✅ Automatic | ❌ Not available |
| Token Refresh | ✅ Automatic | ❌ Not available |
| Instance Routing | ✅ Yes (SANDBOX/PROD) | ❌ No |
| Error Handling | ✅ SDK provides details | ⚠️ Generic HTTP errors |
| Future Updates | ✅ SDK auto-updates | ❌ Deprecated |
| Production Ready | ✅ Yes | ❌ No |
| Educational Value | 📚 Shows proper method | 📚 Shows why it's needed |

---

## Testing Both Methods

### CLI Testing Tool

The `index.js` tool supports both authentication methods and can compare them side-by-side.

#### Test SDK Only (Default)
```bash
node index.js your-api-key
```

Expected output:
```
✅ SDK authentication SUCCESSFUL!
Response: "Connection successful!"
Response Time: 1234ms
```

#### Test Bearer Token Only
```bash
node index.js --auth-mode bearer --bearer-token Nillion2025
```

Expected output:
```
❌ Bearer authentication FAILED
Error: 401 Unauthorized
✓ This failure was expected - bearer token authentication is deprecated
```

#### Compare Both Methods
```bash
node index.js --compare --api-key your-api-key --bearer-token Nillion2025
```

Expected output:
```
📊 SDK Authentication:
✅ WORKING
Response: "Connection successful!"

📊 Bearer Token Authentication:
✓ FAILED (As Expected)
Error: 401 Unauthorized

📋 Summary:
┌────────────────┬──────────┬─────────────────┐
│ Method         │ Status   │ Response Time   │
├────────────────┼──────────┼─────────────────┤
│ SDK            │ ✅ PASS  │ 1234ms          │
│ Bearer Token   │ ✓ FAIL   │ 567ms           │
└────────────────┴──────────┴─────────────────┘

Recommendation: Use SDK authentication (as expected)
```

### Automated Comparison Tool

The dedicated comparison tool provides detailed analysis:

```bash
node testing/authComparison.js --api-key your-api-key
```

This generates a comprehensive report showing:
- Test results for both methods
- Response times and errors
- Detailed recommendations
- Optional JSON export

### Interactive Chat Testing

Test both methods in an interactive chat environment:

```bash
# SDK mode (default)
node chat.js

# Bearer token mode (will fail)
node chat.js --auth-mode bearer --bearer-token Nillion2025
```

---

## Migration Guide

### If You're Using Raw HTTP/Bearer Tokens

1. **Install the SDK**
   ```bash
   npm install @nillion/nilai-ts
   ```

2. **Replace Your HTTP Code**

   **Before (Won't Work):**
   ```javascript
   const response = await fetch('https://nilai-a779.nillion.network/v1/chat/completions', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer your-token',
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       model: 'google/gemma-3-27b-it',
       messages: [{ role: 'user', content: 'Hello' }]
     })
   });
   ```

   **After (Works):**
   ```javascript
   import { NilaiOpenAIClient, NilAuthInstance } from '@nillion/nilai-ts';

   const client = new NilaiOpenAIClient({
     baseURL: 'https://nilai-a779.nillion.network/v1/',
     apiKey: 'your-api-key',
     nilauthInstance: NilAuthInstance.SANDBOX
   });

   const response = await client.chat.completions.create({
     model: 'google/gemma-3-27b-it',
     messages: [{ role: 'user', content: 'Hello' }]
   });
   ```

3. **Update Configuration**
   - Change from `bearerToken` to `apiKey`
   - Add `nilauthInstance` parameter
   - Ensure baseURL has trailing slash

### Using This Toolkit's Abstraction

For maximum flexibility, use the toolkit's AuthManager:

```javascript
import { AuthManager, AuthMode } from './auth/AuthManager.js';

// Create provider (SDK by default)
const provider = AuthManager.create(AuthMode.SDK, {
  apiKey: process.env.NIL_API_KEY,
  model: 'google/gemma-3-27b-it'
});

// Test connection
const result = await provider.testConnection();

if (result.success) {
  console.log('✅ Connected:', result.response);
} else {
  console.error('❌ Failed:', result.error);
}
```

---

## Troubleshooting

### SDK Authentication Issues

#### Error: "401 Unauthorized" with SDK
**Possible Causes:**
- Invalid or expired API key
- Wrong `nilauthInstance` (SANDBOX vs PRODUCTION)
- Missing trailing slash in baseURL
- SDK not properly installed

**Solutions:**
```bash
# Verify API key
node index.js --api-key your-key

# Check SDK installation
npm list @nillion/nilai-ts

# Reinstall SDK
npm install @nillion/nilai-ts --force

# Verify baseURL has trailing slash
export NIL_BASE_URL="https://nilai-a779.nillion.network/v1/"
```

#### Error: "Cannot find module '@nillion/nilai-ts'"
**Solution:**
```bash
npm install @nillion/nilai-ts
```

#### Error: "Invalid authentication instance"
**Solution:**
Ensure you're specifying the authentication instance:
```javascript
import { NilAuthInstance } from '@nillion/nilai-ts';

const client = new NilaiOpenAIClient({
  baseURL: 'https://nilai-a779.nillion.network/v1/',
  apiKey: 'your-key',
  nilauthInstance: NilAuthInstance.SANDBOX  // ← Required
});
```

### Bearer Token Authentication Issues

#### Error: "401 Unauthorized" with Bearer Token
**This is expected!** Bearer token authentication is deprecated and should fail.

**What to do:**
Switch to SDK authentication:
```bash
node index.js --auth-mode sdk --api-key your-api-key
```

#### Bearer Token Unexpectedly Works
If bearer token authentication succeeds, this may indicate:
- A temporary compatibility mode
- A different API endpoint
- A special testing environment

**Recommendation:** Still use SDK authentication for production, as bearer token support may be removed at any time.

### Comparison Tool Issues

#### Error: "API key is required"
**Solution:**
```bash
# Provide API key
node testing/authComparison.js --api-key your-key

# Or use environment variable
export NIL_API_KEY=your-key
node testing/authComparison.js
```

#### Both Methods Fail
**Possible Causes:**
- Network connectivity issues
- Invalid credentials for both methods
- API endpoint unavailable

**Solution:**
```bash
# Test network connectivity
curl https://nilai-a779.nillion.network/v1/health

# Verify API key format
echo $NIL_API_KEY | wc -c  # Should be 64 characters
```

---

## Additional Resources

- **Official Nillion Documentation**: https://docs.nillion.com/build/private-llms/quickstart
- **Nillion SDK Package**: https://www.npmjs.com/package/@nillion/nilai-ts
- **This Toolkit's README**: ../README.md
- **Security Policy**: ../SECURITY.md
- **Original Authentication Guide**: ../INSTRUCTIONS.md

---

## Frequently Asked Questions

### Q: Why can't I just use Bearer tokens like other APIs?

**A:** Nillion's API requires a specialized authentication flow that generates temporary NUC (Nillion User Credential) tokens, adds specialized headers, and signs requests cryptographically. This cannot be replicated with standard Bearer token authentication.

### Q: Will bearer token authentication ever work again?

**A:** No. According to Nillion's documentation, bearer token authentication is deprecated. The official SDK is now the only supported method and will remain so going forward.

### Q: Why is the bearer token feature included if it doesn't work?

**A:** The bearer token feature serves several purposes:
- Educational: Shows why SDK is required
- Verification: Proves deprecated methods don't work
- Testing: Allows comparison between methods
- Documentation: Provides empirical evidence

### Q: Can I use this toolkit in production?

**A:** This toolkit is designed for **local testing and verification only**. For production use, integrate the `@nillion/nilai-ts` SDK directly into your application using the patterns shown in this guide.

### Q: What if I'm getting 401 errors with SDK authentication?

**A:** This usually indicates:
1. Invalid or expired API key
2. Missing or incorrect `nilauthInstance`
3. Network connectivity issues
4. Missing trailing slash in baseURL

Run the comparison tool to diagnose:
```bash
node testing/authComparison.js --api-key your-key
```

### Q: How do I get a Nillion API key?

**A:** Visit the [Nillion Subscription Portal](https://subscription.nillion.com) to subscribe to nilAI services and receive your API key.

---

## Conclusion

**Use SDK Authentication** for all real-world usage. Bearer token authentication is included only for testing and educational purposes to demonstrate why the official SDK is required.

The dual authentication system in this toolkit provides a comprehensive way to:
- ✅ Test the official SDK method (which works)
- ✅ Verify that deprecated methods don't work
- ✅ Compare both approaches side-by-side
- ✅ Generate empirical evidence for technical discussions
- ✅ Understand Nillion's authentication requirements

For any production use, always use the official `@nillion/nilai-ts` SDK with proper API key authentication.

---

**Last Updated:** 2025-10-14
**Toolkit Version:** 2.0
**Nillion SDK Version:** Latest
