/**
 * Task13: 收藏对比控制器
 * 处理收藏、推荐、对比、浏览历史等功能
 */

const db = require('../config/database');
const recommendationService = require('../services/ai/recommendation');
const { getCachedComparison, getCachedRecommendation, clearUserCache } = require('../middleware/favoriteCache');

/**
 * 添加收藏（带AI分类，清除缓存）
 */
exports.addFavorite = async (req, res) => {
  const { hotelId } = req.body;
  const userId = req.user.id;

  try {
    // 1. 获取酒店信息
    const [hotels] = await db.query('SELECT * FROM hotels WHERE id = ?', [hotelId]);
    if (hotels.length === 0) {
      return res.status(404).json({ error: '酒店不存在' });
    }
    const hotel = hotels[0];

    // 2. AI自动分类（亮点3）- 添加降级方案
    let aiCategory = {
      category: '未分类',
      confidence: 0,
      reason: ''
    };
    
    try {
      aiCategory = await recommendationService.categorizeHotel(hotel);
    } catch (aiError) {
      console.error('AI分类失败，使用默认分类:', aiError.message);
      // AI失败时使用简单规则分类
      if (hotel.price < 300) {
        aiCategory = { category: '💰 性价比之选', confidence: 0.5, reason: '价格实惠' };
      } else if (hotel.price > 1000) {
        aiCategory = { category: '🏢 商务出行', confidence: 0.5, reason: '高端酒店' };
      } else {
        aiCategory = { category: '未分类', confidence: 0, reason: '' };
      }
    }

    // 3. 添加收藏
    await db.query(
      'INSERT INTO favorites (user_id, hotel_id, category, note) VALUES (?, ?, ?, ?)',
      [userId, hotelId, aiCategory.category, aiCategory.reason]
    );

    // 4. 清除用户推荐缓存
    try {
      clearUserCache(userId);
    } catch (cacheError) {
      console.error('清除缓存失败:', cacheError.message);
      // 缓存清除失败不影响主流程
    }

    res.json({
      success: true,
      message: '收藏成功',
      category: aiCategory.category,
      reason: aiCategory.reason
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: '已收藏该酒店' });
    }
    console.error('添加收藏失败:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 取消收藏（清除缓存）
 */
exports.removeFavorite = async (req, res) => {
  const { hotelId } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND hotel_id = ?',
      [userId, hotelId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: '收藏不存在' });
    }

    // 清除用户推荐缓存
    clearUserCache(userId);

    res.json({ success: true, message: '取消收藏成功' });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 获取收藏列表（按分类）
 */
exports.getFavorites = async (req, res) => {
  const userId = req.user.id;
  const { category } = req.query;

  try {
    let query = `
      SELECT f.*, h.name, h.address, h.price, h.rating, h.images, h.facilities
      FROM favorites f
      JOIN hotels h ON f.hotel_id = h.id
      WHERE f.user_id = ?
    `;
    const params = [userId];

    if (category && category !== '全部') {
      query += ' AND f.category = ?';
      params.push(category);
    }

    query += ' ORDER BY f.create_time DESC';

    const [favorites] = await db.query(query, params);

    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * AI智能推荐收藏（亮点1，带缓存）
 */
exports.getAIRecommendations = async (req, res) => {
  const userId = req.user.id;

  try {
    // 使用缓存
    const result = await getCachedRecommendation(userId, async () => {
      // 1. 获取用户画像
      const userProfile = await getUserProfile(userId);

      // 2. 获取候选酒店（排除已收藏的）
      const [candidateHotels] = await db.query(`
        SELECT h.* FROM hotels h
        WHERE h.id NOT IN (SELECT hotel_id FROM favorites WHERE user_id = ?)
        AND h.status = 'approved'
        LIMIT 20
      `, [userId]);

      if (candidateHotels.length === 0) {
        return [];
      }

      // 3. AI推荐（带类型校验）
      const recommendations = await recommendationService.getPersonalizedRecommendations(
        userProfile,
        candidateHotels
      );

      // 类型校验：确保返回数组
      if (!Array.isArray(recommendations)) {
        console.warn('AI推荐返回非数组:', recommendations);
        return [];
      }

      // 4. 获取推荐酒店的完整信息（安全的SQL参数化）
      const hotelIds = recommendations.map(r => r.hotelId);
      if (hotelIds.length === 0) {
        return [];
      }
      
      const placeholders = hotelIds.map(() => '?').join(',');
      const [hotels] = await db.query(
        `SELECT * FROM hotels WHERE id IN (${placeholders})`,
        hotelIds
      );

      // 5. 合并推荐理由
      return hotels.map(hotel => {
        const rec = recommendations.find(r => r.hotelId === hotel.id);
        return {
          ...hotel,
          aiReason: rec?.reason || ''
        };
      });
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取AI推荐失败:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 获取用户画像
 */
async function getUserProfile(userId) {
  // 浏览过的酒店
  const [browsed] = await db.query(`
    SELECT h.name, h.price, h.rating, h.address
    FROM browse_history bh
    JOIN hotels h ON bh.hotel_id = h.id
    WHERE bh.user_id = ?
    ORDER BY bh.browse_time DESC
    LIMIT 10
  `, [userId]);

  // 收藏的酒店
  const [favorited] = await db.query(`
    SELECT h.name, h.price, h.rating, h.address, f.category
    FROM favorites f
    JOIN hotels h ON f.hotel_id = h.id
    WHERE f.user_id = ?
  `, [userId]);

  // 预订过的酒店
  const [booked] = await db.query(`
    SELECT h.name, h.price, h.rating, h.address
    FROM orders o
    JOIN hotels h ON o.hotel_id = h.id
    WHERE o.user_id = ?
  `, [userId]);

  return {
    browsedHotels: browsed,
    favoritedHotels: favorited,
    bookedHotels: booked
  };
}

/**
 * AI智能对比分析（亮点2，带缓存）
 */
exports.compareHotels = async (req, res) => {
  const { hotelIds } = req.body;  // [1, 2, 3]

  try {
    // 1. 参数验证
    if (!hotelIds || hotelIds.length < 2) {
      return res.status(400).json({ error: '至少需要2个酒店进行对比' });
    }

    // 2. 获取酒店信息（安全的SQL参数化）
    const placeholders = hotelIds.map(() => '?').join(',');
    const [hotels] = await db.query(
      `SELECT * FROM hotels WHERE id IN (${placeholders})`,
      hotelIds
    );

    if (hotels.length < 2) {
      return res.status(400).json({ error: '至少需要2个有效酒店进行对比' });
    }

    // 3. AI对比分析（使用缓存）
    const analysis = await getCachedComparison(hotelIds, () =>
      recommendationService.compareHotels(hotels)
    );

    res.json({
      success: true,
      hotels,
      analysis
    });
  } catch (error) {
    console.error('对比酒店失败:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 记录浏览历史（限制数量，防止数据膨胀）
 */
exports.recordBrowse = async (req, res) => {
  const { hotelId, duration } = req.body;
  const userId = req.user.id;

  try {
    // 检查24小时内是否已记录同一酒店
    const [existing] = await db.query(
      `SELECT id FROM browse_history 
       WHERE user_id = ? AND hotel_id = ? 
       AND browse_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [userId, hotelId]
    );

    if (existing.length === 0) {
      // 插入新记录
      await db.query(
        'INSERT INTO browse_history (user_id, hotel_id, duration) VALUES (?, ?, ?)',
        [userId, hotelId, duration || 0]
      );

      // 限制每个用户最多保留50条记录（兼容性更好的写法）
      // 先查询需要删除的ID
      const [toDelete] = await db.query(`
        SELECT id FROM browse_history 
        WHERE user_id = ? 
        ORDER BY browse_time DESC 
        LIMIT 50, 1000
      `, [userId]);

      if (toDelete.length > 0) {
        const ids = toDelete.map(r => r.id);
        const placeholders = ids.map(() => '?').join(',');
        await db.query(
          `DELETE FROM browse_history WHERE id IN (${placeholders})`,
          ids
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('记录浏览历史失败:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 检查是否已收藏
 */
exports.checkFavorite = async (req, res) => {
  const { hotelId } = req.params;
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND hotel_id = ?',
      [userId, hotelId]
    );

    res.json({
      success: true,
      isFavorited: rows.length > 0
    });
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    res.status(500).json({ error: error.message });
  }
};
