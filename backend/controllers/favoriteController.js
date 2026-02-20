const pool = require('../config/database');

// 获取收藏列表
exports.getFavorites = async (req, res) => {
  try {
    const { userId, category } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少userId参数' });
    }
    
    let query = `
      SELECT f.*, h.name, h.address, h.city, h.stars, h.images, h.tags
      FROM favorites f
      LEFT JOIN hotels h ON f.hotel_id = h.id
      WHERE f.user_id = ?
    `;
    const params = [userId];
    
    if (category) {
      query += ' AND f.category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY f.create_time DESC';
    
    const [favorites] = await pool.query(query, params);
    
    // 格式化字段名（JSON字段已自动解析）
    const formattedFavorites = favorites.map(fav => ({
      ...fav,
      images: fav.images || [],
      tags: fav.tags || []
    }));
    
    res.json(formattedFavorites);
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 添加收藏
exports.addFavorite = async (req, res) => {
  try {
    const { userId, hotelId, category = 'general', note = '' } = req.body;
    
    if (!userId || !hotelId) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    // 检查是否已收藏
    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND hotel_id = ?',
      [userId, hotelId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: '已收藏该酒店' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO favorites (user_id, hotel_id, category, note) VALUES (?, ?, ?, ?)',
      [userId, hotelId, category, note]
    );
    
    res.json({
      success: true,
      favoriteId: result.insertId,
      message: '收藏成功'
    });
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 删除收藏
exports.removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM favorites WHERE id = ?', [id]);
    
    res.json({ success: true, message: '取消收藏成功' });
  } catch (error) {
    console.error('删除收藏失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 检查是否已收藏
exports.checkFavorite = async (req, res) => {
  try {
    const { userId, hotelId } = req.query;
    
    if (!userId || !hotelId) {
      return res.status(400).json({ error: '缺少必填参数' });
    }
    
    const [favorites] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND hotel_id = ?',
      [userId, hotelId]
    );
    
    res.json({
      isFavorited: favorites.length > 0,
      favoriteId: favorites.length > 0 ? favorites[0].id : null
    });
  } catch (error) {
    console.error('检查收藏失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 对比收藏的酒店
exports.compareHotels = async (req, res) => {
  try {
    const { hotelIds } = req.query;
    
    if (!hotelIds) {
      return res.status(400).json({ error: '缺少hotelIds参数' });
    }
    
    const ids = hotelIds.split(',').map(id => parseInt(id));
    
    if (ids.length < 2 || ids.length > 5) {
      return res.status(400).json({ error: '对比酒店数量应在2-5个之间' });
    }
    
    // 获取酒店基本信息
    const [hotels] = await pool.query(
      `SELECT id, name, address, city, stars, tags, images, description
       FROM hotels WHERE id IN (?)`,
      [ids]
    );
    
    // 获取每个酒店的评价统计
    const hotelsWithStats = await Promise.all(
      hotels.map(async (hotel) => {
        const [reviewStats] = await pool.query(
          `SELECT 
            COUNT(*) as reviewCount,
            AVG(overall_rating) as avgRating
           FROM reviews WHERE hotel_id = ?`,
          [hotel.id]
        );
        
        const [roomTypes] = await pool.query(
          `SELECT room_type, price FROM room_types WHERE hotelId = ? ORDER BY price ASC`,
          [hotel.id]
        );
        
        return {
          ...hotel,
          images: hotel.images || [],
          tags: hotel.tags || [],
          reviewCount: reviewStats[0].reviewCount,
          avgRating: reviewStats[0].avgRating ? parseFloat(reviewStats[0].avgRating).toFixed(2) : 0,
          minPrice: roomTypes.length > 0 ? roomTypes[0].price : 0,
          roomTypes: roomTypes.map(rt => ({ type: rt.room_type, price: rt.price }))
        };
      })
    );
    
    res.json(hotelsWithStats);
  } catch (error) {
    console.error('对比酒店失败:', error);
    res.status(500).json({ error: error.message });
  }
};
