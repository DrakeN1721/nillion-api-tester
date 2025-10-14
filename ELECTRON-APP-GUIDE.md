# 🖥️ Nil AI Verification Tool - Electron App Guide

## 🎯 Quick Start

### Launch the App
```bash
cd verification-ui
npm install
npm run electron-dev
```

---

## 📱 New Features - Diagnostics Tab

### Navigation
The app now has **3 tabs** in the header:

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Nil AI Key Verification                             │
├─────────────────────────────────────────────────────────┤
│  [Main] [Diagnostics] [About]           🔒 Connected   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔬 Diagnostics Tab

### What It Does
Click the **"Diagnostics"** tab to access the comprehensive API testing system.

### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🔬 API Diagnostics                                      │
│                                                         │
│ [Run Diagnostics] [Export Report]                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ✅ Overall Status                      [API_KEY_ISSUE]  │
│                                                         │
│ DIAGNOSIS                                               │
│ Bearer token works but API key authentication failed.  │
│ This indicates an issue with your API key or          │
│ subscription.                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⚡ Test Results                                         │
│                                                         │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │ 🔑 SDK Auth  │ │ 🛡️ Bearer    │ │ 🖥️ Health    │    │
│ │              │ │              │ │              │    │
│ │ ⊘ Skipped    │ │ ✓ Working    │ │ ✗ Failed     │    │
│ │ No API key   │ │ 734ms        │ │              │    │
│ └──────────────┘ └──────────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ℹ️ Recommendations                                      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [HIGH] Verify API Key                               │ │
│ │ Ensure your API key is exactly 64 hexadecimal      │ │
│ │ characters.                                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [HIGH] Check Subscription Status                    │ │
│ │ Visit https://subscription.nillion.com to verify   │ │
│ │ your subscription is active.                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 💳 Subscription Verification                            │
│                                                         │
│ CHECK YOUR SUBSCRIPTION STATUS                         │
│ If your API key is failing but the bearer token works,│
│ your subscription may have expired or there may be a   │
│ billing issue.                                         │
│                                                         │
│ [🔗 Open nilPay Subscription Portal]                   │
│                                                         │
│ • Verify your subscription is active                   │
│ • Check payment method and billing status              │
│ • Ensure your API key matches your active subscription │
│ • Review usage limits and quotas                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

The Diagnostics panel uses color-coded indicators:

### Status Colors
- 🟢 **Green** (Success) - Everything working correctly
- 🔴 **Red** (Error) - Action required immediately
- 🟡 **Yellow** (Warning) - Attention needed
- 🔵 **Blue** (Info) - Informational messages

### Priority Badges
- 🔴 **CRITICAL** - Immediate action required
- 🔴 **HIGH** - Urgent action recommended
- 🟡 **MEDIUM** - Important improvements
- 🔵 **INFO** - Helpful information

---

## 🎬 User Flow

### Scenario: API Key Not Working

1. **User enters API key** in Main tab
2. **Test Connection fails** ❌
3. **User clicks "Diagnostics" tab**
4. **Clicks "Run Diagnostics"** button
5. **System tests**:
   - SDK authentication (fails)
   - Bearer token (works)
   - Service health
6. **Shows diagnosis**: "API_KEY_ISSUE"
7. **Displays recommendations**:
   - [HIGH] Verify API key format
   - [HIGH] Check subscription status
8. **User sees Subscription Verification card**
9. **Clicks "Open nilPay Subscription Portal" button**
10. **Browser opens** https://subscription.nillion.com
11. **User discovers** expired subscription
12. **User renews** subscription
13. **Gets new API key**
14. **Returns to app** and enters new key
15. **Test Connection succeeds** ✅

---

## 💡 Features in Detail

### 1. Run Diagnostics Button
- Primary action button (cyan color)
- Shows loading state while running
- Disabled during execution
- Icon spins during testing

### 2. Export Report Button
- Appears after diagnostics complete
- Downloads JSON file with results
- Filename: `nil-ai-diagnostic-{timestamp}.json`
- Contains complete test results

### 3. Test Results Grid
**Responsive layout** showing:
- SDK Authentication status
- Bearer Token authentication
- Service Health
- Response times
- Error details

### 4. Recommendations List
**Priority-based recommendations** with:
- Color-coded priority badges
- Clear titles
- Detailed descriptions
- Actionable next steps

### 5. **Subscription Verification Card** ⭐ NEW
**Key Feature**:
- Always visible when diagnostics run
- Explains when to check subscription
- **Button opens subscription portal**
- Helpful checklist of what to verify

**Button Behavior**:
- Opens https://subscription.nillion.com in **new browser tab**
- Uses `window.open('...', '_blank')`
- Secure external link

---

## 🔧 Technical Details

