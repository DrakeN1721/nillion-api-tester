import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Cpu, Plus, Trash2, ExternalLink, Info } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ModelSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  background: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.1);
  }

  &:hover {
    border-color: ${props => props.theme.colors.accent};
  }

  option {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.text};
  }
`;

const CustomModelSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: ${props => props.theme.colors.tertiary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  background: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.813rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const IconButton = styled.button`
  padding: 8px 12px;
  background: ${props => props.primary ? props.theme.colors.accent : 'transparent'};
  color: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.textSecondary};
  border: 1px solid ${props => props.primary ? props.theme.colors.accent : props.theme.colors.border};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.primary ? props.theme.colors.accentGreen : props.theme.colors.tertiary};
    border-color: ${props => props.theme.colors.accent};
    color: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.accent};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CustomModelsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
`;

const CustomModelItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.accent};
  }
`;

const ModelName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.error};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 68, 68, 0.1);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const HelpSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(0, 136, 255, 0.05);
  border: 1px solid rgba(0, 136, 255, 0.2);
  border-radius: 6px;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;

  svg {
    width: 14px;
    height: 14px;
    margin-top: 1px;
    flex-shrink: 0;
    color: ${props => props.theme.colors.accentBlue};
  }
`;

const ModelsLink = styled.a`
  color: ${props => props.theme.colors.accent};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.accentGreen};
    text-decoration: underline;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const DEFAULT_MODELS = [
  'google/gemma-3-27b-it',
  'meta-llama/Llama-3.3-70B-Instruct',
  'meta-llama/Llama-3.1-8B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3'
];

export function ModelSelector({ selectedModel, onModelChange }) {
  const [customModels, setCustomModels] = useState([]);
  const [newModelInput, setNewModelInput] = useState('');
  const [showAddModel, setShowAddModel] = useState(false);

  // Load custom models from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nil-ai-custom-models');
      if (saved) {
        setCustomModels(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load custom models:', error);
    }
  }, []);

  // Save custom models to localStorage
  const saveCustomModels = (models) => {
    try {
      localStorage.setItem('nil-ai-custom-models', JSON.stringify(models));
      setCustomModels(models);
    } catch (error) {
      console.error('Failed to save custom models:', error);
    }
  };

  const handleAddModel = () => {
    const trimmed = newModelInput.trim();
    if (!trimmed) return;

    // Check if model already exists
    const allModels = [...DEFAULT_MODELS, ...customModels];
    if (allModels.includes(trimmed)) {
      alert('This model already exists in the list');
      return;
    }

    const updated = [...customModels, trimmed];
    saveCustomModels(updated);
    setNewModelInput('');
    setShowAddModel(false);

    // Auto-select the newly added model
    onModelChange(trimmed);
  };

  const handleDeleteModel = (modelToDelete) => {
    const updated = customModels.filter(m => m !== modelToDelete);
    saveCustomModels(updated);

    // If the deleted model was selected, switch to default
    if (selectedModel === modelToDelete) {
      onModelChange(DEFAULT_MODELS[0]);
    }
  };

  const allModels = [...DEFAULT_MODELS, ...customModels];

  return (
    <Container>
      <SectionTitle>
        <Cpu />
        Model Selection
      </SectionTitle>

      <ModelSelect
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
      >
        <optgroup label="Default Models">
          {DEFAULT_MODELS.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </optgroup>
        {customModels.length > 0 && (
          <optgroup label="Custom Models">
            {customModels.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </optgroup>
        )}
      </ModelSelect>

      {!showAddModel && (
        <IconButton
          primary
          onClick={() => setShowAddModel(true)}
          title="Add custom model"
        >
          <Plus />
        </IconButton>
      )}

      {showAddModel && (
        <CustomModelSection>
          <InputRow>
            <Input
              type="text"
              value={newModelInput}
              onChange={(e) => setNewModelInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddModel()}
              placeholder="e.g., provider/model-name"
              autoFocus
            />
            <IconButton primary onClick={handleAddModel} title="Add model">
              <Plus />
            </IconButton>
            <IconButton onClick={() => setShowAddModel(false)} title="Cancel">
              ×
            </IconButton>
          </InputRow>

          {customModels.length > 0 && (
            <CustomModelsList>
              {customModels.map(model => (
                <CustomModelItem key={model}>
                  <ModelName>{model}</ModelName>
                  <DeleteButton
                    onClick={() => handleDeleteModel(model)}
                    title="Remove model"
                  >
                    <Trash2 />
                  </DeleteButton>
                </CustomModelItem>
              ))}
            </CustomModelsList>
          )}
        </CustomModelSection>
      )}

      <HelpSection>
        <Info />
        <span>
          Check the{' '}
          <ModelsLink
            href="https://docs.nillion.com/build/private-llms/overview"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nillion Docs
            <ExternalLink />
          </ModelsLink>
          {' '}for the latest available models.
        </span>
      </HelpSection>
    </Container>
  );
}

export default ModelSelector;
