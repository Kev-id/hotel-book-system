import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const aiApi = {
  // 获取评价摘要
  getReviewSummary: (hotelId, force = false) =>
    axios.get(`${API_BASE}/ai/review-summary/${hotelId}`, {
      params: { force }
    }).then(res => res.data),
  
  // 评价质量检测
  checkReviewQuality: (reviewData) =>
    axios.post(`${API_BASE}/ai/review-quality-check`, reviewData)
      .then(res => res.data),
  
  // 生成回复建议
  generateReplySuggestions: (data) =>
    axios.post(`${API_BASE}/ai/reply-suggestions`, data)
      .then(res => res.data),
  
  // 获取趋势分析
  getReviewTrend: (hotelId, days = 30) =>
    axios.get(`${API_BASE}/ai/review-trend/${hotelId}`, {
      params: { days }
    }).then(res => res.data)
};
