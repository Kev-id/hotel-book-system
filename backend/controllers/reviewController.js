const pool = require('../config/database');

// 获取评价列表
exports.getReviews = async (req, res) => {
  try {
    const { hotelId, userId, sentiment, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT r.*, h.name as hotelName, u.username
      FROM reviews r
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (hotelId) {
      query += ' AND r.hotel_id = ?';
      params.push(hotelId);
    }
    
    if (userId) {
      query += ' AND r.user_id = ?';
      params.push(userId);
    }
    
    if (sentiment) {
      query += ' AND r.sentiment = ?';
      params.push(sentiment);
    }
    
    query += ' ORDER BY r.create_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [reviews] = await pool.query(query, params);
    
    // 格式化字段名（JSON字段已自动解析）
    const formattedReviews = reviews.map(review => ({
      ...review,
      dimensions: review.dimensions || {},
      images: review.images || [],
      tags: review.tags || [],
      merchantReply: review.merchant_reply
    }));
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE 1=1';
    const countParams = [];
    if (hotelId) {
      countQuery += ' AND hotel_id = ?';
      countParams.push(hotelId);
    }
    if (userId) {
      countQuery += ' AND user_id = ?';
      countParams.push(userId);
    }
    if (sentiment) {
      countQuery += ' AND sentiment = ?';
      countParams.push(sentiment);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    
    res.json({
      reviews: formattedReviews,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取评价列表失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取评价详情
exports.getReviewDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [reviews] = await pool.query(`
      SELECT r.*, h.name as hotelName, h.address, u.username
      FROM reviews r
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);
    
    if (reviews.length === 0) {
      return res.status(404).json({ error: '评价不存在' });
    }
    
    const review = {
      ...reviews[0],
      dimensions: reviews[0].dimensions || {},
      images: reviews[0].images || [],
      tags: reviews[0].tags || [],
      merchantReply: reviews[0].merchant_reply
    };
    
    res.json(review);
  } catch (error) {
    console.error('获取评价详情失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 创建评价
exports.createReview = async (req, res) => {
  try {
    const {
      userId,
      hotelId,
      orderId,
      overallRating,
      dimensions,
      content,
      images = [],
      tags = []
    } = req.body;
    
    // 验证必填字段
    if (!userId || !hotelId || !orderId || !overallRating || !content) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    // 简单的情感分析
    let sentiment = 'neutral';
    if (overallRating >= 4) sentiment = 'positive';
    else if (overallRating <= 2) sentiment = 'negative';
    
    const [result] = await pool.query(`
      INSERT INTO reviews (
        user_id, hotel_id, order_id, overall_rating, dimensions,
        content, images, tags, sentiment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, hotelId, orderId, overallRating,
      JSON.stringify(dimensions || {}),
      content,
      JSON.stringify(images),
      JSON.stringify(tags),
      sentiment
    ]);
    
    res.json({
      success: true,
      reviewId: result.insertId,
      message: '评价发布成功'
    });
  } catch (error) {
    console.error('创建评价失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 点赞评价
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'UPDATE reviews SET helpful = helpful + 1 WHERE id = ?',
      [id]
    );
    
    res.json({ success: true, message: '点赞成功' });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 举报评价
exports.reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    await pool.query(
      'UPDATE reviews SET reported = reported + 1 WHERE id = ?',
      [id]
    );
    
    res.json({ success: true, message: '举报成功' });
  } catch (error) {
    console.error('举报失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 商家回复
exports.merchantReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, merchantId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: '回复内容不能为空' });
    }
    
    const reply = {
      content,
      merchantId,
      time: new Date().toISOString()
    };
    
    await pool.query(
      'UPDATE reviews SET merchant_reply = ? WHERE id = ?',
      [JSON.stringify(reply), id]
    );
    
    res.json({ success: true, message: '回复成功' });
  } catch (error) {
    console.error('商家回复失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取酒店评价统计
exports.getHotelReviewStats = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        AVG(overall_rating) as avgRating,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative,
        SUM(CASE WHEN overall_rating = 5 THEN 1 ELSE 0 END) as rating5,
        SUM(CASE WHEN overall_rating = 4 THEN 1 ELSE 0 END) as rating4,
        SUM(CASE WHEN overall_rating = 3 THEN 1 ELSE 0 END) as rating3,
        SUM(CASE WHEN overall_rating = 2 THEN 1 ELSE 0 END) as rating2,
        SUM(CASE WHEN overall_rating = 1 THEN 1 ELSE 0 END) as rating1
      FROM reviews
      WHERE hotel_id = ?
    `, [hotelId]);
    
    // 获取维度平均分
    const [reviews] = await pool.query(
      'SELECT dimensions FROM reviews WHERE hotel_id = ?',
      [hotelId]
    );
    
    const dimensionStats = {
      cleanliness: 0,
      service: 0,
      facilities: 0,
      location: 0,
      valueForMoney: 0
    };
    
    let count = 0;
    reviews.forEach(review => {
      if (review.dimensions) {
        const dims = review.dimensions;
        Object.keys(dimensionStats).forEach(key => {
          if (dims[key]) {
            dimensionStats[key] += dims[key];
            count++;
          }
        });
      }
    });
    
    if (count > 0) {
      Object.keys(dimensionStats).forEach(key => {
        dimensionStats[key] = (dimensionStats[key] / reviews.length).toFixed(2);
      });
    }
    
    res.json({
      ...stats[0],
      avgRating: stats[0].avgRating ? parseFloat(stats[0].avgRating).toFixed(2) : 0,
      dimensions: dimensionStats
    });
  } catch (error) {
    console.error('获取评价统计失败:', error);
    res.status(500).json({ error: error.message });
  }
};
