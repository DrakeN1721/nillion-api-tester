# 🤖 Nil AI Key Verification Tool

> **A professional desktop application for validating Nillion API keys and generating verification reports.**

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-Latest-blue.svg)](https://www.electronjs.org/)

## ⚠️ IMPORTANT SECURITY NOTICE

**This tool is designed EXCLUSIVELY for LOCAL development and testing.**

### 🚨 DO NOT:
- ❌ Deploy this application to the web or any public server
- ❌ Share your API keys in code, screenshots, or documentation
- ❌ Commit `.env` files to version control
- ❌ Use in production environments

### ✅ This tool is for:
- Testing and validating your Nillion API keys locally
- Generating verification reports for debugging
- Demonstrating API key functionality to AI development assistants
- Learning the Nillion SDK integration

**For detailed security guidelines, see [SECURITY.md](SECURITY.md)**

---

## 🎯 What is This?

Ever had AI assistants (Claude, GPT, Cursor) incorrectly blame your perfectly valid API keys when they can't figure out integration issues? **This tool solves that problem.**

Generate **instant, verifiable proof** that your Nillion API key works, complete with:
- ✅ Real-time connection validation
- ✅ Interactive chat testing
- ✅ Comprehensive PDF reports
- ✅ Detailed logs and diagnostics

Show your AI assistant **definitive evidence** so it focuses on the real problems instead of false API key accusations!

---

## ✨ Features

### 🔐 API Key Validation
- **Advanced Format Validation**: Validates API key format before attempting connection (64-char hexadecimal)
- **Real-time Feedback**: Instant validation as you type with helpful error messages
- **Test/Placeholder Detection**: Automatically rejects obvious test keys ("000...000", "test", "demo")
- **Support for Multiple Keys**: Store and switch between different API keys
- **Secure Storage**: System keychain integration (macOS Keychain, Windows Credential Manager, Linux Secret Service)

### 🛡️ Security Features
- **Content Security Policy (CSP)**: Strict CSP headers prevent XSS and code injection attacks
- **Rate Limiting**: 10 requests per minute to prevent abuse and quota exhaustion
- **Encrypted Storage**: Multi-tier storage with OS-level encryption (keychain) or XOR-encrypted localStorage fallback
- **Input Validation**: All IPC communications validated and sanitized
- **Sandbox Mode**: Electron app runs in sandbox with context isolation
- **Data Sanitization**: API keys automatically masked in logs and exports

### 💬 Interactive Chat Interface
- **Context-Aware Conversations**: Maintains last 10 messages for coherent dialogue
- **Token Usage Tracking**: Monitor API usage in real-time
- **Response Time Monitoring**: See exactly how long each request takes
- **Rate Limit Display**: Know when you can make your next request
- **Chat History**: Review past conversations

### 📊 Comprehensive Logging
- **Searchable Logs**: Filter and search through all API interactions
- **Export Options**: JSON, CSV, TXT formats with masked API keys
- **Color-Coded Events**: Easy visual distinction between types
- **Automatic Masking**: Sensitive data automatically redacted
- **Timestamped Entries**: Precise audit trail of all operations

### 📄 Professional Reports
- **Themed PDF Reports**: Match the app's cyan/green/dark aesthetic
- **Cryptographic Proof**: SHA-256 hashes and signatures for verification
- **Security-First**: Masked API keys, sanitized data
- **Connection Statistics**: Response times, token usage, model info
- **Shareable**: Perfect for AI assistants, team members, or documentation

### 🖥️ Beautiful Desktop UI
- **Modern Dark Theme**: Cyberpunk-inspired design with cyan accents
- **Responsive Layout**: Works on various screen sizes
- **Tab-Based Navigation**: Chat, Logs, and Reports in organized tabs
- **Real-Time Status**: Connection indicators and rate limit counters
- **Welcome Splash**: Guided onboarding for first-time users

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn**
- A valid **Nillion API key** ([Get one here](https://docs.nillion.com))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DrakeN1721/nillion-api-tester.git
   cd nillion-api-tester
   ```

2. **Install dependencies**:
   ```bash
   # Install CLI tool dependencies
   npm install

   # Install verification UI dependencies
   cd verification-ui
   npm install
   cd ..
   ```

3. **Configure your API key**:
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env and add your API key
   # NIL_API_KEY=your-api-key-here
   ```

### Running the Application

#### Option 1: Electron Desktop App (Recommended)

```bash
cd verification-ui
npm install  # Install dependencies first
npm run electron-dev
```

This launches the full verification UI with:
- API key management
- Interactive chat
- Real-time logs
- PDF report generation

#### Option 2: Browser Only (No Electron)

```bash
cd verification-ui
npm install  # Install dependencies first
npm start
```

The application will open in your default browser at `http://localhost:3000`

**Note**: Some features may have limited functionality in browser mode:
- No system keychain integration (uses encrypted localStorage)
- No native desktop features
- Requires manual port configuration if 3000 is in use

#### Option 3: CLI Tools

```bash
# Test API connection
node index.js your-api-key

# Or use environment variable
export NIL_API_KEY=your-api-key
node index.js

# Interactive chat
node chat.js
```

---

## 📖 Usage Guide

### 1. Launch the Application

```bash
cd verification-ui
npm run electron-dev
```

The app will open centered on your screen at 100% zoom.

### 2. Enter Your API Key

- Navigate to the **API Key Management** section
- Paste your Nillion API key
- Click **"Test Connection"**
- Wait for validation (usually <1 second)

### 3. Test with Interactive Chat

Once connected:
- Type messages in the chat interface
- See real-time responses from Nil AI
- Monitor token usage and response times
- View all interactions in the logs panel

### 4. Generate Verification Report

- Click **"Export"** in the header
- Choose PDF format
- Report includes:
  - Masked API key
  - Connection status
  - Statistics (requests, response times, tokens)
  - Recent log entries
  - Verification proof with timestamp

### 5. Share with AI Assistants

When an AI incorrectly claims your API key is invalid:
1. Generate a verification report
2. Attach the PDF to your conversation
3. Point out the verification proof
4. Watch the AI focus on the real problem!

---

## 📁 Project Structure

```
nil-ai-verifier/
├── verification-ui/          # Main Electron application
│   ├── src/
│   │   ├── components/       # React UI components
│   │   │   ├── ApiKeyManager.js
│   │   │   ├── ChatInterface.js
│   │   │   ├── LogsPanel.js
│   │   │   ├── Header.js
│   │   │   ├── TipJar.js
│   │   │   └── ...
│   │   ├── services/         # API integration
│   │   │   └── nilAIService.js
│   │   ├── utils/            # Utilities
│   │   │   ├── exportUtils.js
│   │   │   ├── logManager.js
│   │   │   └── environment.js
│   │   └── App.js            # Main React component
│   ├── public/
│   │   ├── electron.cjs      # Electron main process
│   │   └── preload.cjs       # Preload script
│   └── package.json
├── cli/                      # Optional CLI tools
│   ├── index.js              # API test script
│   ├── chat.js               # Interactive chat
│   └── start.js              # Terminal launcher
├── .env.example              # Environment template
├── .gitignore                # Git exclusions
├── LICENSE                   # MIT License
├── SECURITY.md               # Security policy
├── CONTRIBUTING.md           # Contribution guidelines
└── README.md                 # This file
```

---

## 🛠️ Development

### Setup Development Environment

```bash
# Install all dependencies
npm install
cd verification-ui && npm install && cd ..

# Run in development mode
cd verification-ui
npm run electron-dev
```

### Build for Production

```bash
cd verification-ui

# Build React app
npm run build

# Package Electron app
npm run electron-pack

# Distribution files will be in verification-ui/dist/
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start React development server |
| `npm run build` | Build React app for production |
| `npm run electron-dev` | Run Electron in development mode |
| `npm run electron-pack` | Build distributable Electron app |
| `npm test` | Run test suite |
| `npm run lint` | Lint code with ESLint |

---

## 🎨 Features in Detail

### API Key Management

- **Validation**: Instant testing with the official `@nillion/nilai-ts` SDK
- **Format Checking**: Validates key format before testing
- **History**: Keeps track of recently used keys (masked)
- **Security**: Keys stored with encryption in local storage only

### Interactive Chat

- **Real-time Conversation**: Chat with Nil AI using your API key
- **Context Awareness**: Maintains last 10 messages for coherent conversations
- **Performance Metrics**: See response times and token usage
- **Commands**: Built-in test, clear, and help commands

### Logging System

- **Comprehensive**: Logs all API calls, successes, and errors
- **Searchable**: Filter logs by keyword
- **Categorized**: Filter by type (info, success, error)
- **Exportable**: Export logs as JSON for analysis

### Report Generation

PDF reports are themed to match the application:
- 🎨 Cyan/green color scheme
- 📊 Charts and statistics
- ✅ Verification proof with hash
- 🔒 Masked API keys for security

---

## 🔒 Security & Privacy

This application implements **9 layers of security** using defense-in-depth principles:

### 🔐 1. Advanced Input Validation

- **API Key Format Checking**: Validates 64-character hexadecimal format before testing
- **Test Pattern Detection**: Automatically rejects placeholder keys ("000...000", "test", "demo")
- **Type Safety**: Input validation prevents injection attacks
- **IPC Sanitization**: All Electron IPC communications validated and sanitized

### 🛡️ 2. Content Security Policy (CSP)

- **Strict Headers**: Limits script execution to trusted sources
- **Connection Whitelist**: Only allows connections to Nil AI API (`nilai-a779.nillion.network`)
- **XSS Prevention**: Blocks inline scripts and unsafe evaluations
- **Zero External Resources**: No CDNs or third-party scripts

### ⏱️ 3. Rate Limiting

- **10 Requests/Minute**: Prevents abuse and quota exhaustion
- **Graceful Throttling**: Clear "retry after X seconds" messages
- **User-Friendly**: Prevents accidental API overuse without blocking legitimate use

### 🔒 4. Secure Keychain Storage

**Multi-Tier Encryption**:
- **Tier 1 (Preferred)**: OS-level keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- **Tier 2 (Fallback)**: XOR-encrypted localStorage with device fingerprinting
- **Automatic Selection**: Uses best available storage method

**Benefits**:
- Keys encrypted at rest by operating system
- Protected from process memory dumps
- Requires system authentication to access

### 🏖️ 5. Sandbox Mode

```javascript
// Electron security configuration
sandbox: true                      // Renderer process isolation
contextIsolation: true             // Preload script isolation
nodeIntegration: false             // No Node.js in renderer
webSecurity: true                  // Enable web security
allowRunningInsecureContent: false // Block mixed content
```

**Protection Against**:
- Remote code execution
- Privilege escalation
- Cross-context contamination
- Node.js API access from renderer

### 📊 6. Data Sanitization

**Automatic Masking**:
- API keys in logs: `abc12345...xyz98765` (shows first/last 8 chars)
- PDF exports: Masked keys only
- Console output: Sensitive fields redacted
- Screenshots: Keys never fully visible

**Cryptographic Hashing**:
- SHA-256 for audit logs
- Non-reversible key proofs
- Tamper-evident signatures

### 🌐 7. Environment Detection

Automatically detects and warns about:
- Non-localhost deployment
- Production vs development builds
- Insecure contexts (non-HTTPS)
- Browser vs Electron environment

### 📝 8. Audit Trail

- **Timestamped Logs**: Every API interaction recorded
- **Sanitized Exports**: Logs exportable with masked sensitive data
- **Searchable History**: Filter and review all operations
- **Proof Generation**: Cryptographic signatures for verification

### 🚫 9. No Hardcoded Secrets

- **Zero API Keys**: No fallback or default keys in source code
- **Environment Variables**: Configuration via `.env` files only
- **Validation Required**: Application won't run without user-provided key
- **Git Protection**: `.gitignore` prevents accidental commits

---

### 🔍 Security Transparency

All security implementations are open source and auditable:

| Feature | Implementation File |
|---------|---------------------|
| CSP Headers | `verification-ui/public/electron.cjs` |
| API Validation | `verification-ui/src/utils/validationUtils.js` |
| Rate Limiting | `verification-ui/src/services/nilAIService.js` |
| Keychain Storage | `verification-ui/src/utils/secureStorage.js` |
| IPC Validation | `verification-ui/public/electron.cjs` |

**Full Security Policy**: [SECURITY.md](SECURITY.md)

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Development guidelines
- Pull request process
- Security requirements

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Remember**: Never commit API keys or sensitive data!

---

## 📋 Roadmap

- [ ] Multi-language support
- [ ] Advanced report customization
- [ ] Batch API key testing
- [ ] CLI improvements with interactive prompts
- [ ] Plugin system for custom validators
- [ ] Export to more formats (CSV, Markdown)

---

## 🐛 Known Issues

See [GitHub Issues](https://github.com/DrakeN1721/nillion-api-tester/issues) for current bugs and feature requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**DrakeN**

- Website: [https://draken.space](https://draken.space)
- Twitter: [@draken1721](https://x.com/draken1721)
- GitHub: [@DrakeN1721](https://github.com/DrakeN1721)

---

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://react.dev/)
- Styling with [styled-components](https://styled-components.com/)
- Icons from [Lucide](https://lucide.dev/)
- PDF generation via [jsPDF](https://github.com/parallax/jsPDF)
- Official [Nillion SDK](https://docs.nillion.com/) (`@nillion/nilai-ts`)

---

## 💡 Support

If you find this tool helpful:

- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🤝 Contribute code
- 🗨️ Share with others

**Tip Jar**: If this tool saved you debugging time, consider supporting development:
- **Nillion (NIL)**: `nillion14pgcxyx66scm9er9cw67f39jxcqkd8vsf5907s`
- **Ethereum (ETH)**: `0xf3fE969443359d12dc00a7949f26B0cB06e87581`

---

## ⚠️ Disclaimer

This tool is provided "as is" for local development and testing purposes only. The developers assume no liability for:
- Misuse of the application
- API key exposure due to improper usage
- Security breaches from deploying to public servers
- Violations of Nillion's terms of service

**Always use this tool responsibly and keep your API keys secure.**

---

**Ready to verify your Nil AI API key? Let's go! 🚀**
