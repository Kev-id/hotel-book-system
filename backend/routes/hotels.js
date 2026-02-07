const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// GET /api/hotels - 获取酒店列表
router.get('/', hotelController.getHotels);

// GET /api/hotels/:id - 获取酒店详情
router.get('/:id', hotelController.getHotelDetail);

// POST /api/hotels - 新增酒店
router.post('/', hotelController.addHotel);

// PATCH /api/hotels/:id - 更新酒店
router.patch('/:id', hotelController.updateHotel);

// DELETE /api/hotels/:id - 删除酒店
router.delete('/:id', hotelController.deleteHotel);

// GET /api/hotels/:id/room-types - 获取同名酒店的所有房型
router.get('/:id/room-types', hotelController.getHotelRoomTypes);

module.exports = router;

// GET /api/hotels/:id/room-types - 获取同名酒店的所有房型
router.get('/:id/room-types', hotelController.getHotelRoomTypes);

