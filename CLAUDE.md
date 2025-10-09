# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nil AI API testing and verification toolkit that demonstrates proper authentication with the Nillion SDK. The project includes:
- Command-line API testing tools
- Interactive terminal chat interface
- Web-based verification UI (React + Electron)

## Key Configuration

### Authentication Requirements
**CRITICAL**: Nil AI requires the official Nillion SDK (`@nillion/nilai-ts`) and CANNOT work with raw HTTP/Bearer token authentication.

**Required Configuration**:
```javascript
import { NilaiOpenAIClient, NilAuthInstance } from '@nillion/nilai-ts';

const client = new NilaiOpenAIClient({
  baseURL: 'https://nilai-a779.nillion.network/v1/',  // Trailing slash required
  apiKey: 'your-api-key',
  nilauthInstance: NilAuthInstance.SANDBOX  // Mandatory
});
```

**Never use**:
- Raw `fetch()` with Bearer tokens
- Direct HTTP requests without SDK
- Missing `nilauthInstance` parameter
- Base URL without trailing slash

## Common Commands

### CLI Tools
```bash
# Install dependencies
npm install

# Test API connectivity
node index.js

# Start interactive chat launcher
npm start
# or
node start.js

# Direct chat (no terminal launcher)
npm run chat
# or
node chat.js
```

### Verification UI (React App)
```bash
cd verification-ui/

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run as Electron app
npm run electron-dev

# Build Electron app
npm run electron-pack
```

## Architecture

### Core Components

**`index.js`** - API Testing Script
- Tests Nil AI endpoints using official SDK
- Validates authentication and model access
- Provides diagnostic output and troubleshooting

**`chat.js`** - Interactive Chat Interface
- Real-time conversation with Nil AI
- Context-aware (maintains last 10 messages)
- Built-in commands: `test`, `clear`, `history`, `help`, `exit`
- Colorized terminal output with response timing

**`start.js`** - Cross-Platform Terminal Launcher
- Opens `chat.js` in new terminal window
- Platform-specific logic (macOS/Windows/Linux)
- Environment validation before launch

**`verification-ui/`** - Web-Based Verification Tool
- React + Electron desktop application
- Visual API key validation
- PDF report generation
- Browser polyfills via CRACO configuration

### Authentication Flow

```
API Key → Nillion SDK → NUC Token Generation → Authenticated Request → Nil AI API
```

The SDK automatically handles:
1. NUC (Nillion User Credential) token generation
2. Request signing and specialized headers
3. Instance-specific routing (SANDBOX vs PRODUCTION)
4. Token lifecycle management

### Project Structure

```
Nil-PrivKey-Test/
├── index.js                    # API connectivity test script
├── chat.js                     # Interactive chat interface
├── start.js                    # Terminal launcher
├── package.json                # CLI tool dependencies
├── README.md                   # User documentation
├── INSTRUCTIONS.md             # Detailed authentication guide
└── verification-ui/            # React/Electron verification app
    ├── src/
    │   ├── App.js              # Main React component
    │   ├── components/         # UI components
    │   ├── services/           # API service layer
    │   ├── utils/              # Helper utilities
    │   └── styles/             # Styled components
    ├── public/
    │   └── electron.js         # Electron main process
    ├── craco.config.js         # Webpack polyfills config
    └── package.json            # React app dependencies
```

## Technical Details

### SDK Integration Pattern
All API calls must use `NilaiOpenAIClient`:

```javascript
const response = await client.chat.completions.create({
  model: 'google/gemma-3-27b-it',
  messages: [{ role: 'user', content: 'Hello' }],
  max_tokens: 500,
  temperature: 0.7
});
```

### Error Handling
Common authentication errors:
- **401 Unauthorized**: Using raw HTTP instead of SDK
- **Invalid instance**: Missing or wrong `nilauthInstance`
- **Base URL not found**: Missing trailing slash in baseURL

### Environment Variables
Optional configuration (defaults provided):
- `NIL_API_KEY` - Override default API key
- `NIL_BASE_URL` - Override default base URL
- `NIL_MODEL` - Override default model

### React App Browser Compatibility
The verification UI uses CRACO to provide Node.js polyfills for browser environment (crypto, buffer, stream, etc.) required by `@nillion/nilai-ts`.

## Development Notes

### Node.js Version
Requires Node.js 18+ for ES modules and SDK compatibility.

### Chat History Management
Chat maintains context using last 10 messages to avoid token limits while preserving conversation flow.

### Terminal Compatibility
- **macOS**: Uses `osascript` with Terminal.app
- **Windows**: Uses `cmd` to spawn Command Prompt
- **Linux**: Uses `gnome-terminal` (fallback to manual instructions)

### Verification UI Build System
- Uses Create React App with CRACO for webpack customization
- Electron builder for desktop app packaging
- Concurrent development servers for hot reload
