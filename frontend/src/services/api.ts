import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

console.log('API_URL:', API_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const reportService = {
  uploadReport: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  summarize: async (text: string, maxLength: number = 200) => {
    try {
      console.log('Calling /summarize with text length:', text.length);
      const response = await api.post('/summarize', { 
        report_id: 'current', 
        text, 
        max_length: maxLength 
      });
      console.log('Summarize response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Summarize error:', error);
      throw error;
    }
  },

  explain: async (highlightedText: string, context: string = '') => {
    try {
      console.log('Calling /explain with text:', highlightedText.substring(0, 50));
      const response = await api.post('/explain', {
        report_id: 'current',
        highlighted_text: highlightedText,
        context,
      });
      console.log('Explain response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Explain error:', error);
      throw error;
    }
  },

  askQuestion: async (question: string, reportText?: string) => {
    try {
      console.log('Calling /ask-question with full context');
      const response = await api.post('/ask-question', {
        question: question,
        report_text: reportText || ''
      });
      console.log('Question response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ask question error:', error);
      throw error;
    }
  },

  explainEquation: async (equation: string, context: string = '') => {
    try {
      const response = await api.post('/explain-equation', { 
        equation, 
        context 
      });
      return response.data;
    } catch (error) {
      console.error('Explain equation error:', error);
      throw error;
    }
  },

  extractDefinitions: async (text: string) => {
    try {
      console.log('Calling /extract-definitions with text length:', text.length);
      const response = await api.post('/extract-definitions', { text });
      console.log('Definitions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Extract definitions error:', error);
      throw error;
    }
  },

  convertUnits: async (value: number, fromUnit: string, toUnit: string) => {
    try {
      const response = await api.post('/convert-units', {
        value,
        from_unit: fromUnit,
        to_unit: toUnit,
      });
      return response.data;
    } catch (error) {
      console.error('Convert units error:', error);
      throw error;
    }
  },

  getConversions: async () => {
    try {
      const response = await api.get('/conversions');
      return response.data;
    } catch (error) {
      console.error('Get conversions error:', error);
      throw error;
    }
  },

  detectEquations: async (text: string) => {
    try {
      console.log('Calling /detect-equations with text length:', text.length);
      const response = await api.post('/detect-equations', { text });
      console.log('Detected equations:', response.data);
      return response.data;
    } catch (error) {
      console.error('Detect equations error:', error);
      throw error;
    }
  },
};

export default api;
