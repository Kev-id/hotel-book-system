const pool = require('../config/database');

// 获取酒店列表
exports.getHotels = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    let query = 'SELECT * FROM hotels WHERE 1=1';
    const params = [];

    // 构造查询条件
    if (req.query.city) {
      query += ' AND city = ?';
      params.push(req.query.city);
    }
    if (req.query.price_gte) {
      query += ' AND price >= ?';
      params.push(Number(req.query.price_gte));
    }
    if (req.query.price_lte) {
      query += ' AND price <= ?';
      params.push(Number(req.query.price_lte));
    }
    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }
    if (req.query.stars) {
      query += ' AND stars = ?';
      params.push(Number(req.query.stars));
    }

    const [rows] = await conn.query(query, params);
    conn.release();
    
    // 解析 JSON 字段并处理标签筛选
    let parsedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : []
    }));

    // 如果提供了标签过滤，进行客户端过滤
    if (req.query.tag) {
      const selectedTag = req.query.tag;
      parsedRows = parsedRows.filter(hotel => 
        hotel.tags && hotel.tags.includes(selectedTag)
      );
    }
    
    res.json(parsedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个酒店详情
exports.getHotelDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM hotels WHERE id = ?', [id]);
    conn.release();

    if (rows.length > 0) {
      const hotel = rows[0];
      // 解析 JSON 字段
      hotel.tags = hotel.tags ? (typeof hotel.tags === 'string' ? JSON.parse(hotel.tags) : hotel.tags) : [];
      res.json(hotel);
    } else {
      res.status(404).json(null);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 新增酒店
exports.addHotel = async (req, res) => {
  try {
    const { name, address, price, city, status, merchantId, openingDate, stars, roomType, tags, description } = req.body;
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO hotels (name, address, price, city, status, merchantId, openingDate, stars, roomType, tags, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, address, price, city, status || 'pending', merchantId, openingDate, stars, roomType, JSON.stringify(tags || []), description || '']
    );
    conn.release();

    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 更新酒店（审核）
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'UPDATE hotels SET status = ?, rejectReason = ? WHERE id = ?',
      [status, rejectReason || null, id]
    );
    conn.release();

    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '酒店不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除酒店
exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [result] = await conn.query('DELETE FROM hotels WHERE id = ?', [id]);
    conn.release();

    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '酒店不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
