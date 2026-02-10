export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  let payload = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || payload || 'Request failed';
    throw new Error(message);
  }

  return payload;
}

export function getApiBase(kind) {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const resolveEnvBase = (value) => {
    if (!value) {
      return null;
    }

    if (!isLocalhost) {
      try {
        const parsed = new URL(value);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          return null;
        }
      } catch {
        // Allow relative URLs (e.g. /socios) when not localhost.
      }
    }

    return value;
  };

  if (kind === 'socios') {
    return (
      resolveEnvBase(import.meta.env.VITE_API_SOCIOS) ||
      (isLocalhost ? 'http://localhost:8080/api/socios' : `${window.location.origin}/socios`)
    );
  }

  if (kind === 'cuentas') {
    return (
      resolveEnvBase(import.meta.env.VITE_API_CUENTAS) ||
      (isLocalhost ? 'http://localhost:3000/cuentas' : `${window.location.origin}/cuentas`)
    );
  }

  if (kind === 'cuentas-validacion') {
    return (
      resolveEnvBase(import.meta.env.VITE_API_CUENTAS_VALIDACION) ||
      (isLocalhost
        ? 'http://localhost:3000/api/cuentas/validaciones'
        : `${window.location.origin}/cuentas/validaciones`)
    );
  }

  throw new Error(`Unknown API base kind: ${kind}`);
}
