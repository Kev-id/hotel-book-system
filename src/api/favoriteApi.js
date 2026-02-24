/**
 * Task13: 收藏对比 API
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,  // 增加到30秒
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => {
    return response.data.data || response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

const favoriteApi = {
  /**
   * 添加收藏
   * @param {Number} hotelId - 酒店ID
   * @returns {Promise}
   */
  addFavorite: (hotelId) => {
    return api.post('/favorites/add', { hotelId });
  },

  /**
   * 取消收藏
   * @param {Number} hotelId - 酒店ID
   * @returns {Promise}
   */
  removeFavorite: (hotelId) => {
    return api.delete(`/favorites/${hotelId}`);
  },

  /**
   * 获取收藏列表
   * @param {Object} params - 查询参数 { category }
   * @returns {Promise}
   */
  getFavorites: (params = {}) => {
    return api.get('/favorites/list', { params });
  },

  /**
   * 检查是否已收藏
   * @param {Number} hotelId - 酒店ID
   * @returns {Promise}
   */
  checkFavorite: (hotelId) => {
    return api.get(`/favorites/check/${hotelId}`);
  },

  /**
   * 获取AI推荐
   * @returns {Promise}
   */
  getAIRecommendations: () => {
    return api.get('/favorites/recommendations');
  },

  /**
   * AI智能对比
   * @param {Array} hotelIds - 酒店ID数组
   * @returns {Promise}
   */
  compareHotels: (hotelIds) => {
    return api.post('/favorites/compare', { hotelIds });
  },

  /**
   * 记录浏览历史
   * @param {Number} hotelId - 酒店ID
   * @param {Number} duration - 浏览时长（秒）
   * @returns {Promise}
   */
  recordBrowse: (hotelId, duration = 0) => {
    return api.post('/favorites/browse', { hotelId, duration });
  }
};

export default favoriteApi;
