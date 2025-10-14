import React from 'react';
import styled from 'styled-components';
import { Save, RotateCcw, FileText, Shield, Settings, Lock, Home, Info, Activity } from 'lucide-react';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 12px 20px;
  background: ${props => props.theme.colors.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  min-height: 60px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.accent};
`;

const LogoIcon = styled.div`
  font-size: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
`;

const Title = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.accent} 0%, ${props => props.theme.colors.accentBlue} 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const TabNavigation = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 20px;
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${props => props.active ? 'rgba(0, 255, 136, 0.15)' : 'transparent'};
  border: 1px solid ${props => props.active ? props.theme.colors.accent : props.theme.colors.border};
  border-radius: 6px;
  color: ${props => props.active ? props.theme.colors.accent : props.theme.colors.textSecondary};
  font-size: 0.875rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(0, 255, 136, 0.2)' : props.theme.colors.tertiary};
    border-color: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.accent};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid;
  margin-left: auto;
  margin-right: 20px;

  ${props => {
    if (props.connected) {
      return `
        background: rgba(0, 255, 136, 0.2);
        color: ${props.theme.colors.success};
        border-color: ${props.theme.colors.success};
      `;
    } else {
      return `
        background: rgba(255, 68, 68, 0.2);
        color: ${props.theme.colors.error};
        border-color: ${props.theme.colors.error};
      `;
    }
  }}
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: ${props => props.connected ? 'pulse 2s ease-in-out infinite' : 'none'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.tertiary};
    border-color: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.accent};
  }

  &:active {
    transform: translateY(1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SecurityButton = styled(ActionButton)`
  ${props => props.securityEnabled && `
    background: rgba(0, 255, 136, 0.1);
    border-color: ${props.theme.colors.accent};
    color: ${props.theme.colors.accent};

    &:hover {
      background: rgba(0, 255, 136, 0.2);
    }
  `}

  ${props => !props.localhost && `
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background: transparent;
      border-color: ${props.theme.colors.border};
      color: ${props.theme.colors.textSecondary};
    }
  `}
`;

function Header({ isConnected, onExport, onNewSession, onSecuritySettings, securityEnabled, isLocalhost, activeTab, onTabChange }) {
  return (
    <HeaderContainer>
      <Logo>
        <LogoIcon>🤖</LogoIcon>
        <Title>Nil AI Key Verification</Title>
      </Logo>

      <TabNavigation>
        <TabButton
          active={activeTab === 'main'}
          onClick={() => onTabChange('main')}
          title="Main verification interface"
        >
          <Home />
          Main
        </TabButton>
        <TabButton
          active={activeTab === 'diagnostics'}
          onClick={() => onTabChange('diagnostics')}
          title="Run comprehensive API diagnostics"
        >
          <Activity />
          Diagnostics
        </TabButton>
        <TabButton
          active={activeTab === 'about'}
          onClick={() => onTabChange('about')}
          title="Learn about this tool"
        >
          <Info />
          About
        </TabButton>
      </TabNavigation>

      <StatusIndicator connected={isConnected}>
        <Shield size={14} />
        <StatusDot connected={isConnected} />
        {isConnected ? 'Connected & Verified' : 'Disconnected'}
      </StatusIndicator>

      <ActionButtons>
        <SecurityButton
          onClick={onSecuritySettings}
          securityEnabled={securityEnabled}
          localhost={isLocalhost}
          title={isLocalhost
            ? (securityEnabled ? "Security Settings (Local Mode Enabled)" : "Security Settings - Enable Local Development Mode")
            : "Security Settings (Only Available on Localhost)"
          }
        >
          {securityEnabled ? <Lock /> : <Settings />}
          {securityEnabled ? 'Local Mode' : 'Security'}
        </SecurityButton>

        <ActionButton onClick={onNewSession} title="Start New Session">
          <RotateCcw />
          New Session
        </ActionButton>

        <ActionButton onClick={onExport} title="Export Session Report">
          <Save />
          Export
        </ActionButton>
      </ActionButtons>
    </HeaderContainer>
  );
}

export default Header;