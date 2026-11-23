const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Core client fetch wrapper for interacting with the MW REST API.
 * Automatically handles JSON parsing, PDF blob streaming, and session cookie inclusion.
 * @param {string} endpoint - API route path or absolute URL
 * @param {RequestInit} [options] - Standard Fetch options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // If body is FormData, remove Content-Type to allow browser to set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    credentials: 'include' // Always include session cookies
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get('content-type') || '';
    
    if (contentType.includes('application/pdf')) {
      if (!res.ok) throw new Error('Failed to download PDF document');
      return res.blob();
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

