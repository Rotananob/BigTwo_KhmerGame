/**
 * API and Backend WebSocket Configuration for Production Hosting (Vercel + Render)
 */
export const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/+$/, '');

export const getApiUrl = (endpoint: string): string => {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${SERVER_URL}${clean}`;
};
