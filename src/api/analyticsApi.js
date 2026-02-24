import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const analyticsApi = {
  getOverview: async (period = '30') => {
    const response = await axios.get(`${API_BASE_URL}/analytics/overview`, {
      params: { period },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getTrend: async (period = '30') => {
    const response = await axios.get(`${API_BASE_URL}/analytics/trend`, {
      params: { period },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getRoomRanking: async (period = '30') => {
    const response = await axios.get(`${API_BASE_URL}/analytics/room-ranking`, {
      params: { period },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getAIInsights: async (period = '30') => {
    const response = await axios.get(`${API_BASE_URL}/analytics/ai/insights`, {
      params: { period },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getAIPricing: async (period = '30') => {
    const response = await axios.get(`${API_BASE_URL}/analytics/ai/pricing`, {
      params: { period },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getAIAlerts: async (period = '30') => {
    const response = await axios.get(`${API_BASE_URL}/analytics/ai/alerts`, {
      params: { period },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

export default analyticsApi;
