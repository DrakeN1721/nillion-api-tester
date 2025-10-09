# Nil AI Key Verifier

🚀 **Free, open-source tool to instantly verify Nil AI API keys and generate proof reports for LLM development workflows.**

![Nil AI Key Verifier](https://img.shields.io/badge/Version-1.0.0-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Electron](https://img.shields.io/badge/Electron-Ready-purple)

## 🎯 Why This Tool Exists

When integrating with Nil AI APIs, developers often face mysterious failures. LLM coding assistants (like Claude, GPT, etc.) frequently blame "invalid API keys" even when keys are perfectly functional, leading developers down wrong troubleshooting paths and wasting valuable debugging time.

**This tool generates instant, verifiable proof that your Nil AI API key works correctly**, so your LLM coding assistant can focus on the real integration issues instead of incorrectly diagnosing functional API keys as the problem.

## ✨ Features

- **🔍 Instant API Verification** - Tests your Nil AI key in seconds with comprehensive checks
- **🤖 LLM-Optimized Reports** - Generates structured proof reports designed for AI tools to understand
- **📊 Detailed Logging** - Captures response times, token usage, error codes, and full request/response cycles
- **📄 Multiple Export Formats** - PDF reports, JSON data, and CSV logs for different use cases
- **🔒 Complete Privacy** - API keys never leave your machine, stored only in session memory
- **🌐 Local-First** - No external servers or data transmission required
- **⚡ Real-time Testing** - Interactive chat interface for comprehensive API testing
- **🛡️ Security-First** - Open source, localhost-only operation, session-based key handling

## 🚀 Quick Start

### Option 1: Electron Desktop App (Recommended)
```bash
# Clone the repository
git clone https://github.com/DrakeN1721/nillion-api-tester.git
cd nillion-api-tester/verification-ui

# Install dependencies
npm install

# Run as Electron desktop app
npm run electron-dev
```

### Option 2: Browser Only (No Electron)
```bash
# Clone the repository
git clone https://github.com/DrakeN1721/nillion-api-tester.git
cd nillion-api-tester/verification-ui

# Install dependencies
npm install

# Start development server (opens in browser)
npm start
```

The application will open in your default browser at `http://localhost:3000`

**Note**: Browser mode has some limitations:
- No system keychain integration (uses encrypted localStorage)
- No native desktop features
- Requires manual port configuration if 3000 is in use

### Option 3: Download Pre-built Release
1. Go to the [Releases](https://github.com/DrakeN1721/nillion-api-tester/releases) page
2. Download the latest version for your operating system
3. Run the executable - no installation required!

## 📖 How to Use

1. **Start the application** (via `npm start` or downloaded executable)
2. **Enable Security Settings** - Click "Security" button and enable local development mode
3. **Paste your Nil AI API key** in the input field
4. **Click "Test Connection"** to verify functionality
5. **Review the results** in real-time logs
6. **Generate proof reports** using the Export button
7. **Show reports to your LLM** when it claims API key issues

## 🎯 Perfect for These Scenarios

### 🤖 AI Coding Assistant Debugging
When Claude, GPT, or other AI tools claim your API key isn't working, show them proof it's functional so they solve the real problem.

### ⚡ Integration Troubleshooting
Quickly eliminate API key issues from your debugging checklist and focus on actual integration problems like headers, endpoints, or logic.

### 📊 API Health Monitoring
Regular verification checks to ensure your production API keys remain functional and haven't been rate-limited or suspended.

### 📝 Documentation & Proof
Generate professional reports for team members, clients, or support tickets showing your API integration is working correctly.

## 🔒 Security & Privacy

This tool prioritizes your security and privacy:

- ✅ **Session-Only Storage** - API keys exist only in browser memory during testing
- ✅ **No External Transmission** - Keys never sent to servers or databases
- ✅ **Localhost-Only Operation** - Additional security layer preventing remote access
- ✅ **Open Source Transparency** - Full code review available on GitHub
- ✅ **No Analytics** - Zero tracking or user data collection

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0 with styled-components
- **Nil AI Integration**: Official `@nillion/nilai-ts` SDK
- **Desktop App**: Electron (coming soon)
- **Export Tools**: PDF generation, JSON/CSV export
- **Security**: Client-side only, no server dependencies

## 📋 System Requirements

- **Node.js** 16.x or higher (for development)
- **Modern Browser** (Chrome, Firefox, Safari, Edge)
- **Internet Connection** (only for API testing, not for key storage)
- **Operating System**: Windows, macOS, Linux

## 🔧 Development

### Local Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests (if available)
npm test
```

### Building Desktop App
```bash
# Build Electron app (coming soon)
npm run electron-pack
```

### Project Structure
```
nil-ai-verifier/
├── src/
│   ├── components/          # React components
│   │   ├── ApiKeyManager.js # API key input and management
│   │   ├── ChatInterface.js # Interactive testing interface
│   │   ├── LogsPanel.js     # Real-time logging display
│   │   ├── TipJar.js        # Cryptocurrency tipping
│   │   └── AboutSection.js  # Landing page content
│   ├── services/
│   │   └── nilAIService.js  # Nil AI integration service
│   ├── utils/
│   │   ├── logManager.js    # Logging functionality
│   │   └── exportUtils.js   # Report generation
│   └── App.js               # Main application component
├── public/
│   └── index.html           # HTML template
├── package.json
└── README.md
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute
- 🐛 **Bug Reports** - Found an issue? Report it!
- 💡 **Feature Requests** - Have ideas? We'd love to hear them!
- 🔧 **Code Contributions** - Submit pull requests
- 📝 **Documentation** - Help improve our docs
- 🌍 **Translations** - Help localize the app

### Development Guidelines
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use modern JavaScript (ES6+)
- Follow React best practices
- Write clean, readable code
- Add comments for complex logic
- Test your changes

## 💝 Support This Project

This tool is completely free and open source. If it helped you verify your API key and saved you debugging time, consider supporting development:

### Cryptocurrency Tips
- **Nillion (NIL)** - `nillion14pgcxyx66scm9er9cw67f39jxcqkd8vsf5907s` ⭐ *Preferred*
- **Zcash (ZEC)** - `u155jgwwdfcam3mqlrw86pqz5xz8dzhxznm46lrm8nduvw8fn0gaellc0x55fl9shtta787s0dny5msp8f44uzqy09lwf5zvs66ltanftwny8g0thf4qtkfst0wz3f86tufkr2et5pxjde9m25vxrlj0ahpazd7ykuuzzvs5cwmqvnkar6`
- **Ethereum (ETH)** - `0xa7A3a8DceE1cDA79ca522463662Cd4cF0Abf8C61`

### Other Ways to Support
- ⭐ **Star this repository** on GitHub
- 🐦 **Share on social media** to help others discover this tool
- 🐛 **Report bugs** to help improve the tool
- 💻 **Contribute code** or documentation improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub Repository**: https://github.com/DrakeN1721/nillion-api-tester
- **Issue Tracker**: https://github.com/DrakeN1721/nillion-api-tester/issues
- **Nil AI Documentation**: https://docs.nillion.com/
- **Official Nil AI**: https://nillion.com/

## 📞 Support

Having issues? Here's how to get help:

1. **Check the [Issues](https://github.com/DrakeN1721/nillion-api-tester/issues)** page for known problems
2. **Search existing issues** to see if your problem has been reported
3. **Create a new issue** if you can't find a solution
4. **Provide detailed information** including error messages and steps to reproduce

## 🎉 Acknowledgments

- **Nillion Team** for creating the Nil AI platform and SDK
- **Open Source Community** for libraries and tools used in this project
- **Beta Testers** who provided feedback and bug reports
- **Contributors** who help improve this tool

---

**Made with ❤️ for the developer community**

*Help us make API debugging easier for everyone by starring this repository and sharing with fellow developers!*