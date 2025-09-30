/**
 * API Service - Handles all backend communication
 * Centralizes API calls with proper error handling
 */

import axios from 'axios';

// Base API URL - update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Question {
  id: string;
  text: string;
  category: string;
  multiSelect: boolean;
  maxSelections?: number;
  options: {
    value: string;
    text: string;
    scores: Record<string, number>;
  }[];
}

export interface LifestyleProfile {
  family_friendly: number;
  adventure: number;
  eco_conscious: number;
  luxury: number;
  performance: number;
  budget_conscious: number;
  city_driving: number;
  commuter: number;
  tech_enthusiast: number;
  safety_focused: number;
}

export interface Car {
  id: string;
  basic_info: {
    make: string;
    model: string;
    year: number;
    trim: string;
    body_type: string;
    msrp: number;
    image_url: string;
  };
  specifications: {
    engine: string;
    horsepower: number;
    mpg_combined: number;
    seating_capacity: number;
    [key: string]: any;
  };
  lifestyle_scores: LifestyleProfile;
  features: {
    safety: string[];
    technology: string[];
    comfort: string[];
    entertainment: string[];
  };
  pros: string[];
  cons: string[];
  match_score?: number;
}

/**
 * Check if API is healthy and Ollama is connected
 */
export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

/**
 * Get personality test questions
 */
export const getPersonalityQuestions = async (): Promise<Question[]> => {
  const response = await api.get('/api/personality/questions');
  return response.data.questions;
};

/**
 * Analyze personality test answers and create session
 */
export const analyzePersonality = async (answers: Record<string, string[]>) => {
  const response = await api.post('/api/personality/analyze', { answers });
  return response.data;
};

/**
 * Send message to AI chat and get recommendations
 */
export const sendChatMessage = async (
  sessionId: string,
  message: string,
  budget?: number
) => {
  try {
    const response = await api.post('/api/chat', {
      session_id: sessionId,
      message,
      budget,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The AI is taking too long to respond. Please try again.');
    } else if (!error.response) {
      throw new Error('Cannot connect to backend. Make sure it\'s running on port 5000.');
    }
    throw error;
  }
};

/**
 * Compare multiple cars
 */
export const compareCars = async (carIds: string[]) => {
  const response = await api.post('/api/cars/compare', { car_ids: carIds });
  return response.data;
};

/**
 * Get cost estimate for a car
 */
export const getCostEstimate = async (
  carId: string,
  tradeInValue: number = 0,
  downPayment: number = 0,
  loanTerm: number = 60
) => {
  const response = await api.post(`/api/cars/${carId}/estimate`, {
    trade_in_value: tradeInValue,
    down_payment: downPayment,
    loan_term: loanTerm,
  });
  return response.data;
};

export default api;
