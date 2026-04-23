import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Origin without the `/api` suffix — used for static resources served by the
// backend (e.g. `/api/pdf/<id>` returned in `reportData.file_path`).
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('API_URL:', API_URL);
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60_000,
});

api.interceptors.response.use(
  r => r,
  error => {
    if (!axios.isCancel(error) && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

// Ask-Anything: cap the report text we send to avoid runaway token usage.
// ~60k chars ≈ ~15k tokens which sits comfortably under most model limits.
const MAX_CONTEXT_CHARS = 60_000;

export function clampContext(text: string, max: number = MAX_CONTEXT_CHARS): string {
  if (!text) return '';
  if (text.length <= max) return text;
  // Keep the beginning and the end — the start usually has the abstract,
  // the end often has conclusions. We drop the middle with a marker so the
  // model knows content was elided.
  const head = text.slice(0, Math.floor(max * 0.65));
  const tail = text.slice(-Math.floor(max * 0.3));
  return `${head}\n\n[…content trimmed to fit context…]\n\n${tail}`;
}

type ReqOpts = { signal?: AbortSignal };

export const reportService = {
  uploadReport: async (
    file: File,
    onProgress?: (percent: number) => void,
    opts: ReqOpts = {}
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    const cfg: AxiosRequestConfig = {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT_MS,
      signal: opts.signal,
      onUploadProgress: evt => {
        if (onProgress && evt.total) {
          const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
          onProgress(pct);
        }
      },
    };
    const response = await api.post('/upload', formData, cfg);
    if (onProgress) onProgress(100);
    return response.data;
  },

  summarize: async (text: string, maxLength: number = 200, opts: ReqOpts = {}) => {
    const response = await api.post(
      '/summarize',
      { report_id: 'current', text, max_length: maxLength },
      { signal: opts.signal }
    );
    return response.data;
  },

  explain: async (highlightedText: string, context: string = '', opts: ReqOpts = {}) => {
    const response = await api.post(
      '/explain',
      { report_id: 'current', highlighted_text: highlightedText, context },
      { signal: opts.signal }
    );
    return response.data;
  },

  askQuestion: async (question: string, reportText?: string, opts: ReqOpts = {}) => {
    const response = await api.post(
      '/ask-question',
      { question, report_text: clampContext(reportText || '') },
      { signal: opts.signal }
    );
    return response.data;
  },

  explainEquation: async (equation: string, context: string = '', opts: ReqOpts = {}) => {
    const response = await api.post(
      '/explain-equation',
      { equation, context },
      { signal: opts.signal }
    );
    return response.data;
  },

  extractDefinitions: async (text: string, opts: ReqOpts = {}) => {
    const response = await api.post('/extract-definitions', { text }, { signal: opts.signal });
    return response.data;
  },

  convertUnits: async (
    value: number,
    fromUnit: string,
    toUnit: string,
    opts: ReqOpts = {}
  ) => {
    const response = await api.post(
      '/convert-units',
      { value, from_unit: fromUnit, to_unit: toUnit },
      { signal: opts.signal }
    );
    return response.data;
  },

  getConversions: async (opts: ReqOpts = {}) => {
    const response = await api.get('/conversions', { signal: opts.signal });
    return response.data;
  },

  detectEquations: async (text: string, opts: ReqOpts = {}) => {
    const response = await api.post('/detect-equations', { text }, { signal: opts.signal });
    return response.data;
  },
};

export default api;
