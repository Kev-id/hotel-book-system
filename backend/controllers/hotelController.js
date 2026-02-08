const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

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
    
    // 解析 JSON 字段并处理标签筛选（支持单个、重复或逗号分隔的 tag 参数）
    let parsedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
      images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : []
    }));

    // 如果提供了标签过滤，进行过滤（匹配任意一个所选标签）
    if (req.query.tag) {
      let tagsFilter = [];
      if (Array.isArray(req.query.tag)) {
        tagsFilter = req.query.tag;
      } else {
        tagsFilter = String(req.query.tag).split(',').map(t => t.trim()).filter(Boolean);
      }

      if (tagsFilter.length > 0) {
        // 要求酒店包含所有选中标签（AND 逻辑）
        parsedRows = parsedRows.filter(hotel =>
          hotel.tags && tagsFilter.every(t => hotel.tags.includes(t))
        );
      }
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
      hotel.images = hotel.images ? (typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images) : [];
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
    
    // 处理上传的图片
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/hotels/${file.filename}`);
    }
    
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO hotels (name, address, price, city, status, merchantId, openingDate, stars, roomType, tags, description, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, address, price, city, status || 'pending', merchantId, openingDate, stars, roomType, JSON.stringify(tags || []), description || '', JSON.stringify(images)]
    );
    conn.release();

    res.json({ id: result.insertId, ...req.body, images });
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

// 获取同名酒店的所有房型
exports.getHotelRoomTypes = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    
    // 先获取当前酒店信息
    const [currentHotel] = await conn.query('SELECT name FROM hotels WHERE id = ?', [id]);
    
    if (currentHotel.length === 0) {
      conn.release();
      return res.status(404).json({ error: '酒店不存在' });
    }
    
    const hotelName = currentHotel[0].name;
    
    // 获取同名的所有酒店（不同房型）
    const [rows] = await conn.query(
      'SELECT * FROM hotels WHERE name = ? AND status = ? ORDER BY price ASC',
      [hotelName, 'published']
    );
    conn.release();
    
    // 解析 JSON 字段
    const parsedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : []
    }));
    
    res.json(parsedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取同名酒店的所有房型
exports.getHotelRoomTypes = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();

    // 先获取当前酒店信息
    const [currentHotel] = await conn.query('SELECT name FROM hotels WHERE id = ?', [id]);

    if (currentHotel.length === 0) {
      conn.release();
      return res.status(404).json({ error: '酒店不存在' });
    }

    const hotelName = currentHotel[0].name;

    // 获取同名的所有酒店（不同房型）
    const [rows] = await conn.query(
      'SELECT * FROM hotels WHERE name = ? AND status = ? ORDER BY price ASC',
      [hotelName, 'published']
    );
    conn.release();

    // 解析 JSON 字段
    const parsedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : []
    }));

    res.json(parsedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 删除酒店图片
exports.deleteHotelImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    
    const conn = await pool.getConnection();
    
    // 获取当前酒店的图片列表
    const [rows] = await conn.query('SELECT images FROM hotels WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ error: '酒店不存在' });
    }
    
    let images = rows[0].images ? (typeof rows[0].images === 'string' ? JSON.parse(rows[0].images) : rows[0].images) : [];
    
    // 从列表中移除图片
    images = images.filter(img => img !== imageUrl);
    
    // 更新数据库
    await conn.query('UPDATE hotels SET images = ? WHERE id = ?', [JSON.stringify(images), id]);
    conn.release();
    
    // 删除文件
    const filePath = path.join(__dirname, '..', imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
