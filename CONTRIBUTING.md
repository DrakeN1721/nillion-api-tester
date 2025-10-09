# Contributing to Nil AI Key Verification Tool

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🎯 Project Purpose

This tool is designed for **LOCAL development and testing** of Nillion API keys. It helps developers:
- Validate API key functionality
- Generate verification reports
- Debug AI assistant integration issues
- Demonstrate working API keys to development tools

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git
- A valid Nillion API key (for testing)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/nil-ai-verifier.git
   cd nil-ai-verifier
   ```

3. Install dependencies:
   ```bash
   # Root CLI tools
   npm install

   # Verification UI
   cd verification-ui
   npm install
   ```

4. Create `.env` file:
   ```bash
   cp .env.example .env
   # Add your API key to .env
   ```

5. Start development:
   ```bash
   # Electron UI
   cd verification-ui
   npm run electron-dev

   # CLI tools
   npm run chat
   ```

## 📝 Development Guidelines

### Code Style

- **JavaScript/React**: Follow Airbnb style guide
- **Formatting**: Use Prettier (included in project)
- **Linting**: ESLint configuration provided
- **Comments**: Write clear, concise comments for complex logic

### Component Structure

```javascript
// Good: Clear, semantic naming
const ApiKeyManager = ({ currentApiKey, onValidate }) => {
  // Component logic
};

// Bad: Unclear, abbreviated naming
const AKM = ({ k, v }) => {
  // Component logic
};
```

### Commit Messages

Follow conventional commits:

```
feat: Add QR code generation for reports
fix: Correct API key masking in exports
docs: Update README with new features
style: Format code with Prettier
refactor: Simplify PDF export logic
test: Add unit tests for validation
chore: Update dependencies
```

## 🔒 Security Requirements

### CRITICAL: No API Keys in Code

**Never commit:**
- Real API keys
- `.env` files
- Hardcoded credentials
- Test keys that could be real

**Always:**
- Use `.env.example` with placeholder values
- Mask API keys in UI/logs
- Validate `.gitignore` before committing
- Review diffs for accidental key exposure

### Security Checklist

Before submitting a PR:

- [ ] No hardcoded API keys
- [ ] No committed `.env` files
- [ ] API keys masked in screenshots
- [ ] Security warnings intact
- [ ] Local-only usage maintained
- [ ] No web deployment features added

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Electron tests
cd verification-ui
npm test

# Linting
npm run lint
```

### Test Coverage

- Aim for >80% coverage on new features
- Test security-critical code thoroughly
- Include edge cases and error handling

## 📦 Pull Request Process

### Before Submitting

1. **Test locally**:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

2. **Update documentation**:
   - README.md if user-facing changes
   - Code comments for complex logic
   - CHANGELOG.md for notable changes

3. **Security review**:
   - No API keys in code
   - No sensitive data in commits
   - Security warnings intact

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests passing
- [ ] Linting passing

## Security
- [ ] No API keys in code
- [ ] No sensitive data
- [ ] Security warnings intact

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process

1. Automated checks must pass
2. Code review by maintainer
3. Security review for sensitive changes
4. Testing on multiple platforms (if UI changes)
5. Approval and merge

## 🎨 UI/UX Guidelines

### Design System

- **Colors**: Use theme colors from App.js
  - Cyan `#00ffff` - Primary accent
  - Green `#00ff88` - Success
  - Red `#ff4444` - Error
  - Dark gray `#0a0a0a` - Background

- **Typography**:
  - Headers: 600 weight
  - Body: 400 weight
  - Code: JetBrains Mono

- **Spacing**: 8px grid system (8, 16, 24, 32px)

### Accessibility

- Maintain WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast for readability

## 🐛 Reporting Bugs

### Bug Reports Should Include

1. **Environment**:
   - OS and version
   - Node.js version
   - Electron version (for UI bugs)

2. **Steps to Reproduce**:
   - Minimal reproducible example
   - Expected vs actual behavior
   - Screenshots/videos if applicable

3. **Additional Context**:
   - Error messages (with API keys redacted!)
   - Console logs
   - Related issues

### Bug Report Template

```markdown
**Environment**:
- OS: macOS 14.0
- Node.js: v20.10.0
- App Version: 1.0.0

**Steps to Reproduce**:
1. Open verification UI
2. Enter API key
3. Click "Test Connection"
4. Error occurs

**Expected Behavior**:
Connection should succeed

**Actual Behavior**:
Error: "Connection failed"

**Screenshots**:
[Attach screenshots with API keys masked]

**Additional Context**:
Console shows: [error message]
```

## 💡 Feature Requests

Feature requests are welcome! Please:

1. Check existing issues/PRs first
2. Describe the use case
3. Explain why it benefits users
4. Consider security implications
5. Propose implementation (optional)

## 📋 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Unprofessional conduct

## 📞 Contact

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Security**: See SECURITY.md
- **Website**: https://draken.space

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to make this tool better for everyone! 🚀**
