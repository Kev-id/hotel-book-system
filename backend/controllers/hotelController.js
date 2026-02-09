const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

// 获取酒店列表（带最低价格）
exports.getHotels = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    let query = `
      SELECT h.*, MIN(rt.price) as price
      FROM hotels h
      LEFT JOIN room_types rt ON h.id = rt.hotelId
      WHERE 1=1
    `;
    const params = [];

    // 构造查询条件
    if (req.query.city) {
      query += ' AND h.city = ?';
      params.push(req.query.city);
    }
    if (req.query.price_gte) {
      query += ' AND rt.price >= ?';
      params.push(Number(req.query.price_gte));
    }
    if (req.query.price_lte) {
      query += ' AND rt.price <= ?';
      params.push(Number(req.query.price_lte));
    }
    if (req.query.status) {
      query += ' AND h.status = ?';
      params.push(req.query.status);
    }
    if (req.query.stars) {
      query += ' AND h.stars = ?';
      params.push(Number(req.query.stars));
    }

    query += ' GROUP BY h.id';

    const [rows] = await conn.query(query, params);
    conn.release();
    
    // 解析 JSON 字段并处理标签筛选
    let parsedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
      images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : []
    }));

    // 如果提供了标签过滤，进行过滤
    if (req.query.tag) {
      let tagsFilter = [];
      if (Array.isArray(req.query.tag)) {
        tagsFilter = req.query.tag;
      } else {
        tagsFilter = String(req.query.tag).split(',').map(t => t.trim()).filter(Boolean);
      }

      if (tagsFilter.length > 0) {
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

// 获取单个酒店详情（包含所有房型）
exports.getHotelDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    
    // 获取酒店基本信息
    const [hotelRows] = await conn.query('SELECT * FROM hotels WHERE id = ?', [id]);
    
    if (hotelRows.length === 0) {
      conn.release();
      return res.status(404).json(null);
    }
    
    const hotel = hotelRows[0];
    
    // 获取该酒店的所有房型
    const [roomRows] = await conn.query('SELECT * FROM room_types WHERE hotelId = ? ORDER BY price ASC', [id]);
    
    conn.release();
    
    // 解析 JSON 字段
    hotel.tags = hotel.tags ? (typeof hotel.tags === 'string' ? JSON.parse(hotel.tags) : hotel.tags) : [];
    hotel.images = hotel.images ? (typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images) : [];
    hotel.roomTypes = roomRows;
    hotel.price = roomRows.length > 0 ? roomRows[0].price : 0; // 最低价格
    
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 新增酒店
exports.addHotel = async (req, res) => {
  try {
    const { name, address, city, status, merchantId, openingDate, stars, tags, description, roomTypes } = req.body;
    
    // 处理上传的图片
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/hotels/${file.filename}`);
    }
    
    const conn = await pool.getConnection();
    
    // 插入酒店
    const [result] = await conn.query(
      'INSERT INTO hotels (name, address, city, status, merchantId, openingDate, stars, tags, description, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, address, city, status || 'pending', merchantId, openingDate, stars, JSON.stringify(tags || []), description || '', JSON.stringify(images)]
    );
    
    const hotelId = result.insertId;
    
    // 插入房型（如果提供）
    if (roomTypes && Array.isArray(roomTypes)) {
      const parsedRoomTypes = typeof roomTypes === 'string' ? JSON.parse(roomTypes) : roomTypes;
      for (const room of parsedRoomTypes) {
        await conn.query(
          'INSERT INTO room_types (hotelId, roomType, price) VALUES (?, ?, ?)',
          [hotelId, room.roomType, room.price]
        );
      }
    }
    
    conn.release();

    res.json({ id: hotelId, ...req.body, images });
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
    // 由于设置了 ON DELETE CASCADE，删除酒店会自动删除关联的房型
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

// 获取酒店的所有房型
exports.getHotelRoomTypes = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    
    const [rows] = await conn.query(
      'SELECT * FROM room_types WHERE hotelId = ? ORDER BY price ASC',
      [id]
    );
    conn.release();
    
    res.json(rows);
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
