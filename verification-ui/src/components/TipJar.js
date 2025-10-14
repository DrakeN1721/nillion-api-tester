import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Coffee, Copy, Check, Heart, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const TipJarContainer = styled.div`
  background: ${props => props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin: 8px 16px;

  @media (min-width: 768px) {
    padding: 20px;
    margin: 16px 20px;
  }
`;

const TipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: ${props => props.isMinimized ? '0' : '16px'};
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.9;
  }

  h3 {
    color: #00ff88;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    flex: 1;
  }

  .heart {
    color: #ff6b6b;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.accent};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ENSBadge = styled.div`
  display: ${props => props.isMinimized ? 'flex' : 'none'};
  align-items: center;
  padding: 4px 10px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.7rem;
  color: ${props => props.theme.colors.accent};
  margin-left: auto;
  white-space: nowrap;
`;

const TipContent = styled.div`
  display: ${props => props.isMinimized ? 'none' : 'block'};
  animation: ${props => props.isMinimized ? 'none' : 'fadeIn 0.3s ease'};

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TipDescription = styled.p`
  color: #e0e0e0;
  margin: 0 0 16px 0;
  font-size: 13px;
  line-height: 1.4;
  text-align: center;

  .highlight {
    color: #00ff88;
    font-weight: 600;
  }
`;

const WalletGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const WalletButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${props => props.theme.colors.tertiary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.accent};
    background: rgba(0, 255, 136, 0.1);
  }

  &.priority {
    border-color: ${props => props.theme.colors.accent};
    background: rgba(0, 255, 136, 0.1);

    .badge {
      background: ${props => props.theme.colors.accent};
      color: #000000;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 8px;
      margin-left: 4px;
    }
  }

  &.copied {
    border-color: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.accent};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const QRCodeContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;

  img {
    display: block;
    width: 200px;
    height: 200px;
  }
`;

const QRLabel = styled.div`
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: ${props => props.theme.colors.textMuted};
`;

const FooterNote = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: #888888;
  text-align: center;

  .open-source {
    color: #00ff88;
    font-weight: 600;
  }
`;

const DeveloperCredits = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  font-size: 11px;
  color: ${props => props.theme.colors.textMuted};

  a {
    color: ${props => props.theme.colors.accent};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${props => props.theme.colors.accentBlue};
      text-decoration: underline;
    }
  }

  .separator {
    margin: 0 8px;
    color: ${props => props.theme.colors.border};
  }
`;

export const TipJar = () => {
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [isMinimized, setIsMinimized] = useState(() => {
    // Load minimized state from localStorage
    const saved = localStorage.getItem('tipjar-minimized');
    return saved === 'true';
  });

  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => {
      const newState = !prev;
      localStorage.setItem('tipjar-minimized', newState);
      return newState;
    });
  }, []);

  const cryptoAddresses = [
    {
      name: "Nillion (NIL)",
      symbol: "NIL",
      address: "nillion14pgcxyx66scm9er9cw67f39jxcqkd8vsf5907s",
      network: "Nillion Network",
      priority: true
    },
    {
      name: "Ethereum (ETH)",
      symbol: "ETH",
      address: "0xf3fE969443359d12dc00a7949f26B0cB06e87581",
      network: "Ethereum Mainnet"
    },
    {
      name: "Zcash (ZEC)",
      symbol: "ZEC",
      address: "u155jgwwdfcam3mqlrw86pqz5xz8dzhxznm46lrm8nduvw8fn0gaellc0x55fl9shtta787s0dny5msp8f44uzqy09lwf5zvs66ltanftwny8g0thf4qtkfst0wz3f86tufkr2et5pxjde9m25vxrlj0ahpazd7ykuuzzvs5cwmqvnkar6",
      network: "Zcash Sapling (Private)",
      showQR: true
    }
  ];

  const handleCopyAddress = useCallback(async (address, symbol) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(symbol);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedAddress(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }, []);

  return (
    <TipJarContainer>
      <TipHeader isMinimized={isMinimized} onClick={toggleMinimized}>
        <Coffee size={20} color="#00ff88" />
        <h3>Support This Project</h3>
        <Heart size={16} className="heart" />
        <ENSBadge isMinimized={isMinimized}>drakenspace.eth</ENSBadge>
        <ToggleButton>
          {isMinimized ? <ChevronDown /> : <ChevronUp />}
        </ToggleButton>
      </TipHeader>

      <TipContent isMinimized={isMinimized}>
        <TipDescription>
          <span className="highlight">Free tool</span> that saves debugging time? Support development!
        </TipDescription>

      <WalletGrid>
        {cryptoAddresses.map((crypto) => (
          <WalletButton
            key={crypto.symbol}
            onClick={() => handleCopyAddress(crypto.address, crypto.symbol)}
            className={`${crypto.priority ? 'priority' : ''} ${copiedAddress === crypto.symbol ? 'copied' : ''}`}
            title={`Copy ${crypto.name} wallet address`}
          >
            {copiedAddress === crypto.symbol ? (
              <>
                <Check />
                Copied!
              </>
            ) : (
              <>
                <Copy />
                Copy {crypto.symbol}
                {crypto.priority && <span className="badge">PREFERRED</span>}
              </>
            )}
          </WalletButton>
        ))}
      </WalletGrid>

      {cryptoAddresses.find(c => c.showQR) && (
        <>
          <QRCodeContainer>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(cryptoAddresses.find(c => c.showQR).address)}`}
              alt="Zcash QR Code"
            />
          </QRCodeContainer>
          <QRLabel>Scan to send ZEC (Zcash Unified Address)</QRLabel>
        </>
      )}

      <FooterNote>
        💡 This project is <span className="open-source">100% open source</span> and will always be free. Tips help fund development and server costs.
      </FooterNote>

        <DeveloperCredits>
          Developed by <a href="https://x.com/draken1721" target="_blank" rel="noopener noreferrer">DrakeN</a>
          <span className="separator">•</span>
          <a href="https://draken.space" target="_blank" rel="noopener noreferrer">DrakeN.Space</a>
        </DeveloperCredits>
      </TipContent>
    </TipJarContainer>
  );
};