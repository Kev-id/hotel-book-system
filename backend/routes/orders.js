const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

// 所有订单相关的路由都需要认证
// GET /api/orders - 获取订单列表（支持筛选）
router.get('/', authMiddleware, orderController.getOrders);

// GET /api/orders/stats/summary - 获取订单统计（必须在 /:id 之前）
router.get('/stats/summary', authMiddleware, orderController.getOrderStats);

// GET /api/orders/:id - 获取订单详情
router.get('/:id', authMiddleware, orderController.getOrderDetail);

// POST /api/orders - 创建订单
router.post('/', authMiddleware, orderController.createOrder);

// PATCH /api/orders/:id/status - 更新订单状态
router.patch('/:id/status', authMiddleware, orderController.updateOrderStatus);

// POST /api/orders/:id/cancel - 取消订单
router.post('/:id/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;
