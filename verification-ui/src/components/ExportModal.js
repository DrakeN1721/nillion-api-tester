import React, { useState } from 'react';
import styled from 'styled-components';
import { X, FileText, FileJson, Download, Sun, Moon } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.accent};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.tertiary};
    color: ${props => props.theme.colors.accent};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 12px;
`;

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const FormatOption = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: ${props => props.selected ? 'rgba(0, 255, 136, 0.15)' : props.theme.colors.tertiary};
  border: 2px solid ${props => props.selected ? props.theme.colors.accent : props.theme.colors.border};
  border-radius: 12px;
  color: ${props => props.selected ? props.theme.colors.accent : props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.selected ? 'rgba(0, 255, 136, 0.2)' : props.theme.colors.border};
    border-color: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.accent};
  }

  svg {
    width: 32px;
    height: 32px;
    margin-bottom: 8px;
  }

  .format-name {
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 4px;
  }

  .format-desc {
    font-size: 0.75rem;
    opacity: 0.7;
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const ThemeOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: ${props => props.selected ? 'rgba(0, 255, 136, 0.15)' : props.theme.colors.tertiary};
  border: 2px solid ${props => props.selected ? props.theme.colors.accent : props.theme.colors.border};
  border-radius: 12px;
  color: ${props => props.selected ? props.theme.colors.accent : props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.4 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    background: ${props => props.disabled ? props.theme.colors.tertiary : (props.selected ? 'rgba(0, 255, 136, 0.2)' : props.theme.colors.border)};
    border-color: ${props => props.disabled ? props.theme.colors.border : props.theme.colors.accent};
    color: ${props => props.disabled ? props.theme.colors.textSecondary : props.theme.colors.accent};
  }

  svg {
    width: 24px;
    height: 24px;
  }

  .theme-info {
    text-align: left;
  }

  .theme-name {
    font-weight: 600;
    font-size: 0.875rem;
    display: block;
  }

  .theme-desc {
    font-size: 0.75rem;
    opacity: 0.7;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }

  &.primary {
    background: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.primary};
    border: none;

    &:hover {
      background: ${props => props.theme.colors.success};
      box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
    }
  }

  &.secondary {
    background: transparent;
    color: ${props => props.theme.colors.textSecondary};
    border: 1px solid ${props => props.theme.colors.border};

    &:hover {
      background: ${props => props.theme.colors.tertiary};
      border-color: ${props => props.theme.colors.accent};
      color: ${props => props.theme.colors.accent};
    }
  }
`;

export function ExportModal({ isOpen, onClose, onExport }) {
  const [selectedFormat, setSelectedFormat] = useState('markdown');
  const [pdfTheme, setPdfTheme] = useState('dark');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(selectedFormat, pdfTheme);
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Export Verification Report</ModalTitle>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Section>
            <SectionLabel>Select Export Format</SectionLabel>
            <FormatGrid>
              <FormatOption
                selected={selectedFormat === 'markdown'}
                onClick={() => setSelectedFormat('markdown')}
              >
                <FileText />
                <div className="format-name">Markdown</div>
                <div className="format-desc">Readable .md file</div>
              </FormatOption>

              <FormatOption
                selected={selectedFormat === 'pdf'}
                onClick={() => setSelectedFormat('pdf')}
              >
                <FileJson />
                <div className="format-name">PDF</div>
                <div className="format-desc">Professional report</div>
              </FormatOption>
            </FormatGrid>
          </Section>

          {selectedFormat === 'pdf' && (
            <Section>
              <SectionLabel>PDF Theme</SectionLabel>
              <ThemeGrid>
                <ThemeOption
                  selected={pdfTheme === 'dark'}
                  onClick={() => setPdfTheme('dark')}
                >
                  <Moon />
                  <div className="theme-info">
                    <span className="theme-name">Dark</span>
                    <span className="theme-desc">Default</span>
                  </div>
                </ThemeOption>

                <ThemeOption
                  selected={pdfTheme === 'light'}
                  onClick={() => setPdfTheme('light')}
                >
                  <Sun />
                  <div className="theme-info">
                    <span className="theme-name">Light</span>
                    <span className="theme-desc">Professional</span>
                  </div>
                </ThemeOption>
              </ThemeGrid>
            </Section>
          )}

          <ActionButtons>
            <Button className="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button className="primary" onClick={handleExport}>
              <Download />
              Export {selectedFormat === 'pdf' ? 'PDF' : 'Markdown'}
            </Button>
          </ActionButtons>
        </ModalBody>
      </Modal>
    </Overlay>
  );
}

export default ExportModal;
