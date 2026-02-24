const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// 商户权限验证中间件
const authenticateMerchant = [authMiddleware, requireRole('merchant')];

// 基础数据接口
router.get('/overview', authenticateMerchant, analyticsController.getMerchantOverview);
router.get('/trend', authenticateMerchant, analyticsController.getOrderTrend);
router.get('/room-ranking', authenticateMerchant, analyticsController.getRoomTypeRanking);

// AI增强接口
router.get('/ai/insights', authenticateMerchant, analyticsController.getAIInsights);
router.get('/ai/pricing', authenticateMerchant, analyticsController.getAIPricing);
router.get('/ai/alerts', authenticateMerchant, analyticsController.getAIAlerts);

module.exports = router;
