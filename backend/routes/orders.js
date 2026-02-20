const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET /api/orders - 获取订单列表（支持筛选）
router.get('/', orderController.getOrders);

// GET /api/orders/:id - 获取订单详情
router.get('/:id', orderController.getOrderDetail);

// POST /api/orders - 创建订单
router.post('/', orderController.createOrder);

// PATCH /api/orders/:id/status - 更新订单状态
router.patch('/:id/status', orderController.updateOrderStatus);

// POST /api/orders/:id/cancel - 取消订单
router.post('/:id/cancel', orderController.cancelOrder);

// GET /api/orders/stats/summary - 获取订单统计
router.get('/stats/summary', orderController.getOrderStats);

module.exports = router;
