import { useEffect, useState } from 'react';

export type RouteType =
  | { page: 'overview' }
  | { page: 'phase'; phaseId: number }
  | { page: 'agents' }
  | { page: 'structure' }
  | { page: 'templates' }
  | { page: 'gallery' }
  | { page: 'resources' }
  | { page: 'skills' }
  | { page: 'results'; query: string }
  | { page: 'portfolio' };

export function parseHash(hash: string): RouteType {
  const clean = hash.replace(/^#\/?/, '').trim();

  if (!clean || clean === 'overview') {
    return { page: 'overview' };
  }

  const phaseMatch = clean.match(/^phase-(\d+)$/i);
  if (phaseMatch) {
    const id = parseInt(phaseMatch[1], 10);
    if (!isNaN(id) && id >= 0 && id <= 17) {
      return { page: 'phase', phaseId: id };
    }
  }

  if (clean.startsWith('results')) {
    const parts = clean.split('?');
    const params = new URLSearchParams(parts[1] || '');
    return { page: 'results', query: params.get('q') || '' };
  }

  if (clean === 'agents') return { page: 'agents' };
  if (clean === 'structure') return { page: 'structure' };
  if (clean === 'templates') return { page: 'templates' };
  if (clean === 'gallery') return { page: 'gallery' };
  if (clean === 'resources') return { page: 'resources' };
  if (clean === 'skills') return { page: 'skills' };
  if (clean === 'portfolio') return { page: 'portfolio' };

  return { page: 'overview' };
}

export function useHashRoute(): {
  route: RouteType;
  navigate: (hash: string) => void;
  rawHash: string;
} {
  const [rawHash, setRawHash] = useState<string>(() => window.location.hash || '#overview');

  useEffect(() => {
    const handleHashChange = () => {
      setRawHash(window.location.hash || '#overview');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) {
      window.location.hash = '#overview';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (hash: string) => {
    const target = hash.startsWith('#') ? hash : `#${hash}`;
    window.location.hash = target;
  };

  return {
    route: parseHash(rawHash),
    navigate,
    rawHash,
  };
}