### Component Structure
```
DiagnosticPanel
├── Header
│   ├── Title (🔬 API Diagnostics)
│   └── Action Buttons
│       ├── Run Diagnostics
│       └── Export Report
├── Loading State (while running)
├── Empty State (before first run)
└── Results Display
    ├── Overall Status Card
    │   ├── Diagnosis
    │   └── Severity Badge
    ├── Test Results Card
    │   └── Results Grid
    │       ├── SDK Test
    │       ├── Bearer Token Test
    │       └── Health Test
    ├── Recommendations Card
    │   └── Recommendation Items
    └── Subscription Verification Card ⭐
        ├── Description
        ├── nilPay Portal Button
        └── Checklist
```

### Props Passed to DiagnosticPanel
```javascript
<DiagnosticPanel
  apiKey={currentApiKey}           // From App state
  baseURL="https://nilai-a779.nillion.network/v1"
  model={selectedModel}            // From App state
/>
```

### State Management
```javascript
const [isRunning, setIsRunning] = useState(false);
const [results, setResults] = useState(null);
```

---

## 🎯 Diagnostic Scenarios

### 1. ALL_WORKING (Success)
```
✅ Overall Status: ALL_WORKING

Both SDK and bearer token authentication are working correctly.
```

### 2. SDK_ONLY (Success)
```
✅ Overall Status: SDK_ONLY

Your API key works correctly with the SDK. Bearer token
limitations are expected and normal.
```

### 3. API_KEY_ISSUE (Error) ⚠️
```
❌ Overall Status: API_KEY_ISSUE

Bearer token works but API key authentication failed. This
indicates an issue with your API key or subscription.

Recommendations:
[HIGH] Check subscription status
[HIGH] Verify API key format
```

### 4. BOTH_FAILED (Error)
```
❌ Overall Status: BOTH_FAILED

Both authentication methods failed. The service may be down,
or your credentials are invalid.
```

### 5. SERVICE_DOWN (Critical)
```
🔴 Overall Status: SERVICE_DOWN

The Nillion API service appears to be down or unreachable.
```

### 6. NO_API_KEY (Warning)
```
⚠️ Overall Status: NO_API_KEY

No API key provided for testing. Bearer token test only.
```

---

## 📊 Sample JSON Export

When you click "Export Report", you get:

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

---

## 🚀 Performance

### Loading Times
- Diagnostic tests: **3-5 seconds**
- UI render: **Instant**
- Export: **< 1 second**

### What Gets Tested
1. **SDK Authentication** (~1s)
2. **Bearer Token Models** (~1s)
3. **Bearer Token Chat** (~2s)
4. **Service Health** (~0.5s)
5. **Usage Stats** (~0.5s)

**Total**: ~5 seconds for complete diagnostic

---

## 🎓 Best Practices

### When to Run Diagnostics

✅ **Run diagnostics when**:
- API key validation fails
- Chat requests fail
- Unsure if issue is with key or service
- Before contacting support

❌ **Don't run diagnostics**:
- If everything is working
- Just for fun (rate limits apply)
- More than once per issue

### Using the Results

1. **Read the Diagnosis** first
2. **Follow recommendations** in priority order
3. **Check subscription** if API key fails
4. **Export report** if issue persists
5. **Share with support** if needed

---

## 🔐 Security Notes

### What Gets Exported
- ✅ Test results
- ✅ Diagnosis and recommendations
- ✅ Timestamps and configuration
- ✅ **Masked API keys** (only first 8 chars)
- ❌ **Full API keys NOT included**

### External Links
- nilPay portal opens in **new tab**
- Uses `_blank` target for security
- HTTPS only

---

## 🐛 Troubleshooting

### DiagnosticPanel Not Showing
1. Check you clicked "Diagnostics" tab
2. Refresh the Electron app
3. Check console for errors

### "Run Diagnostics" Button Not Working
1. Check network connectivity
2. Verify base URL is correct
3. Look for errors in developer console

### Subscription Button Not Opening
1. Check browser is allowed to open tabs
2. Verify popup blocker isn't blocking
3. Try copying URL manually

---

## 📱 Mobile Responsive

The DiagnosticPanel is **fully responsive**:

- **Desktop** (1400px+): Full grid layout
- **Tablet** (768px-1399px): Stacked cards
- **Mobile** (< 768px): Single column

All buttons and cards adapt to screen size.

---

## 🎉 Summary

The new **Diagnostics tab** provides:

✅ **Automated testing** - One-click diagnostics
✅ **Visual feedback** - Color-coded results
✅ **Clear guidance** - Prioritized recommendations
✅ **Subscription access** - Direct portal button ⭐
✅ **Export capability** - JSON reports
✅ **Beautiful UI** - Matches app design

**Result**: Users can quickly identify and fix API key issues, with direct access to subscription verification when needed!

---

**Version**: 2.0.0
**Last Updated**: 2025-10-14
**Status**: Production Ready 🚀
