import axios from 'axios';

// Turn any error thrown by an API call into a short, user-friendly sentence.
// Handles cancellation, timeouts, HTTP status codes, and network problems.
export function describeApiError(err: unknown, action = 'request'): string {
  if (axios.isCancel(err)) {
    return `${capitalize(action)} cancelled.`;
  }
  if (axios.isAxiosError(err)) {
    if (err.code === 'ERR_CANCELED') return `${capitalize(action)} cancelled.`;
    if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message)) {
      return `The ${action} took too long and timed out. Please try again.`;
    }
    if (err.response) {
      const status = err.response.status;
      const detail =
        (err.response.data as any)?.detail ||
        (err.response.data as any)?.message;
      if (status === 400) return detail || 'Invalid request.';
      if (status === 401 || status === 403) return 'Not authorized.';
      if (status === 404) return 'The server could not find what you asked for.';
      if (status === 413) return 'The file is too large to upload.';
      if (status === 429) return 'Too many requests — please wait a moment and try again.';
      if (status === 502 || status === 503 || status === 504) {
        return 'The server is temporarily unavailable. Please try again shortly.';
      }
      if (status >= 500) {
        return detail
          ? `Server error while handling the ${action}: ${detail}.`
          : `Server error while handling the ${action}. Please try again.`;
      }
      return `${capitalize(action)} failed (HTTP ${status})${detail ? `: ${detail}` : ''}.`;
    }
    if (err.request) {
      return `Could not reach the server while sending the ${action}. Check your connection.`;
    }
  }
  if (err instanceof Error) return err.message || `Failed to complete ${action}.`;
  return `Failed to complete ${action}.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function isCancel(err: unknown): boolean {
  if (axios.isCancel(err)) return true;
  if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return true;
  return false;
}
