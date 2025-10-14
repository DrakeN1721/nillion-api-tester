import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  ScrollText, Download, Copy, Trash2, Search, Filter,
  CheckCircle, XCircle, AlertTriangle, Info,
  ChevronDown, ChevronRight, Eye, Code, ChevronLeft, ChevronsLeft
} from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.isCollapsed ? '60px' : '100%'};
  transition: width 0.3s ease;
  position: relative;
  overflow: ${props => props.isCollapsed ? 'hidden' : 'visible'};
`;

const CollapseButton = styled.button`
  position: absolute;
  top: 16px;
  left: ${props => props.isCollapsed ? '50%' : '16px'};
  transform: ${props => props.isCollapsed ? 'translateX(-50%)' : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${props => props.theme.colors.tertiary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  color: ${props => props.theme.colors.accent};
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: ${props => props.theme.colors.accent};
    color: #000;
    transform: ${props => props.isCollapsed ? 'translateX(-50%) translateY(-2px)' : 'translateY(-2px)'};
    box-shadow: ${props => props.theme.shadows.md};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CollapsedSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
  gap: 16px;
`;

const CollapsedIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.theme.colors.tertiary};
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.accent};
    color: #000;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CollapsedCount = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  background: ${props => props.theme.colors.accent};
  color: #000;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const LogsHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.secondary};
  gap: 12px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const HeaderTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.accent};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  .count {
    font-size: 0.875rem;
    color: ${props => props.theme.colors.textMuted};
    font-weight: 400;
  }
`;

const HeaderBottom = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  background: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${props => props.active ? `rgba(0, 255, 255, 0.15)` : props.theme.colors.tertiary};
  border: 1px solid ${props => props.active ? props.theme.colors.accent : props.theme.colors.border};
  border-radius: 6px;
  color: ${props => props.active ? props.theme.colors.accent : props.theme.colors.textSecondary};
  font-size: 0.875rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.accent};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${props => props.theme.colors.tertiary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.colors.accent};
    border-color: ${props => props.theme.colors.accent};
    color: #000;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;

    &:hover {
      background: ${props => props.theme.colors.tertiary};
      border-color: ${props => props.theme.colors.border};
      color: ${props => props.theme.colors.text};
    }
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const LogsList = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LogEntry = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.secondary};
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.accent};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const LogHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  gap: 8px;
  user-select: none;

  &:hover {
    background: ${props => props.theme.colors.tertiary};
  }
`;

const LogIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;

  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: rgba(0, 255, 136, 0.2);
          color: ${props.theme.colors.success};
        `;
      case 'error':
        return `
          background: rgba(255, 68, 68, 0.2);
          color: ${props.theme.colors.error};
        `;
      case 'warning':
        return `
          background: rgba(255, 170, 0, 0.2);
          color: ${props.theme.colors.warning};
        `;
      default:
        return `
          background: rgba(0, 255, 255, 0.2);
          color: ${props.theme.colors.accent};
        `;
    }
  }}

  svg {
    width: 12px;
    height: 12px;
  }
`;

const LogInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const LogMessage = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  line-height: 1.4;
`;

const LogMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
`;

const LogCategory = styled.span`
  background: ${props => props.theme.colors.tertiary};
  color: ${props => props.theme.colors.accent};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: ${props => props.theme.fonts.mono};
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: ${props => props.theme.colors.accent};
    background: ${props => props.theme.colors.tertiary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LogDetails = styled.div`
  padding: 0 12px 12px 12px;
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.primary};
`;

const DetailsContent = styled.pre`
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.tertiary};
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0 0 0;
  line-height: 1.4;
`;

const DetailsActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const DetailButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.625rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.accent};
  }

  svg {
    width: 10px;
    height: 10px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: ${props => props.theme.colors.textMuted};
`;

const LogTypeIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle />;
    case 'error':
      return <XCircle />;
    case 'warning':
      return <AlertTriangle />;
    default:
      return <Info />;
  }
};

function LogsPanel({ logs, onClearLogs, onExportLogs, isCollapsed, onToggleCollapse }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const logsEndRef = useRef(null);

  // Load collapse state from localStorage
  useEffect(() => {
    const savedCollapseState = localStorage.getItem('logs-panel-collapsed');
    if (savedCollapseState !== null && onToggleCollapse && isCollapsed === undefined) {
      onToggleCollapse(savedCollapseState === 'true');
    }
  }, []);

  // Save collapse state to localStorage
  useEffect(() => {
    if (isCollapsed !== undefined) {
      localStorage.setItem('logs-panel-collapsed', isCollapsed);
    }
  }, [isCollapsed]);

  // Auto-scroll disabled - let users control their own scrolling
  // useEffect(() => {
  //   if (logs.length > 0 && logsEndRef.current) {
  //     logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [logs.length]);

  // Filter logs based on search and type filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || log.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleToggleExpand = (logId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const handleCopyLog = (log) => {
    const logText = `[${log.timestamp}] ${log.type.toUpperCase()} (${log.category}): ${log.message}\nDetails: ${JSON.stringify(log.details, null, 2)}`;
    navigator.clipboard.writeText(logText);
  };

  const handleCopyDetails = (details) => {
    navigator.clipboard.writeText(JSON.stringify(details, null, 2));
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLogCounts = () => {
    const counts = { all: logs.length };
    ['info', 'success', 'warning', 'error'].forEach(type => {
      counts[type] = logs.filter(log => log.type === type).length;
    });
    return counts;
  };

  const logCounts = getLogCounts();

  // If collapsed, show minimal sidebar
  if (isCollapsed) {
    return (
      <Container isCollapsed={isCollapsed}>
        <CollapseButton
          onClick={onToggleCollapse}
          isCollapsed={isCollapsed}
          title="Expand logs panel (Ctrl/Cmd + L)"
        >
          <ChevronLeft />
        </CollapseButton>

        <CollapsedSidebar>
          <CollapsedIcon
            onClick={onToggleCollapse}
            title="Expand logs panel"
            style={{ position: 'relative' }}
          >
            <ScrollText />
            {logs.length > 0 && <CollapsedCount>{logs.length}</CollapsedCount>}
          </CollapsedIcon>

          {logCounts.error > 0 && (
            <CollapsedIcon title={`${logCounts.error} errors`} style={{ position: 'relative' }}>
              <XCircle />
              <CollapsedCount>{logCounts.error}</CollapsedCount>
            </CollapsedIcon>
          )}

          {logCounts.success > 0 && (
            <CollapsedIcon title={`${logCounts.success} successful`} style={{ position: 'relative' }}>
              <CheckCircle />
              <CollapsedCount>{logCounts.success}</CollapsedCount>
            </CollapsedIcon>
          )}
        </CollapsedSidebar>
      </Container>
    );
  }

  return (
    <Container isCollapsed={isCollapsed}>
      <CollapseButton
        onClick={onToggleCollapse}
        isCollapsed={isCollapsed}
        title="Collapse logs panel (Ctrl/Cmd + L)"
      >
        <ChevronsLeft />
      </CollapseButton>

      <LogsHeader>
        <HeaderTop>
          <HeaderTitle>
            <ScrollText />
            Logs
            {filteredLogs.length !== logs.length && (
              <span className="count">({filteredLogs.length} of {logs.length})</span>
            )}
            {filteredLogs.length === logs.length && logs.length > 0 && (
              <span className="count">({logs.length})</span>
            )}
          </HeaderTitle>

          <HeaderActions>
            <ActionButton onClick={onExportLogs} disabled={logs.length === 0} title="Export logs to JSON">
              <Download />
              Export
            </ActionButton>

            <ActionButton onClick={onClearLogs} disabled={logs.length === 0} title="Clear all logs">
              <Trash2 />
              Clear
            </ActionButton>
          </HeaderActions>
        </HeaderTop>

        <HeaderBottom>
          <SearchContainer>
            <Search size={16} />
            <SearchInput
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <FilterButton
            active={filterType === 'all'}
            onClick={() => setFilterType('all')}
            title="Show all logs"
          >
            All ({logCounts.all})
          </FilterButton>

          <FilterButton
            active={filterType === 'error'}
            onClick={() => setFilterType('error')}
            title="Show only errors"
          >
            <XCircle />
            {logCounts.error}
          </FilterButton>

          <FilterButton
            active={filterType === 'success'}
            onClick={() => setFilterType('success')}
            title="Show only successful operations"
          >
            <CheckCircle />
            {logCounts.success}
          </FilterButton>
        </HeaderBottom>
      </LogsHeader>

      <LogsList data-testid="logs-list">
        {filteredLogs.length === 0 ? (
          <EmptyState>
            <ScrollText size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h4>No logs yet</h4>
            <p>API interactions and system events will appear here</p>
          </EmptyState>
        ) : (
          <>
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogs.has(log.id);
              const hasDetails = Object.keys(log.details).length > 0;

              return (
                <LogEntry key={log.id}>
                  <LogHeader onClick={() => hasDetails && handleToggleExpand(log.id)}>
                    <LogIcon type={log.type}>
                      <LogTypeIcon type={log.type} />
                    </LogIcon>

                    <LogInfo>
                      <LogMessage>{log.message}</LogMessage>
                      <LogMeta>
                        <LogCategory>{log.category}</LogCategory>
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </LogMeta>
                    </LogInfo>

                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLog(log);
                    }}>
                      <Copy />
                    </ActionButton>

                    {hasDetails && (
                      <ExpandButton>
                        {isExpanded ? <ChevronDown /> : <ChevronRight />}
                      </ExpandButton>
                    )}
                  </LogHeader>

                  {isExpanded && hasDetails && (
                    <LogDetails>
                      <DetailsContent>
                        {JSON.stringify(log.details, null, 2)}
                      </DetailsContent>

                      <DetailsActions>
                        <DetailButton onClick={() => handleCopyDetails(log.details)}>
                          <Copy />
                          Copy Details
                        </DetailButton>
                      </DetailsActions>
                    </LogDetails>
                  )}
                </LogEntry>
              );
            })}
            <div ref={logsEndRef} />
          </>
        )}
      </LogsList>
    </Container>
  );
}

export default LogsPanel;