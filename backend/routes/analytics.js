const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/price-trends - 获取价格趋势
router.get('/price-trends', analyticsController.getPriceTrends);

// GET /api/analytics/hotel-dashboard/:hotelId - 获取酒店数据看板
router.get('/hotel-dashboard/:hotelId', analyticsController.getHotelDashboard);

// GET /api/analytics/review-trends/:hotelId - 获取评价趋势
router.get('/review-trends/:hotelId', analyticsController.getReviewTrends);

// GET /api/analytics/pricing-suggestions/:hotelId - 获取定价建议
router.get('/pricing-suggestions/:hotelId', analyticsController.getPricingSuggestions);

module.exports = router;
