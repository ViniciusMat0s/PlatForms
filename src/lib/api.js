const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const token = window.localStorage.getItem('forms-platform.token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.error || 'Falha na requisição.');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  window.localStorage.setItem('forms-platform.token', data.token);
  return data;
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' });
  } finally {
    window.localStorage.removeItem('forms-platform.token');
  }
}

export async function getCurrentUser() {
  const data = await request('/auth/me');
  return data.user;
}

export async function getState() {
  return request('/state');
}

export async function getQuestionnaires() {
  return request('/questionnaires');
}

export async function createResponse(response) {
  return request('/responses', {
    method: 'POST',
    body: JSON.stringify(response),
  });
}

export async function getSummary() {
  return request('/reports/summary');
}
