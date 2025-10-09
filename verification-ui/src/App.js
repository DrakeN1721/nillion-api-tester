import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Header from './components/Header';
import ApiKeyManager from './components/ApiKeyManager';
import ChatInterface from './components/ChatInterface';
import LogsPanel from './components/LogsPanel';
import StatusBar from './components/StatusBar';
import { SecuritySettings } from './components/SecuritySettings';
import { SecurityBanner } from './components/SecurityBanner';
import { SecurityWarningModal } from './components/SecurityWarningModal';
import { TipJar } from './components/TipJar';
import { AboutSection } from './components/AboutSection';
import { WelcomeSplash } from './components/WelcomeSplash';
import { ExportModal } from './components/ExportModal';
import { NilAIService } from './services/nilAIService';
import { LogManager } from './utils/logManager';
import { ExportUtils } from './utils/exportUtils';
import { EnvironmentDetector, SecuritySettingsManager } from './utils/environment';

// Theme configuration
const theme = {
  colors: {
    primary: '#0a0a0a',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
    accent: '#00ffff',
    accentGreen: '#00ff88',
    accentBlue: '#0088ff',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#888888',
    border: '#333333',
    error: '#ff4444',
    success: '#00ff88',
    warning: '#ffaa00'
  },
  fonts: {
    main: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'JetBrains Mono, Fira Code, Monaco, monospace'
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 255, 255, 0.1)',
    md: '0 4px 8px rgba(0, 255, 255, 0.2)',
    lg: '0 8px 16px rgba(0, 255, 255, 0.3)'
  }
};

// NATURAL SCROLL SOLUTION - Let document flow handle it
const AppContainer = styled.div`
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.main};
`;

const AppContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  padding-top: 32px;

  @media (min-width: 768px) {
    padding-top: 40px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 0;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: 1024px) {
    width: 50%;
    border-right: 1px solid ${props => props.theme.colors.border};
  }

  @media (min-width: 1400px) {
    width: 60%;
  }
`;

const RightPanel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  @media (min-width: 1024px) {
    width: 50%;
  }

  @media (min-width: 1400px) {
    width: 40%;
  }
`;

const ApiKeySection = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.secondary};
  margin: 16px;
  margin-bottom: 0;
  border-radius: 8px 8px 0 0;

  @media (min-width: 768px) {
    margin: 20px;
    margin-bottom: 0;
  }
`;

const ChatSection = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 16px 16px 16px;

  @media (min-width: 768px) {
    margin: 0 20px 20px 20px;
  }
`;

const LogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 16px;
  height: calc(100% - 32px);

  @media (min-width: 768px) {
    margin: 20px;
    height: calc(100% - 40px);
  }
