const express = require('express');
const router = express.Router();
const aiReviewController = require('../controllers/aiReviewController');
const { smartRateLimiter } = require('../middleware/aiRateLimit');

// ✅ P1-4修复：使用智能限流器，根据用户角色自动分级
// AI评价相关路由（需要限流）

// GET /api/ai/review-summary/:hotelId - 获取评价摘要
router.get('/review-summary/:hotelId', smartRateLimiter, aiReviewController.getReviewSummary);

// POST /api/ai/review-quality-check - 评价质量检测
router.post('/review-quality-check', smartRateLimiter, aiReviewController.checkReviewQuality);

// POST /api/ai/reply-suggestions - 生成回复建议
router.post('/reply-suggestions', smartRateLimiter, aiReviewController.generateReplySuggestions);

// GET /api/ai/review-trend/:hotelId - 获取趋势分析
router.get('/review-trend/:hotelId', smartRateLimiter, aiReviewController.getReviewTrend);

module.exports = router;
