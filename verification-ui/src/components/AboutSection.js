import React from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertTriangle, Zap, Shield, Github, Code2, Bot, FileText } from 'lucide-react';

const AboutContainer = styled.div`
  background: rgba(42, 52, 65, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin: 8px 16px;
  max-width: 100%;
  overflow-x: auto;

  @media (min-width: 768px) {
    padding: 24px;
    margin: 16px 20px;
  }
`;

const AboutHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  @media (min-width: 768px) {
    gap: 12px;
    margin-bottom: 24px;
  }

  h2 {
    color: #ffffff;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    background: linear-gradient(135deg, #00ff88 0%, #0088ff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (min-width: 768px) {
      font-size: 24px;
    }
  }
`;

const Section = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    color: #00ff88;
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  p {
    color: #e0e0e0;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }
`;

const ProblemStatement = styled.div`
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .problem-title {
    color: #ff6b6b;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .problem-text {
    color: #ffffff;
    margin: 0;
    font-size: 14px;
  }
`;

const SolutionStatement = styled.div`
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  padding: 16px;

  .solution-title {
    color: #00ff88;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .solution-text {
    color: #ffffff;
    margin: 0;
    font-size: 14px;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    color: #e0e0e0;
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
    }

    svg {
      color: #00ff88;
      width: 18px;
      height: 18px;
      margin-top: 2px;
      flex-shrink: 0;
    }
  }
`;

const UseCaseGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 16px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
`;

const UseCase = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #404859;
  border-radius: 8px;
  padding: 16px;

  .use-case-title {
    color: #ffffff;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .use-case-description {
    color: #cccccc;
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
  }
`;

const CallToAction = styled.div`
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 136, 255, 0.15) 100%);
  border: 2px solid #00ff88;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-top: 24px;

  h3 {
    color: #00ff88;
    margin: 0 0 8px 0;
    font-size: 20px;
  }

  p {
    color: #ffffff;
    margin: 0 0 16px 0;
    font-size: 16px;
  }

  .steps {
    color: #cccccc;
    font-size: 14px;
    margin: 0;
  }
`;

export const AboutSection = () => {
  return (
    <AboutContainer>
      <AboutHeader>
        <Code2 size={28} color="#00ff88" />
        <h2>Why This Tool Exists</h2>
      </AboutHeader>

      <Section>
        <ProblemStatement>
          <div className="problem-title">
            <AlertTriangle size={18} />
            The Problem
          </div>
          <p className="problem-text">
            When integrating with Nil AI APIs, developers often face mysterious failures.
            LLM coding assistants frequently blame "invalid API keys" even when keys are perfectly functional,
            leading developers down wrong troubleshooting paths and wasting valuable debugging time.
          </p>
        </ProblemStatement>

        <SolutionStatement>
          <div className="solution-title">
            <CheckCircle size={18} />
            The Solution
          </div>
          <p className="solution-text">
            Generate instant, verifiable proof that your Nil AI API key works correctly.
            Show your LLM coding assistant definitive evidence so it can focus on the real integration issues
            instead of incorrectly diagnosing functional API keys as the problem.
          </p>
        </SolutionStatement>
      </Section>

      <Section>
        <h3><Zap />What This Tool Does</h3>
        <FeatureList>
          <li>
            <CheckCircle />
            <span><strong>Instant API Verification</strong> - Tests your Nil AI key in seconds with comprehensive connection and functionality checks</span>
          </li>
          <li>
            <CheckCircle />
            <span><strong>LLM-Optimized Reports</strong> - Generates structured proof reports designed for AI tools to understand and act upon</span>
          </li>
          <li>
            <CheckCircle />
            <span><strong>Detailed Logging</strong> - Captures response times, token usage, error codes, and full request/response cycles</span>
          </li>
          <li>
            <CheckCircle />
            <span><strong>Multiple Export Formats</strong> - PDF reports, JSON data, and CSV logs for different use cases</span>
          </li>
          <li>
            <CheckCircle />
            <span><strong>Complete Privacy</strong> - API keys never leave your machine, stored only in session memory</span>
          </li>
        </FeatureList>
      </Section>

      <Section>
        <h3><Bot />Perfect for LLM Development Workflows</h3>
        <UseCaseGrid>
          <UseCase>
            <div className="use-case-title">🤖 AI Coding Assistant Debugging</div>
            <p className="use-case-description">
              When Claude, GPT, or other AI tools claim your API key isn't working,
              show them proof it's functional so they solve the real problem.
            </p>
          </UseCase>
          <UseCase>
            <div className="use-case-title">⚡ Integration Troubleshooting</div>
            <p className="use-case-description">
              Quickly eliminate API key issues from your debugging checklist
              and focus on actual integration problems like headers, endpoints, or logic.
            </p>
          </UseCase>
          <UseCase>
            <div className="use-case-title">📊 API Health Monitoring</div>
            <p className="use-case-description">
              Regular verification checks to ensure your production API keys
              remain functional and haven't been rate-limited or suspended.
            </p>
          </UseCase>
          <UseCase>
            <div className="use-case-title">📝 Documentation & Proof</div>
            <p className="use-case-description">
              Generate professional reports for team members, clients, or support tickets
              showing your API integration is working correctly.
            </p>
          </UseCase>
        </UseCaseGrid>
      </Section>

      <Section>
        <h3><Shield />Security & Privacy</h3>
        <p>This tool prioritizes your security:</p>
        <FeatureList>
          <li>
            <Shield />
            <span><strong>Session-Only Storage</strong> - API keys exist only in browser memory during testing</span>
          </li>
          <li>
            <Shield />
            <span><strong>No External Transmission</strong> - Keys never sent to servers or databases</span>
          </li>
          <li>
            <Shield />
            <span><strong>Localhost-Only Operation</strong> - Additional security layer preventing remote access</span>
          </li>
          <li>
            <Shield />
            <span><strong>Open Source Transparency</strong> - Full code review available on GitHub</span>
          </li>
        </FeatureList>
      </Section>

      <Section>
        <h3><Github />Open Source & Community</h3>
        <p>
          This tool is completely free and open source. The code is available for review,
          contribution, and forking. We believe in transparency and community-driven development
          for security-critical tools like API key verification.
        </p>
      </Section>

      <CallToAction>
        <h3>Ready to Verify Your API Key?</h3>
        <p>Get instant proof that your Nil AI integration is working correctly</p>
        <div className="steps">
          1. Paste your API key above → 2. Click "Test Connection" → 3. Generate proof report → 4. Show your LLM the results
        </div>
      </CallToAction>
    </AboutContainer>
  );
};