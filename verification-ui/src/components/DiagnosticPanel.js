import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Download,
  RefreshCw,
  Shield,
  Key,
  Server,
  Zap,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { BearerTokenService } from '../services/BearerTokenService';
import { NilAIService } from '../services/nilAIService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.accent};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${props => props.primary ? props.theme.colors.accent : props.theme.colors.primary};
  color: ${props => props.primary ? props.theme.colors.background : props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.primary ? props.theme.colors.accentDark : props.theme.colors.secondary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatusCard = styled.div`
  background: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatusTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => {
    switch (props.status) {
      case 'success': return 'rgba(34, 197, 94, 0.1)';
      case 'error': return 'rgba(239, 68, 68, 0.1)';
      case 'warning': return 'rgba(251, 191, 36, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'warning': return '#fbbf24';
      default: return '#3b82f6';
    }
  }};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const DiagnosisSection = styled.div`
  background: ${props => props.theme.colors.secondary};
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'warning': return '#fbbf24';
      default: return '#3b82f6';
    }
  }};
`;

const DiagnosisTitle = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DiagnosisMessage = styled.div`
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
`;

const TestResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const TestResult = styled.div`
  background: ${props => props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TestName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TestStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: ${props => props.success ? '#22c55e' : '#ef4444'};
  font-weight: 500;
`;

const TestDetail = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RecommendationItem = styled.div`
  background: ${props => props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#fbbf24';
      default: return '#3b82f6';
    }
  }};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RecommendationTitle = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RecommendationDescription = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const RecommendationAction = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  font-family: ${props => props.theme.fonts.mono};
  background: ${props => props.theme.colors.primary};
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 4px;
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

