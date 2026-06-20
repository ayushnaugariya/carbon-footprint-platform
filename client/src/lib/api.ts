import type {
  AuthUser,
  CategoryBreakdown,
  CompletedAction,
  FootprintEntry,
  FootprintInput,
  PersonaInfo,
  RecommendationAction,
  TrendResult
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let authToken: string | null = null;

/** Sets the in-memory auth token used for all subsequent API requests. */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const message = (body as { error?: string } | null)?.error ?? `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return body as T;
}

// --- Auth ---
export function signup(email: string, password: string, displayName: string) {
  return request<{ token: string; user: AuthUser }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName })
  });
}

export function login(email: string, password: string) {
  return request<{ token: string; user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function guestLogin(displayName?: string) {
  return request<{ token: string; user: AuthUser }>('/api/auth/guest', {
    method: 'POST',
    body: JSON.stringify({ displayName })
  });
}

export function getMe() {
  return request<{ user: AuthUser }>('/api/auth/me');
}

// --- Footprint ---
export function submitFootprint(input: FootprintInput) {
  return request<{ entry: FootprintEntry; breakdown: CategoryBreakdown; persona: PersonaInfo; percentile: number }>(
    '/api/footprint',
    { method: 'POST', body: JSON.stringify(input) }
  );
}

export function getFootprintHistory() {
  return request<{ entries: FootprintEntry[] }>('/api/footprint/history');
}

export function getLatestFootprint() {
  return request<{ entry: FootprintEntry | null; persona: PersonaInfo | null; percentile: number | null; trend: TrendResult }>(
    '/api/footprint/latest'
  );
}

// --- Insights ---
export function getRecommendations() {
  return request<{ persona?: PersonaInfo; recommendations: RecommendationAction[]; message?: string }>(
    '/api/insights/recommendations'
  );
}

// --- Actions ---
export function getActionCatalog() {
  return request<{ catalog: RecommendationAction[] }>('/api/actions/catalog');
}

export function completeAction(actionId: string) {
  return request<{ record: CompletedAction; totalSavingsKg: number }>('/api/actions/complete', {
    method: 'POST',
    body: JSON.stringify({ actionId })
  });
}

export function getCompletedActions() {
  return request<{ completed: CompletedAction[]; totalSavingsKg: number }>('/api/actions');
}
