import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Eye, EyeOff, Key, CheckCircle, XCircle, AlertCircle, TestTube, Copy, History } from 'lucide-react';
import { NilAIService } from '../services/nilAIService';
import { ModelSelector } from './ModelSelector';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.accent};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ApiKeyInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  background: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }

  ${props => props.error && `
    border-color: ${props.theme.colors.error};
  `}

  ${props => props.success && `
    border-color: ${props.theme.colors.success};
  `}
`;

const VisibilityToggle = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.accent};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ValidationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ValidationResult = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;

  ${props => {
    switch (props.status) {
      case 'connected':
        return `
          background: rgba(0, 255, 136, 0.1);
          color: ${props.theme.colors.success};
          border: 1px solid rgba(0, 255, 136, 0.3);
        `;
      case 'disconnected':
        return `
          background: rgba(255, 68, 68, 0.1);
          color: ${props.theme.colors.error};
          border: 1px solid rgba(255, 68, 68, 0.3);
        `;
      case 'testing':
        return `
          background: rgba(255, 170, 0, 0.1);
          color: ${props.theme.colors.warning};
          border: 1px solid rgba(255, 170, 0, 0.3);
        `;
      default:
        return `
          background: ${props.theme.colors.tertiary};
          color: ${props.theme.colors.textSecondary};
          border: 1px solid ${props.theme.colors.border};
        `;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${props => props.primary ? props.theme.colors.accent : 'transparent'};
  color: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.textSecondary};
  border: 1px solid ${props => props.primary ? props.theme.colors.accent : props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.primary ? props.theme.colors.accent : props.theme.colors.tertiary};
    border-color: ${props => props.theme.colors.accent};
    color: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.accent};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const KeyHistory = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 8px 12px;
  background: ${props => props.theme.colors.tertiary};
  border-radius: 6px;
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.accent};
  }
`;

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'connected':
      return <CheckCircle size={16} />;
    case 'disconnected':
      return <XCircle size={16} />;
    case 'testing':
      return <AlertCircle size={16} className="animate-pulse" />;
    default:
      return <Key size={16} />;
  }
};

function ApiKeyManager({ currentApiKey, onApiKeyChange, onValidateKey, status, selectedModel, onModelChange }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyHistory, setKeyHistory] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [formatValidation, setFormatValidation] = useState(null);

  // Load key history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nil-ai-key-history');
      if (saved) {
        setKeyHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load key history:', error);
    }
  }, []);

  // Validate API key format as user types
  useEffect(() => {
    if (currentApiKey) {
      const validation = NilAIService.validateApiKeyFormat(currentApiKey);
      setFormatValidation(validation);
    } else {
      setFormatValidation(null);
    }
  }, [currentApiKey]);

  // Update validation message based on status
  useEffect(() => {
    switch (status) {
      case 'connected':
        setValidationMessage('✅ API key validated successfully - Nil AI connection established');
        break;
      case 'disconnected':
        setValidationMessage('❌ API key validation failed - Unable to connect to Nil AI');
        break;
      case 'testing':
        setValidationMessage('🔄 Testing API key connection...');
        break;
      default:
        setValidationMessage(formatValidation?.reason || 'Enter your Nil AI API key to begin verification');
    }
  }, [status, formatValidation]);

  const handleApiKeyChange = (e) => {
    onApiKeyChange(e.target.value);
  };

  const handleTestConnection = async () => {
    if (!currentApiKey) return;

    const isValid = await onValidateKey(currentApiKey);

    if (isValid) {
      // Add to history if successful and not already present
      const keyDisplay = `${currentApiKey.substring(0, 8)}...${currentApiKey.substring(currentApiKey.length - 8)}`;
      const historyItem = {
        key: currentApiKey,
        display: keyDisplay,
        timestamp: new Date().toISOString(),
        status: 'connected'
      };

      setKeyHistory(prev => {
        const filtered = prev.filter(item => item.key !== currentApiKey);
        const newHistory = [historyItem, ...filtered].slice(0, 10); // Keep last 10

        try {
          localStorage.setItem('nil-ai-key-history', JSON.stringify(newHistory));
        } catch (error) {
          console.error('Failed to save key history:', error);
        }

        return newHistory;
      });
    }
  };

  const handleSelectFromHistory = (historyKey) => {
    onApiKeyChange(historyKey);
  };

  const handleCopyKey = () => {
    if (currentApiKey) {
      navigator.clipboard.writeText(currentApiKey);
    }
  };

  return (
    <Container>
      <SectionTitle>
        <Key />
        API Key Management
      </SectionTitle>

      <InputGroup>
        <Label>Nil AI API Key</Label>
        <InputContainer>
          <ApiKeyInput
            type={showApiKey ? 'text' : 'password'}
            value={currentApiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your Nil AI API key (e.g., abc123def456...)"
            error={formatValidation && !formatValidation.valid}
            success={status === 'connected'}
          />
          <VisibilityToggle
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            title={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? <EyeOff /> : <Eye />}
          </VisibilityToggle>
        </InputContainer>
      </InputGroup>

      <ModelSelector
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />

      <ValidationSection>
        <ValidationResult status={status}>
          <StatusIcon status={status} />
          {validationMessage}
        </ValidationResult>

        <ActionButtons>
          <ActionButton
            primary
            onClick={handleTestConnection}
            disabled={!currentApiKey || !formatValidation?.valid || status === 'testing'}
          >
            <TestTube />
            {status === 'testing' ? 'Testing...' : 'Test Connection'}
          </ActionButton>

          <ActionButton onClick={handleCopyKey} disabled={!currentApiKey}>
            <Copy />
            Copy Key
          </ActionButton>
        </ActionButtons>
      </ValidationSection>

      {keyHistory.length > 0 && (
        <KeyHistory>
          <Label>
            <History size={14} style={{ marginRight: '6px' }} />
            Recent API Keys
          </Label>
          {keyHistory.slice(0, 5).map((item, index) => (
            <HistoryItem
              key={index}
              onClick={() => handleSelectFromHistory(item.key)}
              title={`Used on ${new Date(item.timestamp).toLocaleString()}`}
            >
              {item.display}
              <StatusIcon status={item.status} />
            </HistoryItem>
          ))}
        </KeyHistory>
      )}
    </Container>
  );
}

export default ApiKeyManager;