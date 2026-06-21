import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PersonaCard } from '../PersonaCard';
import type { PersonaInfo } from '../../types';

const knownPersona: PersonaInfo = {
  id: 'commuter-heavy',
  title: 'High-Travel Commuter',
  description: 'Your carbon footprint is heavily influenced by private car travel.',
  focus: 'transport'
};

const unknownPersona: PersonaInfo = {
  id: 'unknown-id',
  title: 'Eco Explorer',
  description: 'An atypical carbon profile with balanced categories.',
  focus: 'home'
};

describe('PersonaCard', () => {
  it('renders persona title and description for a known persona', () => {
    render(<PersonaCard persona={knownPersona} />);
    
    expect(screen.getByText('High-Travel Commuter')).toBeInTheDocument();
    expect(screen.getByText(/heavily influenced by private car travel/)).toBeInTheDocument();
    // Check if the icon 🚗 is present
    expect(screen.getByText('🚗')).toBeInTheDocument();
  });

  it('renders persona title and description and falls back gracefully for an unknown persona', () => {
    render(<PersonaCard persona={unknownPersona} />);
    
    expect(screen.getByText('Eco Explorer')).toBeInTheDocument();
    expect(screen.getByText(/An atypical carbon profile/)).toBeInTheDocument();
    // Check fallback icon 🌍
    expect(screen.getByText('🌍')).toBeInTheDocument();
  });
});
