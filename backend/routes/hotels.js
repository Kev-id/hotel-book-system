const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const upload = require('../middleware/upload');

// GET /api/hotels - 获取酒店列表
router.get('/', hotelController.getHotels);

// GET /api/hotels/deleted/list - 获取已删除的酒店列表
router.get('/deleted/list', hotelController.getDeletedHotels);

// GET /api/hotels/:id - 获取酒店详情
router.get('/:id', hotelController.getHotelDetail);

// GET /api/hotels/:id/room-types - 获取同名酒店的所有房型
router.get('/:id/room-types', hotelController.getHotelRoomTypes);

// POST /api/hotels - 新增酒店（支持多图片上传）
router.post('/', upload.array('images', 10), hotelController.addHotel);

// PATCH /api/hotels/:id - 更新酒店
router.patch('/:id', hotelController.updateHotel);

// DELETE /api/hotels/:id - 软删除酒店（下线）
router.delete('/:id', hotelController.deleteHotel);

// POST /api/hotels/:id/restore - 恢复已删除的酒店
router.post('/:id/restore', hotelController.restoreHotel);

// DELETE /api/hotels/:id/images - 删除酒店图片
router.delete('/:id/images', hotelController.deleteHotelImage);

module.exports = router;