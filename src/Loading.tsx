// src/components/LoadingIndicator.tsx
import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface LoadingIndicatorProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingIndicatorProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <Overlay>
      <CenteredText>
        <Word color="coral">Story</Word>
        <Word color="purple">Creator</Word>
      </CenteredText>
    </Overlay>
  );
};

export default Loading;

// Keyframe for a pulsing animation
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Styles for the full-screen overlay
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's on top */
`;

// Styles for the centered text
const CenteredText = styled.div`
  display: flex;
  gap: 10px;
  font-size: 3rem;
  font-weight: bold;
  animation: ${pulse} 1.5s infinite ease-in-out;
`;

// Styles for each word in "Story Creator"
const Word = styled.span<{ color: string }>`
  color: ${(props) => props.color};
  font-size: 3rem;
`;
