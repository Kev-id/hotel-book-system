const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

// GET /api/favorites - 获取收藏列表
router.get('/', favoriteController.getFavorites);

// POST /api/favorites - 添加收藏
router.post('/', favoriteController.addFavorite);

// DELETE /api/favorites/:id - 删除收藏
router.delete('/:id', favoriteController.removeFavorite);

// GET /api/favorites/check - 检查是否已收藏
router.get('/check', favoriteController.checkFavorite);

// GET /api/favorites/compare - 对比收藏的酒店
router.get('/compare', favoriteController.compareHotels);

module.exports = router;
