const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// GET /api/reviews - 获取评价列表
router.get('/', reviewController.getReviews);

// GET /api/reviews/:id - 获取评价详情
router.get('/:id', reviewController.getReviewDetail);

// POST /api/reviews - 创建评价
router.post('/', reviewController.createReview);

// POST /api/reviews/:id/helpful - 点赞评价
router.post('/:id/helpful', reviewController.markHelpful);

// POST /api/reviews/:id/report - 举报评价
router.post('/:id/report', reviewController.reportReview);

// POST /api/reviews/:id/reply - 商家回复
router.post('/:id/reply', reviewController.merchantReply);

// GET /api/reviews/stats/hotel/:hotelId - 获取酒店评价统计
router.get('/stats/hotel/:hotelId', reviewController.getHotelReviewStats);

module.exports = router;
