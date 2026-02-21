import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// 获取用户信息并添加到请求头
const getAuthHeaders = () => {
  const headers = {};
  
  // 方式1: x-user-info header (旧方式)
  const userStr = localStorage.getItem('hotelUser');
  if (userStr) {
    headers['x-user-info'] = userStr;
  }
  
  // 方式2: Bearer token (新方式)
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const orderApi = {
  // 获取订单列表
  async getOrders(params) {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`, { 
        params,
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('获取订单列表失败:', error);
      throw error;
    }
  },

  // 获取订单详情
  async getOrderDetail(orderId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('获取订单详情失败:', error);
      throw error;
    }
  },

  // 获取订单统计
  async getOrderStats(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/stats/summary`, {
        params,
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('获取订单统计失败:', error);
      throw error;
    }
  },

  // 创建订单
  async createOrder(orderData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('创建订单失败:', error);
      throw error;
    }
  },

  // 取消订单
  async cancelOrder(orderId, reason) {
    try {
      const response = await axios.post(`${API_BASE_URL}/orders/${orderId}/cancel`, 
        { reason },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('取消订单失败:', error);
      throw error;
    }
  },

  // 更新订单状态
  async updateOrderStatus(orderId, status, note) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, 
        { status, note, operator: 'merchant' },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('更新订单状态失败:', error);
      throw error;
    }
  }
};
