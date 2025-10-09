import React from 'react';
import styled, { keyframes } from 'styled-components';
import { AlertTriangle, Lock, Eye, Wifi } from 'lucide-react';

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
`;

const BannerContainer = styled.div`
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 107, 107, 0.15) 100%);
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 4px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(4px);
  animation: ${pulse} 3s ease-in-out infinite;

  @media (min-width: 768px) {
    padding: 12px 16px;
    margin: 8px 20px;
    gap: 12px;
  }

  &.danger {
    border-color: #ff6b6b;
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 68, 68, 0.1) 100%);
  }

  &.success {
    border-color: #00ff88;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 136, 255, 0.1) 100%);
    animation: none;
  }
`;

const BannerIcon = styled.div`
  color: ${props => props.theme.colors.warning};
  display: flex;
  align-items: center;

  svg {
    width: 20px;
    height: 20px;
  }

  .danger & {
    color: #ff6b6b;
  }

  .success & {
    color: #00ff88;
  }
`;

const BannerContent = styled.div`
  flex: 1;

  .title {
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
    font-size: 14px;
  }

  .message {
    color: #e0e0e0;
    font-size: 13px;
    line-height: 1.4;

    .highlight {
      color: #ffffff;
      font-weight: 600;
    }

    .warning-text {
      color: #ffc107;
    }

    .danger-text {
      color: #ff6b6b;
    }
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
`;

export const SecurityBanner = ({
  securityEnabled,
  isLocalhost,
  environmentWarnings = []
}) => {
  // Don't show banner if no security concerns
  if (isLocalhost && !securityEnabled && environmentWarnings.length === 0) {
    return null;
  }

  // Determine banner type and content
  let bannerClass = '';
  let icon = <AlertTriangle />;
  let title = '';
  let message = '';
  let statusText = '';

  if (!isLocalhost) {
    bannerClass = 'danger';
    icon = <AlertTriangle />;
    title = '⚠️ Not Running on Localhost';
    message = (
      <>
        This application is not running on localhost. <span className="danger-text">API key testing is disabled</span> for security.
        Please run this application on <span className="highlight">localhost</span> or <span className="highlight">127.0.0.1</span> for local development.
      </>
    );
    statusText = 'UNSAFE';
  } else if (securityEnabled) {
    bannerClass = 'success';
    icon = <Lock />;
    title = '🔓 Local Development Mode Active';
    message = (
      <>
        <span className="highlight">API key testing is enabled</span> for localhost development.
        Your API keys are accessible in browser memory. <span className="warning-text">Only use for local testing</span>.
      </>
    );
    statusText = 'LOCAL DEV';
  } else {
    bannerClass = '';
    icon = <Eye />;
    title = '🔒 Secure Mode';
    message = (
      <>
        API key testing is <span className="highlight">disabled</span> for security.
        Click <span className="highlight">Security</span> in the header to enable local development mode.
      </>
    );
    statusText = 'SECURE';
  }

  return (
    <BannerContainer className={bannerClass}>
      <BannerIcon>
        {icon}
      </BannerIcon>

      <BannerContent>
        <div className="title">{title}</div>
        <div className="message">{message}</div>

        {environmentWarnings.length > 0 && (
          <div className="message" style={{ marginTop: '8px' }}>
            <strong>Environment Warnings:</strong>
            {environmentWarnings.map((warning, index) => (
              <div key={index} style={{ marginLeft: '8px', fontSize: '12px' }}>
                {warning}
              </div>
            ))}
          </div>
        )}
      </BannerContent>

      <StatusIndicator>
        <Wifi size={14} />
        <div className="status-dot"></div>
        {statusText}
      </StatusIndicator>
    </BannerContainer>
  );
};