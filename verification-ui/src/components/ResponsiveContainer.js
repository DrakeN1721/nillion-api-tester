import styled from 'styled-components';

export const ResponsiveContainer = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 0 8px;
  margin: 0 auto;

  @media (min-width: 640px) {
    padding: 0 16px;
  }

  @media (min-width: 1024px) {
    padding: 0 20px;
  }

  @media (min-width: 1280px) {
    max-width: 1280px;
  }

  @media (min-width: 1536px) {
    max-width: 1536px;
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 0;
  }
`;

export const FlexItem = styled.div`
  flex: ${props => props.flex || '1'};
  width: 100%;
  min-width: 0;

  @media (min-width: 1024px) {
    width: ${props => props.width || 'auto'};
  }
`;