import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Shield, AlertTriangle, CheckCircle, Eye, Lock, Globe, Monitor, ArrowRight } from 'lucide-react';

const modalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
    scale: 0.8;
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
    scale: 1;
  }
`;

const pulseWarning = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 170, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 170, 0, 0.8);
  }
`;

const slideContent = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 2px solid #ffaa00;
  border-radius: 16px;
  overflow: hidden;
  animation: ${modalSlideIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${pulseWarning} 2s ease-in-out infinite;
`;

const Header = styled.div`
  background: linear-gradient(135deg, rgba(255, 170, 0, 0.2) 0%, rgba(255, 68, 68, 0.2) 100%);
  border-bottom: 1px solid #ffaa00;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 170, 0, 0.1), transparent);
    animation: shimmer 2s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  h2 {
    color: #ffaa00;
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    svg {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  p {
    color: #ffffff;
    margin: 0;
    font-size: 16px;
  }
`;

const SlideContainer = styled.div`
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
`;

const Slide = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
  animation: ${props => props.active ? slideContent : 'none'} 0.5s ease-out;

  h3 {
    color: #00ff88;
    margin: 0 0 16px 0;
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    color: #e0e0e0;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }
`;

const StepList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0;

  li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    padding: 12px;
    background: rgba(0, 255, 136, 0.05);
    border: 1px solid rgba(0, 255, 136, 0.2);
    border-radius: 8px;
    color: #ffffff;

    svg {
      color: #00ff88;
      margin-top: 2px;
      flex-shrink: 0;
    }
  }
`;

const WarningBox = styled.div`
  background: rgba(255, 68, 68, 0.1);
  border: 2px solid #ff4444;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  animation: ${pulseWarning} 3s ease-in-out infinite;

  .warning-title {
    color: #ff4444;
    font-weight: 700;
    font-size: 16px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .warning-text {
    color: #ffffff;
    line-height: 1.5;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &.primary {
    background: linear-gradient(135deg, #00ff88 0%, #00ffff 100%);
    color: #000000;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 255, 136, 0.4);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  &.danger {
    background: linear-gradient(135deg, #ff4444 0%, #ffaa00 100%);
    color: #ffffff;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 68, 68, 0.4);
    }
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 16px 0;

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;

    &.active {
      background: #00ff88;
      transform: scale(1.3);
    }
  }
`;

export const SecurityWarningModal = ({ onAccept, onReject }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Security Warning",
      icon: <AlertTriangle />,
      content: (
        <div>
          <p>You're about to enable <strong style={{color: '#ffaa00'}}>dangerouslyAllowBrowser</strong> mode to test API keys in your browser.</p>

          <WarningBox>
            <div className="warning-title">
              <AlertTriangle size={20} />
              CRITICAL SECURITY NOTICE
            </div>
            <div className="warning-text">
              This mode bypasses important security protections. Only proceed if you understand the risks and are running locally for development.
            </div>
          </WarningBox>

          <p>Let's walk through what this means and how to stay safe...</p>
        </div>
      )
    },
    {
      title: "Why This Warning Exists",
      icon: <Shield />,
      content: (
        <div>
          <p>API keys are sensitive credentials that can:</p>

          <StepList>
            <li>
              <Lock />
              <span>Grant access to your AI services and usage quotas</span>
            </li>
            <li>
              <Globe />
              <span>Be intercepted by malicious websites if exposed</span>
            </li>
            <li>
              <Monitor />
              <span>Cause unexpected charges if compromised</span>
            </li>
          </StepList>

          <p>The Nil AI SDK blocks browser usage by default to protect you from accidentally exposing keys in production.</p>
        </div>
      )
    },
    {
      title: "When It's Safe",
      icon: <CheckCircle />,
      content: (
        <div>
          <p>Browser API key testing is relatively safe when:</p>

          <StepList>
            <li>
              <Monitor />
              <span>Running on <strong>localhost</strong> (127.0.0.1 or localhost:3000)</span>
            </li>
            <li>
              <Shield />
              <span>In <strong>development mode</strong> only (never production)</span>
            </li>
            <li>
              <Eye />
              <span>You're the only one with access to your computer</span>
            </li>
            <li>
              <Lock />
              <span>Using test/development API keys (not production keys)</span>
            </li>
          </StepList>
        </div>
      )
    },
    {
      title: "Final Confirmation",
      icon: <AlertTriangle />,
      content: (
        <div>
          <WarningBox>
            <div className="warning-title">
              <AlertTriangle size={20} />
              BY PROCEEDING YOU ACKNOWLEDGE:
            </div>
            <div className="warning-text">
              <ul style={{margin: '8px 0', paddingLeft: '20px'}}>
                <li>You understand the security risks</li>
                <li>You are running this locally for development/testing</li>
                <li>You will not deploy this configuration to production</li>
                <li>You are using test API keys, not production keys</li>
              </ul>
            </div>
          </WarningBox>

          <p><strong>Ready to enable dangerouslyAllowBrowser mode?</strong></p>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <Overlay>
      <Modal>
        <Header>
          <h2>
            <Shield size={28} />
            {slides[currentSlide].title}
          </h2>
          <p>API Key Security Tutorial - Step {currentSlide + 1} of {slides.length}</p>
        </Header>

        <SlideContainer>
          {slides.map((slide, index) => (
            <Slide key={index} active={index === currentSlide}>
              <h3>
                {slide.icon}
                {slide.title}
              </h3>
              {slide.content}
            </Slide>
          ))}

          <ProgressIndicator>
            {slides.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
              />
            ))}
          </ProgressIndicator>
        </SlideContainer>

        <NavigationButtons>
          <Button
            className="secondary"
            onClick={currentSlide === 0 ? onReject : prevSlide}
          >
            {currentSlide === 0 ? 'Cancel' : 'Previous'}
          </Button>

          {currentSlide === slides.length - 1 ? (
            <Button className="danger" onClick={onAccept}>
              <Shield />
              Enable dangerouslyAllowBrowser
            </Button>
          ) : (
            <Button className="primary" onClick={nextSlide}>
              Continue
              <ArrowRight />
            </Button>
          )}
        </NavigationButtons>
      </Modal>
    </Overlay>
  );
};