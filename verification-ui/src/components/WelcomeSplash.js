import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Bot, Zap, CheckCircle, ArrowRight, FileText, AlertTriangle, Target } from 'lucide-react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 68, 68, 0.6);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%);
  backdrop-filter: blur(12px);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  animation: ${fadeIn} 0.8s ease-out;
  overflow-y: auto;
  padding: 40px 0;
`;

const SplashContainer = styled.div`
  width: 90%;
  max-width: 650px;
  max-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 20px;
  overflow-y: auto;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff4444, #ffaa00, #00ff88, #0088ff, #ff4444);
    background-size: 400% 400%;
    border-radius: 22px;
    z-index: -1;
    animation: ${glow} 2s ease-in-out infinite;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, rgba(255, 68, 68, 0.2) 0%, rgba(255, 170, 0, 0.2) 100%);
  padding: 32px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -200px;
    width: 200px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: ${shimmer} 2s infinite;
  }

  h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 16px 0;
    background: linear-gradient(135deg, #ff4444 0%, #ffaa00 50%, #00ff88 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
    animation: ${fadeIn} 1s ease-out 0.3s both;
  }

  .subtitle {
    font-size: 18px;
    color: #ffffff;
    margin: 0;
    animation: ${fadeIn} 1s ease-out 0.6s both;
  }
`;

const ProblemSection = styled.div`
  padding: 24px;
  background: rgba(255, 68, 68, 0.05);
  border-top: 2px solid rgba(255, 68, 68, 0.3);
  animation: ${fadeIn} 1s ease-out 0.9s both;

  .problem-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: rgba(255, 68, 68, 0.2);
    border: 2px solid #ff4444;
    border-radius: 50%;
    margin: 0 auto 16px;
    animation: ${bounce} 2s ease-in-out infinite;

    svg {
      color: #ff4444;
    }
  }

  h2 {
    color: #ff4444;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 16px 0;
  }

  .problem-text {
    color: #ffffff;
    font-size: 16px;
    line-height: 1.6;
    text-align: center;
    margin: 0;

    .highlight {
      color: #ffaa00;
      font-weight: 700;
    }
  }
`;

const SolutionSection = styled.div`
  padding: 24px;
  background: rgba(0, 255, 136, 0.05);
  border-top: 2px solid rgba(0, 255, 136, 0.3);
  animation: ${fadeIn} 1s ease-out 1.2s both;

  .solution-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: rgba(0, 255, 136, 0.2);
    border: 2px solid #00ff88;
    border-radius: 50%;
    margin: 0 auto 16px;
    animation: ${bounce} 2s ease-in-out infinite 0.5s;

    svg {
      color: #00ff88;
    }
  }

  h2 {
    color: #00ff88;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 16px 0;
  }

  .solution-text {
    color: #ffffff;
    font-size: 16px;
    line-height: 1.6;
    text-align: center;
    margin: 0 0 24px 0;

    .highlight {
      color: #00ff88;
      font-weight: 700;
    }
  }
`;

const StepsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;

  .step {
    background: rgba(0, 136, 255, 0.1);
    border: 1px solid rgba(0, 136, 255, 0.3);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 136, 255, 0.2);
    }

    .step-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #0088ff 0%, #00ffff 100%);
      color: #000000;
      font-weight: 800;
      border-radius: 50%;
      margin: 0 auto 12px;
      font-size: 14px;
    }

    .step-title {
      color: #0088ff;
      font-weight: 600;
      font-size: 14px;
      margin: 0 0 8px 0;
    }

    .step-desc {
      color: #cccccc;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 1s ease-out 1.5s both;
`;

const Button = styled.button`
  padding: 18px 40px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #00ff88 0%, #00ffff 100%);
  color: #000000;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(0, 255, 136, 0.4);
  }

  svg {
    width: 22px;
    height: 22px;
  }
`;

export const WelcomeSplash = ({ onContinue, onSkip }) => {
  return (
    <Overlay>
      <SplashContainer>
        <Header>
          <h1>Does AI Keep Sabotaging Your Code?</h1>
          <p className="subtitle">
            "Your Nillion API Key is invalid!" ...even when you KNOW it works?
          </p>
        </Header>

        <ProblemSection>
          <div className="problem-icon">
            <Bot size={28} />
          </div>
          <h2>The AI Frustration is REAL!</h2>
          <p className="problem-text">
            <span className="highlight">Claude, GPT, and other AI assistants</span> constantly blame your perfectly functional API keys
            when they can't figure out integration issues. You waste hours debugging the <span className="highlight">wrong problem!</span>
          </p>
        </ProblemSection>

        <SolutionSection>
          <div className="solution-icon">
            <Target size={28} />
          </div>
          <h2>HERE'S THE SOLUTION!</h2>
          <p className="solution-text">
            Generate <span className="highlight">instant, verifiable proof</span> that your API key works.
            Show your AI assistant <span className="highlight">definitive evidence</span> so it focuses on the
            <span className="highlight">real problems</span> instead of false API key accusations!
          </p>

          <StepsList>
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-title">Paste API Key</div>
              <div className="step-desc">Enter your Nillion API key</div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-title">Test & Verify</div>
              <div className="step-desc">Instant connection validation</div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-title">Get Proof Report</div>
              <div className="step-desc">AI-readable verification</div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-title">Show Your AI</div>
              <div className="step-desc">Stop the false accusations!</div>
            </div>
          </StepsList>
        </SolutionSection>

        <ActionButtons>
          <Button onClick={onContinue}>
            <Zap />
            Let's Get Started
            <ArrowRight />
          </Button>
        </ActionButtons>
      </SplashContainer>
    </Overlay>
  );
};