export function DiagnosticPanel({ apiKey, baseURL, model }) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const diagnosticResults = {
        timestamp: new Date().toISOString(),
        config: {
          apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'Not provided',
          baseURL: baseURL || 'https://nilai-a779.nillion.network/v1',
          model: model || 'google/gemma-3-27b-it'
        },
        tests: {}
      };

      // Test 1: SDK Authentication (if API key provided)
      if (apiKey) {
        try {
          const sdkService = new NilAIService(apiKey, model || 'google/gemma-3-27b-it');
          const sdkResult = await sdkService.testConnection();
          diagnosticResults.tests.sdk = {
            success: sdkResult.success,
            responseTime: sdkResult.responseTime,
            error: sdkResult.error,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          diagnosticResults.tests.sdk = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      } else {
        diagnosticResults.tests.sdk = {
          skipped: true,
          reason: 'No API key provided'
        };
      }

      // Test 2: Bearer Token Authentication
      const bearerService = new BearerTokenService({ baseURL, model });
      const bearerFullTest = await bearerService.runFullTest();
      diagnosticResults.tests.bearer = bearerFullTest.tests;

      // Generate diagnosis
      diagnosticResults.diagnosis = generateDiagnosis(
        diagnosticResults.tests.sdk,
        diagnosticResults.tests.bearer
      );

      // Generate recommendations
      diagnosticResults.recommendations = generateRecommendations(
        diagnosticResults.tests.sdk,
        diagnosticResults.tests.bearer,
        apiKey
      );

      setResults(diagnosticResults);
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setResults({
        error: error.message,
        diagnosis: {
          scenario: 'ERROR',
          severity: 'error',
          message: `Diagnostic test failed: ${error.message}`
        }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    if (!results) return;

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nil-ai-diagnostic-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <Header>
        <Title>
          <Activity />
          API Diagnostics
        </Title>
        <ActionButtons>
          <Button onClick={runDiagnostics} disabled={isRunning} primary>
            {isRunning ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
          {results && (
            <Button onClick={exportResults}>
              <Download />
              Export Report
            </Button>
          )}
        </ActionButtons>
      </Header>

      {isRunning && (
        <LoadingOverlay>
          <RefreshCw size={32} />
          <div>Running comprehensive diagnostics...</div>
          <div style={{ fontSize: '0.875rem' }}>Testing SDK, Bearer Token, and Service Health</div>
        </LoadingOverlay>
      )}

      {!isRunning && !results && (
        <EmptyState>
          <Activity />
          <div>No diagnostic results yet</div>
          <div style={{ fontSize: '0.875rem', marginTop: '8px' }}>
            Click "Run Diagnostics" to test your API key and bearer token authentication
          </div>
        </EmptyState>
      )}

      {!isRunning && results && results.diagnosis && (
        <>
          <StatusCard>
            <StatusHeader>
              <StatusTitle>
                {getSeverityIcon(results.diagnosis.severity)}
                Overall Status
              </StatusTitle>
              <StatusBadge status={results.diagnosis.severity}>
                {results.diagnosis.scenario}
              </StatusBadge>
            </StatusHeader>

            <DiagnosisSection severity={results.diagnosis.severity}>
              <DiagnosisTitle>Diagnosis</DiagnosisTitle>
              <DiagnosisMessage>{results.diagnosis.message}</DiagnosisMessage>
            </DiagnosisSection>
          </StatusCard>

          <StatusCard>
            <StatusTitle>
              <Zap />
              Test Results
            </StatusTitle>

            <TestResultsGrid>
              {/* SDK Test */}
              {results.tests?.sdk && !results.tests.sdk.skipped && (
                <TestResult>
                  <TestName>
                    <Key size={16} />
                    SDK Authentication
                  </TestName>
                  <TestStatus success={results.tests.sdk.success}>
                    {results.tests.sdk.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {results.tests.sdk.success ? 'Connected' : 'Failed'}
                  </TestStatus>
                  {results.tests.sdk.responseTime && (
                    <TestDetail>
                      <Clock size={12} />
                      {results.tests.sdk.responseTime}ms
                    </TestDetail>
                  )}
                  {results.tests.sdk.error && (
                    <TestDetail style={{ color: '#ef4444' }}>
                      {results.tests.sdk.error}
                    </TestDetail>
                  )}
                </TestResult>
              )}

              {results.tests?.sdk?.skipped && (
                <TestResult>
                  <TestName>
                    <Key size={16} />
                    SDK Authentication
                  </TestName>
                  <TestStatus>
                    <AlertCircle size={16} />
                    Skipped
                  </TestStatus>
                  <TestDetail>{results.tests.sdk.reason}</TestDetail>
                </TestResult>
              )}

              {/* Bearer Token Models Test */}
              {results.tests?.bearer?.models && (
                <TestResult>
                  <TestName>
                    <Shield size={16} />
                    Bearer Token (Models)
                  </TestName>
                  <TestStatus success={results.tests.bearer.models.success}>
                    {results.tests.bearer.models.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {results.tests.bearer.models.success ? 'Working' : 'Failed'}
                  </TestStatus>
                  {results.tests.bearer.models.result?.responseTime && (
                    <TestDetail>
                      <Clock size={12} />
                      {results.tests.bearer.models.result.responseTime}ms
                    </TestDetail>
                  )}
                </TestResult>
              )}

              {/* Service Health Test */}
              {results.tests?.bearer?.health && (
                <TestResult>
                  <TestName>
                    <Server size={16} />
                    Service Health
                  </TestName>
                  <TestStatus success={results.tests.bearer.health.success}>
                    {results.tests.bearer.health.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {results.tests.bearer.health.success ? 'Healthy' : 'Unavailable'}
                  </TestStatus>
                  {results.tests.bearer.health.uptime && (
                    <TestDetail>Uptime: {results.tests.bearer.health.uptime}</TestDetail>
                  )}
                </TestResult>
              )}
            </TestResultsGrid>
          </StatusCard>

          {results.recommendations && results.recommendations.length > 0 && (
            <StatusCard>
              <StatusTitle>
                <Info />
                Recommendations
              </StatusTitle>
              <RecommendationsList>
                {results.recommendations.map((rec, index) => (
                  <RecommendationItem key={index} priority={rec.priority}>
                    <RecommendationTitle>
                      {getPriorityBadge(rec.priority)}
                      {rec.title || rec.action}
                    </RecommendationTitle>
                    <RecommendationDescription>
                      {rec.description}
                    </RecommendationDescription>
                    {rec.action && rec.action !== rec.title && (
                      <RecommendationAction>
                        → {rec.action}
                      </RecommendationAction>
                    )}
                  </RecommendationItem>
                ))}
              </RecommendationsList>
            </StatusCard>
          )}

          {/* Subscription Verification Card */}
          <StatusCard>
            <StatusTitle>
              <CreditCard />
              Subscription Verification
            </StatusTitle>
            <DiagnosisSection severity="info">
              <DiagnosisTitle>Check Your Subscription Status</DiagnosisTitle>
              <DiagnosisMessage style={{ marginBottom: '16px' }}>
                If your API key is failing but the bearer token works, your subscription may have expired or there may be a billing issue.
              </DiagnosisMessage>
              <Button
                onClick={() => window.open('https://subscription.nillion.com', '_blank')}
                style={{ width: 'fit-content' }}
              >
                <ExternalLink />
                Open nilPay Subscription Portal
              </Button>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#888888' }}>
                • Verify your subscription is active<br />
                • Check payment method and billing status<br />
                • Ensure your API key matches your active subscription<br />
                • Review usage limits and quotas
              </div>
            </DiagnosisSection>
          </StatusCard>
        </>
      )}
    </Container>
  );
}

// Helper functions
function getSeverityIcon(severity) {
  switch (severity) {
    case 'success':
      return <CheckCircle size={20} color="#22c55e" />;
    case 'error':
      return <XCircle size={20} color="#ef4444" />;
    case 'warning':
      return <AlertCircle size={20} color="#fbbf24" />;
    default:
      return <Info size={20} color="#3b82f6" />;
  }
}

function getPriorityBadge(priority) {
  const colors = {
    critical: '#dc2626',
    high: '#ef4444',
    medium: '#fbbf24',
    info: '#3b82f6'
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.625rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      background: colors[priority] + '20',
      color: colors[priority],
      marginRight: '8px'
    }}>
      {priority}
    </span>
  );
}

function generateDiagnosis(sdkTest, bearerTest) {
  const sdkWorks = sdkTest?.success || false;
  const sdkSkipped = sdkTest?.skipped || false;
  const bearerWorks = bearerTest?.models?.success || false;

  if (sdkWorks && bearerWorks) {
    return {
      scenario: 'ALL_WORKING',
      severity: 'success',
      message: 'Both API key and bearer token authentication are working correctly. Your setup is fully functional.'
    };
  } else if (sdkWorks && !bearerWorks) {
    return {
      scenario: 'SDK_ONLY',
      severity: 'success',
      message: 'Your API key works correctly with the SDK. Bearer token limitations are expected and normal.'
    };
  } else if ((sdkSkipped || !sdkWorks) && bearerWorks) {
    return {
      scenario: 'API_KEY_ISSUE',
      severity: 'error',
      message: 'Bearer token works but API key authentication failed. This indicates an issue with your API key or subscription.'
    };
  } else if (!sdkWorks && !bearerWorks) {
    return {
      scenario: 'BOTH_FAILED',
      severity: 'error',
      message: 'Both authentication methods failed. The service may be down, or your credentials are invalid.'
    };
  } else if (sdkSkipped && !bearerWorks) {
    return {
      scenario: 'NO_API_KEY',
      severity: 'warning',
      message: 'No API key provided for testing. Bearer token test also failed. Please provide an API key to complete diagnostics.'
    };
  } else {
    return {
      scenario: 'UNKNOWN',
      severity: 'warning',
      message: 'Unable to determine the exact issue. Please review the detailed test results below.'
    };
  }
}

function generateRecommendations(sdkTest, bearerTest, apiKey) {
  const recommendations = [];
  const sdkWorks = sdkTest?.success || false;
  const sdkSkipped = sdkTest?.skipped || false;
  const bearerWorks = bearerTest?.models?.success || false;

  if (!sdkWorks && !sdkSkipped) {
    recommendations.push({
      priority: 'high',
      title: 'Verify API Key',
      description: 'Your API key validation failed. Ensure your key is exactly 64 hexadecimal characters.',
      action: 'Check your API key at https://subscription.nillion.com'
    });

    if (!apiKey || apiKey.length !== 64) {
      recommendations.push({
        priority: 'high',
        title: 'API Key Format Error',
        description: `Expected 64 characters, got ${apiKey?.length || 0}. Ensure you copied the full key.`,
        action: 'Re-copy your API key from the subscription portal'
      });
    }

    recommendations.push({
      priority: 'medium',
      title: 'Check Subscription Status',
      description: 'Verify your subscription is active and has not expired.',
      action: 'Visit https://subscription.nillion.com to check status'
    });
  }

  if (!bearerWorks) {
    recommendations.push({
      priority: 'medium',
      title: 'Service Availability',
      description: 'Bearer token test failed. The service may be temporarily unavailable.',
      action: 'Check service status or try again in a few minutes'
    });
  }

  if (sdkWorks) {
    recommendations.push({
      priority: 'info',
      title: 'All Systems Operational',
      description: 'Your API key is working correctly. Continue using the SDK for full functionality.',
      action: 'No action needed - your setup is working properly'
    });
  }

  if (sdkSkipped) {
    recommendations.push({
      priority: 'medium',
      title: 'Provide API Key',
      description: 'No API key was provided for testing. Add your API key to run a complete diagnostic.',
      action: 'Enter your API key in the API Key Manager section above'
    });
  }

  return recommendations;
}

export default DiagnosticPanel;
