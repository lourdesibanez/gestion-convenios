import { tokenStorage } from './tokenStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const REQUEST_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await tokenStorage.get();

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión.', 0);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(messageFor(response.status, data), response.status, data.errors);
  }

  return data as T;
}

function messageFor(status: number, data: { message?: string }): string {
  if (status === 429) return 'Demasiados intentos. Esperá un minuto y volvé a probar.';
  if (status >= 500) return 'Ocurrió un error en el servidor. Intentá más tarde.';
  return data.message ?? 'Ocurrió un error inesperado.';
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
};
