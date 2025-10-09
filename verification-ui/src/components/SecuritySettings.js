import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EnvironmentDetector, SecuritySettingsManager } from '../utils/environment';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: #1a1d23;
  border-radius: 12px;
  border: 2px solid ${props => props.dangerous ? '#ff6b6b' : '#2a3441'};
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  h2 {
    color: ${props => props.dangerous ? '#ff6b6b' : '#00ff88'};
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
  }

  h3 {
    color: #ffffff;
    margin: 20px 0 12px 0;
    font-size: 18px;
  }
`;

const WarningSection = styled.div`
  background: ${props => props.type === 'error' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 193, 7, 0.1)'};
  border: 1px solid ${props => props.type === 'error' ? '#ff6b6b' : '#ffc107'};
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;

  h4 {
    color: ${props => props.type === 'error' ? '#ff6b6b' : '#ffc107'};
    margin: 0 0 8px 0;
    font-size: 16px;
  }

  ul {
    margin: 8px 0;
    padding-left: 20px;
    color: #e0e0e0;

    li {
      margin: 4px 0;
      line-height: 1.4;
    }
  }
`;

const EnvironmentInfo = styled.div`
  background: #2a3441;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;

  .env-item {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 14px;

    .label {
      color: #a0a0a0;
    }

    .value {
      color: ${props => props.safe ? '#00ff88' : '#ff6b6b'};
      font-weight: bold;
    }
  }
`;

const CheckboxContainer = styled.div`
  margin: 24px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;

  input[type="checkbox"] {
    margin-top: 2px;
    transform: scale(1.2);
    accent-color: #00ff88;
  }

  label {
    color: #e0e0e0;
    line-height: 1.4;
    font-size: 14px;
    cursor: pointer;

    strong {
      color: #ffffff;
    }

    .danger {
      color: #ff6b6b;
      font-weight: bold;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;

  &.primary {
    background: #00ff88;
    color: #000000;

    &:hover:not(:disabled) {
      background: #00e577;
      transform: translateY(-2px);
    }

    &:disabled {
      background: #404040;
      color: #808080;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: #404859;
    color: #ffffff;

    &:hover {
      background: #4a5364;
      transform: translateY(-2px);
    }
  }

  &.danger {
    background: #ff6b6b;
    color: #ffffff;

    &:hover {
      background: #ff5252;
      transform: translateY(-2px);
    }
  }
`;

const RiskBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;

  &.low { background: #00ff88; color: #000; }
  &.medium { background: #ffc107; color: #000; }
  &.high { background: #ff6b6b; color: #fff; }
`;

export const SecuritySettings = ({ isOpen, onClose, onSettingsChange }) => {
  const [securityReport, setSecurityReport] = useState(null);
  const [settings, setSettings] = useState({});
  const [acknowledgedRisks, setAcknowledgedRisks] = useState(false);
  const [allowBrowserApiKeys, setAllowBrowserApiKeys] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const report = EnvironmentDetector.getSecurityReport();
      const currentSettings = SecuritySettingsManager.getSettings();

      setSecurityReport(report);
      setSettings(currentSettings);
      setAcknowledgedRisks(currentSettings.acknowledgedRisks || false);
      setAllowBrowserApiKeys(currentSettings.allowBrowserApiKeys || false);
    }
  }, [isOpen]);

  const handleSave = () => {
    const newSettings = {
      allowBrowserApiKeys,
      acknowledgedRisks,
    };

    SecuritySettingsManager.updateSettings(newSettings);
    onSettingsChange?.(newSettings);
    onClose();
  };

  const handleReset = () => {
    SecuritySettingsManager.resetSettings();
    setAcknowledgedRisks(false);
    setAllowBrowserApiKeys(false);
    onSettingsChange?.(SecuritySettingsManager.getDefaultSettings());
  };

  if (!isOpen || !securityReport) return null;

  const canEnable = securityReport.safety.isSafe && acknowledgedRisks;
  const riskLevel = securityReport.safety.riskLevel.toLowerCase();

  return (
    <Modal onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent dangerous={!securityReport.safety.isSafe}>
        <h2>
          🔒 Security Settings - API Key Testing
          <RiskBadge className={riskLevel}>
            {securityReport.safety.riskLevel} RISK
          </RiskBadge>
        </h2>

        <h3>🌍 Environment Detection</h3>
        <EnvironmentInfo safe={securityReport.safety.isSafe}>
          <div className="env-item">
            <span className="label">Hostname:</span>
            <span className="value">{securityReport.environment.hostname}</span>
          </div>
          <div className="env-item">
            <span className="label">Protocol:</span>
            <span className="value">{securityReport.environment.protocol}</span>
          </div>
          <div className="env-item">
            <span className="label">Port:</span>
            <span className="value">{securityReport.environment.port || 'default'}</span>
          </div>
          <div className="env-item">
            <span className="label">Development Mode:</span>
            <span className="value">{securityReport.safety.isDevelopment ? 'YES' : 'NO'}</span>
          </div>
          <div className="env-item">
            <span className="label">Localhost:</span>
            <span className="value">{securityReport.safety.isLocalhost ? 'YES' : 'NO'}</span>
          </div>
        </EnvironmentInfo>

        {securityReport.warnings.length > 0 && (
          <WarningSection type="error">
            <h4>⚠️ Security Warnings</h4>
            <ul>
              {securityReport.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </WarningSection>
        )}

        <WarningSection type="warning">
          <h4>💡 Security Recommendations</h4>
          <ul>
            {securityReport.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </WarningSection>

        <h3>⚙️ API Key Testing Settings</h3>

        <CheckboxContainer>
          <input
            type="checkbox"
            id="acknowledge-risks"
            checked={acknowledgedRisks}
            onChange={(e) => setAcknowledgedRisks(e.target.checked)}
          />
          <label htmlFor="acknowledge-risks">
            <strong>I understand the security implications</strong> and confirm that:
            <br />• This application is running on localhost for development only
            <br />• <span className="danger">API keys will be accessible in browser memory</span>
            <br />• This feature should <span className="danger">NEVER be used in production</span>
            <br />• I will not distribute or deploy this application with API keys exposed
          </label>
        </CheckboxContainer>

        <CheckboxContainer>
          <input
            type="checkbox"
            id="allow-browser-api-keys"
            checked={allowBrowserApiKeys}
            disabled={!canEnable}
            onChange={(e) => setAllowBrowserApiKeys(e.target.checked)}
          />
          <label htmlFor="allow-browser-api-keys">
            <strong>Enable API Key Testing (Local Development Only)</strong>
            <br />Allow the application to use API keys in the browser for testing purposes.
            This setting resets when you close the browser.
          </label>
        </CheckboxContainer>

        {!securityReport.safety.isSafe && (
          <WarningSection type="error">
            <h4>🚫 Cannot Enable API Key Testing</h4>
            <p>
              This feature is disabled because you are not running on localhost in development mode.
              For your security, API key testing is only available when running locally.
            </p>
          </WarningSection>
        )}

        <ButtonGroup>
          <Button className="secondary" onClick={handleReset}>
            Reset Settings
          </Button>
          <Button className="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="primary"
            onClick={handleSave}
            disabled={!canEnable || !allowBrowserApiKeys}
          >
            {canEnable ? 'Save & Enable Testing' : 'Cannot Enable (See Warnings)'}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};