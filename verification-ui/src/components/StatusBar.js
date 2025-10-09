import React from 'react';
import styled from 'styled-components';
import {
  Wifi, WifiOff, Clock, Zap, CheckCircle, XCircle,
  BarChart3, Key, Server, Activity
} from 'lucide-react';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: ${props => props.theme.colors.secondary};
  border-top: 1px solid ${props => props.theme.colors.border};
  font-size: 0.75rem;
  min-height: 40px;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => {
    if (props.type === 'success') return props.theme.colors.success;
    if (props.type === 'error') return props.theme.colors.error;
    if (props.type === 'warning') return props.theme.colors.warning;
    return props.theme.colors.textSecondary;
  }};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 16px;
  background: ${props => props.theme.colors.border};
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;

  ${props => props.connected ? `
    color: ${props.theme.colors.success};
  ` : `
    color: ${props.theme.colors.error};
  `}

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.accent};
`;

const ApiKeyDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => props.theme.colors.textMuted};
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.7rem;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const SuccessRate = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => {
    const rate = props.rate;
    if (rate >= 90) return props.theme.colors.success;
    if (rate >= 70) return props.theme.colors.warning;
    return props.theme.colors.error;
  }};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const BlinkingDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: ${props => props.active ? 'blink 2s ease-in-out infinite' : 'none'};

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
`;

function StatusBar({ isConnected, stats, currentApiKey }) {
  const formatApiKey = (key) => {
    if (!key || key.length < 16) return 'No API key';
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
  };

  const calculateSuccessRate = () => {
    if (stats.totalRequests === 0) return 0;
    return Math.round((stats.successfulRequests / stats.totalRequests) * 100);
  };

  const formatResponseTime = (time) => {
    if (time === 0) return '--';
    return `${time}ms`;
  };

  const formatTokenCount = (count) => {
    if (count === 0) return '--';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const successRate = calculateSuccessRate();

  return (
    <Container>
      <StatusSection>
        <ConnectionStatus connected={isConnected}>
          {isConnected ? <Wifi /> : <WifiOff />}
          <BlinkingDot active={isConnected} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </ConnectionStatus>

        <Separator />

        <ApiKeyDisplay>
          <Key />
          {formatApiKey(currentApiKey)}
        </ApiKeyDisplay>

        <Separator />

        <StatusItem>
          <Server />
          nilai-a779.nillion.network
        </StatusItem>
      </StatusSection>

      <StatusSection>
        <StatusItem>
          <BarChart3 />
          Requests: <StatValue>{stats.totalRequests}</StatValue>
        </StatusItem>

        <Separator />

        <SuccessRate rate={successRate}>
          {successRate >= 90 ? <CheckCircle /> :
           successRate >= 70 ? <Activity /> : <XCircle />}
          Success: <StatValue>{successRate}%</StatValue>
        </SuccessRate>

        <Separator />

        <StatusItem>
          <Clock />
          Avg Response: <StatValue>{formatResponseTime(stats.averageResponseTime)}</StatValue>
        </StatusItem>

        <Separator />

        <StatusItem>
          <Zap />
          Tokens: <StatValue>{formatTokenCount(stats.totalTokens)}</StatValue>
        </StatusItem>
      </StatusSection>
    </Container>
  );
}

export default StatusBar;