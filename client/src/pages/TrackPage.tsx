import { useNavigate } from 'react-router-dom';
import { FootprintForm } from '../components/FootprintForm';
import * as api from '../lib/api';
import type { FootprintInput } from '../types';

export function TrackPage() {
  const navigate = useNavigate();

  async function handleSubmit(input: FootprintInput) {
    await api.submitFootprint(input);
    navigate('/dashboard');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Track your weekly footprint</h1>
      <p className="mt-1 text-ink-700">
        Fill in what applies to you - leave anything that doesn&apos;t at zero. You can update this anytime.
      </p>
      <div className="mt-6">
        <FootprintForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