`;

function App() {
  // State management
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState('disconnected'); // connected, disconnected, testing
  const [logs, setLogs] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStats, setConnectionStats] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    totalTokens: 0
  });

  // Security settings state
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({});
  const [isLocalhost, setIsLocalhost] = useState(true);
  const [environmentWarnings, setEnvironmentWarnings] = useState([]);

  // Welcome splash state
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('main'); // 'main' or 'about'

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);

  // Model selection state
  const [selectedModel, setSelectedModel] = useState('google/gemma-3-27b-it');

  // Service instances
  const [nilAIService, setNilAIService] = useState(null);
  const [logManager] = useState(new LogManager());

  // Initialize security settings and environment detection
  useEffect(() => {
    const settings = SecuritySettingsManager.getSettings();
    const safetyCheck = EnvironmentDetector.getSafetyCheck();

    setSecuritySettings(settings);
    setIsLocalhost(safetyCheck.isLocalhost);
    setEnvironmentWarnings(safetyCheck.warnings);

    // Check if user has seen welcome splash before
    const hasSeenWelcome = localStorage.getItem('nil-ai-verifier-welcomed');
    if (!hasSeenWelcome) {
      setShowWelcomeSplash(true);
    }

    // Log environment detection
    logManager.addLog({
      type: 'info',
      category: 'security',
      message: 'Environment detected',
      details: {
        isLocalhost: safetyCheck.isLocalhost,
        isDevelopment: safetyCheck.isDevelopment,
        hostname: safetyCheck.hostname,
        isSafe: safetyCheck.isSafe,
        warnings: safetyCheck.warnings
      }
    });

    setLogs([...logManager.getAllLogs()]);
  }, [logManager]);

  // Initialize services when API key or model changes
  useEffect(() => {
    if (currentApiKey && currentApiKey.length > 10) {
      try {
        const service = new NilAIService(currentApiKey, selectedModel);
        setNilAIService(service);

        // Log API key setup
        logManager.addLog({
          type: 'info',
          category: 'auth',
          message: 'API Key configured',
          details: {
            apiKey: `${currentApiKey.substring(0, 8)}...${currentApiKey.substring(currentApiKey.length - 8)}`,
            model: selectedModel,
            timestamp: new Date().toISOString()
          }
        });

        setLogs([...logManager.getAllLogs()]);
      } catch (error) {
        logManager.addLog({
          type: 'error',
          category: 'auth',
          message: 'Failed to initialize Nil AI service',
          details: { error: error.message }
        });
        setLogs([...logManager.getAllLogs()]);
      }
    }
  }, [currentApiKey, selectedModel, logManager]);

  // Handle model change
  const handleModelChange = useCallback((newModel) => {
    setSelectedModel(newModel);

    // Update the service if it exists
    if (nilAIService) {
      nilAIService.setModel(newModel);
    }

    logManager.addLog({
      type: 'info',
      category: 'system',
      message: 'Model changed',
      details: {
        model: newModel,
        timestamp: new Date().toISOString()
      }
    });

    setLogs([...logManager.getAllLogs()]);
  }, [nilAIService, logManager]);

  // Handle API key validation
  const handleApiKeyValidation = useCallback(async (apiKey) => {
    if (!apiKey || apiKey.length < 10) {
      setApiKeyStatus('disconnected');
      setIsConnected(false);
      return false;
    }

    // Check if browser API key testing is allowed
    const isAllowed = SecuritySettingsManager.isApiKeyTestingAllowed();
    if (!isAllowed) {
      setShowSecurityWarning(true);
      return false;
    }

    setApiKeyStatus('testing');

    try {
      logManager.addLog({
        type: 'info',
        category: 'validation',
        message: 'Testing API key connection',
        details: {
          apiKey: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 8)}`,
          baseUrl: 'https://nilai-a779.nillion.network/v1/',
          model: 'google/gemma-3-27b-it'
        }
      });

      const service = new NilAIService(apiKey);
      const startTime = Date.now();

      const result = await service.testConnection();
      const responseTime = Date.now() - startTime;

      if (result.success) {
        setApiKeyStatus('connected');
        setIsConnected(true);

        // Update connection stats
        setConnectionStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          successfulRequests: prev.successfulRequests + 1,
          averageResponseTime: Math.round((prev.averageResponseTime + responseTime) / 2),
          totalTokens: prev.totalTokens + (result.usage?.total_tokens || 0)
        }));

        logManager.addLog({
          type: 'success',
          category: 'validation',
          message: 'API key validation successful',
          details: {
            responseTime: `${responseTime}ms`,
            model: result.model,
            usage: result.usage,
            response: result.response
          }
        });
      } else {
        setApiKeyStatus('disconnected');
        setIsConnected(false);

        setConnectionStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          failedRequests: prev.failedRequests + 1
        }));

        logManager.addLog({
          type: 'error',
          category: 'validation',
          message: 'API key validation failed',
          details: {
            error: result.error,
            responseTime: `${responseTime}ms`
          }
        });
      }

      setLogs([...logManager.getAllLogs()]);
      return result.success;
    } catch (error) {
      setApiKeyStatus('disconnected');
      setIsConnected(false);

      setConnectionStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        failedRequests: prev.failedRequests + 1
      }));

      logManager.addLog({
        type: 'error',
        category: 'validation',
        message: 'API key validation error',
        details: { error: error.message }
      });

      setLogs([...logManager.getAllLogs()]);
      return false;
    }
  }, [logManager]);

  // Handle chat message sending
  const handleSendMessage = useCallback(async (message) => {
    if (!nilAIService || !isConnected) {
      return;
    }

    const messageId = Date.now();
    const userMessage = {
      id: messageId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    // Add user message to chat
    setChatHistory(prev => [...prev, userMessage]);

    // Log the request
    logManager.addLog({
      type: 'info',
      category: 'chat',
      message: 'Sending chat message',
      details: {
        messageId,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        timestamp: userMessage.timestamp
      }
    });

    try {
      const startTime = Date.now();
      const response = await nilAIService.sendMessage(message, chatHistory);
      const responseTime = Date.now() - startTime;

      if (response.success) {
        const aiMessage = {
          id: messageId + 1,
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
          usage: response.usage,
          responseTime
        };

        setChatHistory(prev => [...prev, aiMessage]);

        // Update stats
        setConnectionStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          successfulRequests: prev.successfulRequests + 1,
          averageResponseTime: Math.round((prev.averageResponseTime + responseTime) / 2),
          totalTokens: prev.totalTokens + (response.usage?.total_tokens || 0)
        }));

        logManager.addLog({
          type: 'success',
          category: 'chat',
          message: 'Chat response received',
          details: {
            messageId,
            responseTime: `${responseTime}ms`,
            usage: response.usage,
            response: response.response.substring(0, 100) + (response.response.length > 100 ? '...' : '')
          }
        });
      } else {
        setConnectionStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          failedRequests: prev.failedRequests + 1
        }));

        logManager.addLog({
          type: 'error',
          category: 'chat',
          message: 'Chat request failed',
          details: {
            messageId,
            error: response.error,
            responseTime: `${responseTime}ms`
          }
        });
      }
    } catch (error) {
      setConnectionStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        failedRequests: prev.failedRequests + 1
      }));

      logManager.addLog({
        type: 'error',
        category: 'chat',
        message: 'Chat request error',
        details: {
          messageId,
          error: error.message
        }
      });
    }

    setLogs([...logManager.getAllLogs()]);
  }, [nilAIService, isConnected, chatHistory, logManager]);

  // Handle clearing logs
  const handleClearLogs = useCallback(() => {
    logManager.clearLogs();
    setLogs([]);
  }, [logManager]);

  // Handle clearing chat
  const handleClearChat = useCallback(() => {
    setChatHistory([]);
    logManager.addLog({
      type: 'info',
      category: 'system',
      message: 'Chat history cleared',
      details: { timestamp: new Date().toISOString() }
    });
    setLogs([...logManager.getAllLogs()]);
  }, [logManager]);

  // Open export modal
  const handleExportSession = useCallback(() => {
    setShowExportModal(true);
  }, []);

  // Handle actual export with format and theme
  const handleDoExport = useCallback(async (format, pdfTheme) => {
    try {
      const exportData = {
        reportId: `report-${Date.now()}`,
        apiKeyMasked: currentApiKey ? `${currentApiKey.substring(0, 8)}...${currentApiKey.substring(currentApiKey.length - 8)}` : 'None',
        connectionStatus: isConnected ? 'Connected' : 'Disconnected',
        stats: connectionStats,
        logs: logs,
        chatHistory: chatHistory,
        validation: nilAIService ? await nilAIService.getConfiguration() : null,
        lastSuccessfulRequest: logs.find(log => log.type === 'success' && log.category === 'chat')?.timestamp
      };

      ExportUtils.validateExportData(exportData);

      if (format === 'markdown') {
        // Export as Markdown
        const markdownData = ExportUtils.exportToMarkdown(exportData);
        const blob = new Blob([markdownData], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `nil-ai-verification-report-${Date.now()}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        logManager.addLog({
          type: 'success',
          category: 'system',
          message: 'Session report exported as Markdown successfully',
          details: {
            format: 'Markdown',
            reportId: exportData.reportId,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // Export as PDF
        const pdfData = await ExportUtils.exportToPDF(exportData, undefined, pdfTheme);
        const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `nil-ai-verification-report-${pdfTheme}-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);

        logManager.addLog({
          type: 'success',
          category: 'system',
          message: `Session report exported as PDF (${pdfTheme} theme) successfully`,
          details: {
            format: 'PDF',
            theme: pdfTheme,
            reportId: exportData.reportId,
            timestamp: new Date().toISOString()
          }
        });
      }

      setLogs([...logManager.getAllLogs()]);
    } catch (error) {
      logManager.addLog({
        type: 'error',
        category: 'system',
        message: 'Session export failed',
        details: { error: error.message }
      });

      setLogs([...logManager.getAllLogs()]);
    }
  }, [currentApiKey, isConnected, connectionStats, logs, chatHistory, nilAIService, logManager]);

  // Handle logs export
  const handleExportLogs = useCallback(async () => {
    try {
      const jsonData = ExportUtils.exportToJSON({
        reportId: `logs-${Date.now()}`,
        apiKeyMasked: currentApiKey ? `${currentApiKey.substring(0, 8)}...${currentApiKey.substring(currentApiKey.length - 8)}` : 'None',
        connectionStatus: isConnected ? 'Connected' : 'Disconnected',
        stats: connectionStats,
        logs: logs,
        chatHistory: chatHistory
      });

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `nil-ai-logs-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logManager.addLog({
        type: 'success',
        category: 'system',
        message: 'Logs exported successfully',
        details: {
          format: 'JSON',
          logCount: logs.length,
          timestamp: new Date().toISOString()
        }
      });

      setLogs([...logManager.getAllLogs()]);
    } catch (error) {
      logManager.addLog({
        type: 'error',
        category: 'system',
        message: 'Logs export failed',
        details: { error: error.message }
      });

      setLogs([...logManager.getAllLogs()]);
    }
  }, [currentApiKey, isConnected, connectionStats, logs, chatHistory, logManager]);

  // Handle security settings
  const handleSecuritySettings = useCallback(() => {
    setShowSecuritySettings(true);
  }, []);

  const handleSecuritySettingsClose = useCallback(() => {
    setShowSecuritySettings(false);
  }, []);

  // Handle security warning modal
  const handleSecurityWarningAccept = useCallback(() => {
    // Enable browser API key testing
    const newSettings = {
      allowBrowserApiKeys: true,
      acknowledgedRisks: true
    };

    SecuritySettingsManager.updateSettings(newSettings);
    setSecuritySettings(prev => ({ ...prev, ...newSettings }));
    setShowSecurityWarning(false);

    logManager.addLog({
      type: 'warning',
      category: 'security',
      message: 'Browser API key testing enabled via security tutorial',
      details: {
        dangerouslyAllowBrowser: true,
        timestamp: new Date().toISOString()
      }
    });

    setLogs([...logManager.getAllLogs()]);

    // Retry API key validation if we have one
    if (currentApiKey) {
      handleApiKeyValidation(currentApiKey);
    }
  }, [logManager, currentApiKey, handleApiKeyValidation]);

  const handleSecurityWarningReject = useCallback(() => {
    setShowSecurityWarning(false);
    setApiKeyStatus('disconnected');
    setIsConnected(false);

    logManager.addLog({
      type: 'info',
      category: 'security',
      message: 'User rejected browser API key testing',
      details: {
        timestamp: new Date().toISOString()
      }
    });

    setLogs([...logManager.getAllLogs()]);
  }, [logManager]);

  const handleSecuritySettingsChange = useCallback((newSettings) => {
    setSecuritySettings(newSettings);

    logManager.addLog({
      type: 'info',
      category: 'security',
      message: 'Security settings updated',
      details: {
        allowBrowserApiKeys: newSettings.allowBrowserApiKeys,
        acknowledgedRisks: newSettings.acknowledgedRisks,
        timestamp: new Date().toISOString()
      }
    });

    setLogs([...logManager.getAllLogs()]);

    // If API key testing was just enabled and we have an API key, re-validate
    if (newSettings.allowBrowserApiKeys && currentApiKey) {
      handleApiKeyValidation(currentApiKey);
    }
  }, [logManager, currentApiKey, handleApiKeyValidation]);

  // Handle welcome splash actions
  const handleWelcomeContinue = useCallback(() => {
    setShowWelcomeSplash(false);
    localStorage.setItem('nil-ai-verifier-welcomed', 'true');

    logManager.addLog({
      type: 'info',
      category: 'system',
      message: 'Welcome tutorial completed',
      details: {
        timestamp: new Date().toISOString()
      }
    });

    setLogs([...logManager.getAllLogs()]);
  }, [logManager]);

  const handleWelcomeSkip = useCallback(() => {
    setShowWelcomeSplash(false);
    localStorage.setItem('nil-ai-verifier-welcomed', 'true');

    logManager.addLog({
      type: 'info',
      category: 'system',
      message: 'Welcome tutorial skipped',
      details: {
        timestamp: new Date().toISOString()
      }
    });

    setLogs([...logManager.getAllLogs()]);
  }, [logManager]);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <AppContent>
          <Header
            isConnected={isConnected}
            onExport={handleExportSession}
            onNewSession={() => {
              handleClearChat();
              handleClearLogs();
            }}
            onSecuritySettings={handleSecuritySettings}
            securityEnabled={securitySettings.allowBrowserApiKeys && securitySettings.acknowledgedRisks}
            isLocalhost={isLocalhost}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <SecurityBanner
            securityEnabled={securitySettings.allowBrowserApiKeys && securitySettings.acknowledgedRisks}
            isLocalhost={isLocalhost}
            environmentWarnings={environmentWarnings}
          />

          {activeTab === 'about' && <AboutSection />}

          {activeTab === 'main' && (
          <MainContent>
            <LeftPanel>
              <ApiKeySection>
                <ApiKeyManager
                  currentApiKey={currentApiKey}
                  onApiKeyChange={setCurrentApiKey}
                  onValidateKey={handleApiKeyValidation}
                  status={apiKeyStatus}
                  selectedModel={selectedModel}
                  onModelChange={handleModelChange}
                />
              </ApiKeySection>

              <ChatSection>
                <ChatInterface
                  chatHistory={chatHistory}
                  onSendMessage={handleSendMessage}
                  onClearChat={handleClearChat}
                  isConnected={isConnected}
                  isLoading={apiKeyStatus === 'testing'}
                />
              </ChatSection>
            </LeftPanel>

            <RightPanel>
              <LogsContainer>
                <LogsPanel
                  logs={logs}
                  onClearLogs={handleClearLogs}
                  onExportLogs={handleExportLogs}
                />
              </LogsContainer>
            </RightPanel>
          </MainContent>
          )}

          {activeTab === 'main' && <TipJar />}

          <StatusBar
            isConnected={isConnected}
            stats={connectionStats}
            currentApiKey={currentApiKey}
          />

          <SecuritySettings
            isOpen={showSecuritySettings}
            onClose={handleSecuritySettingsClose}
            onSettingsChange={handleSecuritySettingsChange}
          />

          {showSecurityWarning && (
            <SecurityWarningModal
              onAccept={handleSecurityWarningAccept}
              onReject={handleSecurityWarningReject}
            />
          )}

          {showWelcomeSplash && (
            <WelcomeSplash
              onContinue={handleWelcomeContinue}
              onSkip={handleWelcomeSkip}
            />
          )}

          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={handleDoExport}
          />
        </AppContent>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;