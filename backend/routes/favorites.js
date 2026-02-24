/**
 * Task13: 收藏对比路由
 * 支持收藏管理、AI推荐、智能对比、浏览历史
 */

const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authMiddleware } = require('../middleware/auth');

// 所有路由都需要登录
router.use(authMiddleware);

// 收藏管理
router.post('/add', favoriteController.addFavorite);
router.delete('/:hotelId', favoriteController.removeFavorite);
router.get('/list', favoriteController.getFavorites);
router.get('/check/:hotelId', favoriteController.checkFavorite);

// AI功能
router.get('/recommendations', favoriteController.getAIRecommendations);
router.post('/compare', favoriteController.compareHotels);

// 浏览历史
router.post('/browse', favoriteController.recordBrowse);

module.exports = router;
