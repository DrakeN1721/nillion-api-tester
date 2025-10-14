import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Trash2, User, Bot, Clock, Zap, MessageSquare, ChevronDown, Key, Shield } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  flex-shrink: 0;

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const HeaderTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.accent};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const AuthModeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: ${props => props.theme.colors.tertiary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-right: 12px;
`;

const HeaderButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: ${props => props.theme.colors.tertiary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  color: ${props => props.theme.colors.text};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.secondary};
    border-color: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.accent};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${props => props.theme.colors.primary};

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: ${props => props.theme.colors.textMuted};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const Message = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  animation: fadeIn 0.3s ease-out;

  ${props => props.isUser && `
    flex-direction: row-reverse;
  `}
`;

const MessageAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.875rem;

  ${props => props.isUser ? `
    background: linear-gradient(135deg, ${props.theme.colors.accentBlue} 0%, ${props.theme.colors.accent} 100%);
    color: ${props.theme.colors.primary};
  ` : `
    background: linear-gradient(135deg, ${props.theme.colors.accent} 0%, ${props.theme.colors.accentGreen} 100%);
    color: ${props.theme.colors.primary};
  `}
`;

const MessageContent = styled.div`
  flex: 1;
  max-width: 70%;
`;

const MessageBubble = styled.div`
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;

  ${props => props.isUser ? `
    background: ${props.theme.colors.tertiary};
    color: ${props.theme.colors.text};
    border-bottom-right-radius: 4px;
  ` : `
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 136, 255, 0.1) 100%);
    color: ${props.theme.colors.text};
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-bottom-left-radius: 4px;
  `}
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};

  ${props => props.isUser && `
    justify-content: flex-end;
  `}
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InputArea = styled.div`
  padding: 16px;
  border-top: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  flex-shrink: 0;

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  background: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  font-family: ${props => props.theme.fonts.main};
  resize: none;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: ${props => props.disabled ? props.theme.colors.border : `linear-gradient(135deg, ${props.theme.colors.accent} 0%, ${props.theme.colors.accentBlue} 100%)`};
  border: none;
  border-radius: 12px;
  color: ${props => props.theme.colors.primary};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.875rem;
  font-style: italic;

  .dots {
    display: flex;
    gap: 4px;

    span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${props => props.theme.colors.accent};
      animation: typing 1.4s ease-in-out infinite;

      &:nth-child(1) { animation-delay: 0ms; }
      &:nth-child(2) { animation-delay: 200ms; }
      &:nth-child(3) { animation-delay: 400ms; }
    }
  }

  @keyframes typing {
    0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1); }
  }
`;

function ChatInterface({ chatHistory, onSendMessage, onClearChat, isConnected, isLoading, apiKey, baseURL, model, authMode }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll disabled - let users control their own scrolling
  // useEffect(() => {
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [chatHistory.length, isTyping]);


  // Focus input when connected
  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isConnected]);

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected || isLoading) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsTyping(true);

    try {
      await onSendMessage(messageToSend);
    } finally {
      setIsTyping(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow line breaks with Shift+Enter
        return;
      } else {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatResponseTime = (time) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  return (
    <Container>
      <ChatHeader>
        <HeaderTitle>
          <MessageSquare />
          Interactive Chat
          {chatHistory.length > 0 && <span>({chatHistory.length} messages)</span>}
        </HeaderTitle>

        <AuthModeBadge>
          {authMode === 'sdk' ? <Key /> : <Shield />}
          {authMode === 'sdk' ? 'SDK' : 'Bearer'}
        </AuthModeBadge>

        <HeaderActions>
          <HeaderButton
            onClick={() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            disabled={chatHistory.length === 0}
            title="Scroll to bottom"
          >
            <ChevronDown />
          </HeaderButton>
          <HeaderButton onClick={onClearChat} disabled={chatHistory.length === 0}>
            <Trash2 />
            Clear
          </HeaderButton>
        </HeaderActions>
      </ChatHeader>


      <MessagesArea data-testid="messages-area">
        {chatHistory.length === 0 ? (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <h4>Ready to test your API key!</h4>
            <p>Send a message to verify your Nil AI connection and see comprehensive logging.</p>
          </EmptyState>
        ) : (
          <>
            {chatHistory.map((msg) => (
              <Message key={msg.id} isUser={msg.role === 'user'}>
                <MessageAvatar isUser={msg.role === 'user'}>
                  {msg.role === 'user' ? <User /> : <Bot />}
                </MessageAvatar>

                <MessageContent>
                  <MessageBubble isUser={msg.role === 'user'}>
                    {msg.content}
                  </MessageBubble>

                  <MessageMeta isUser={msg.role === 'user'}>
                    <MetaItem>
                      <Clock size={10} />
                      {formatTimestamp(msg.timestamp)}
                    </MetaItem>

                    {msg.responseTime && (
                      <MetaItem>
                        <Zap size={10} />
                        {formatResponseTime(msg.responseTime)}
                      </MetaItem>
                    )}

                    {msg.usage && (
                      <MetaItem>
                        {msg.usage.total_tokens} tokens
                      </MetaItem>
                    )}
                  </MessageMeta>
                </MessageContent>
              </Message>
            ))}

            {isTyping && (
              <TypingIndicator>
                <Bot size={16} />
                Nil AI is thinking...
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </TypingIndicator>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </MessagesArea>

      <InputArea>
        <InputContainer>
          <MessageInput
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !isConnected
                ? "Connect your API key to start chatting..."
                : "Type your message... (Enter to send, Shift+Enter for new line)"
            }
            disabled={!isConnected || isLoading}
            rows={1}
            style={{ height: 'auto' }}
            onInput={(e) => {
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />

          <SendButton
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected || isLoading}
            title="Send message"
          >
            <Send />
          </SendButton>
        </InputContainer>
      </InputArea>
    </Container>
  );
}

export default ChatInterface;