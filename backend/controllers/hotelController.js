const pool = require('../config/database');
const path = require('path');
const fs = require('fs');
const { DateCalculator, DateValidator } = require('../utils/dateUtils');

// 获取酒店列表（带最低价格）
exports.getHotels = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    let query = `
      SELECT h.*, MIN(rt.price) as price
      FROM hotels h
      LEFT JOIN room_types rt ON h.id = rt.hotelId
      WHERE h.deleted_at IS NULL
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
    if (req.query.keyword) {
      query += ' AND h.name LIKE ?';
      params.push(`%${req.query.keyword}%`);
    }
    query += ' GROUP BY h.id';

    const [rows] = await conn.query(query, params);
    
    // 解析 JSON 字段并处理标签筛选
    let parsedRows = rows.map(row => ({
      ...row,
      price: row.price || 0, // 确保 price 不为 null
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

    // 为每个酒店获取房型信息（用于价格计算）
    for (const hotel of parsedRows) {
      const [roomTypes] = await conn.query(
        'SELECT id, roomType, price FROM room_types WHERE hotelId = ? ORDER BY price ASC',
        [hotel.id]
      );
      hotel.roomTypes = roomTypes;
    }
    
    conn.release();

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
    
    try {
      // 插入酒店
      const [result] = await conn.query(
        'INSERT INTO hotels (name, address, city, status, merchantId, openingDate, stars, tags, description, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, address, city, status || 'pending', merchantId, openingDate, stars, JSON.stringify(tags || []), description || '', JSON.stringify(images)]
      );
      
      const hotelId = result.insertId;
      
      // 插入房型（如果提供）
      if (roomTypes) {
        // FormData 会将所有字段转为字符串，需要先解析
        let parsedRoomTypes;
        try {
          parsedRoomTypes = typeof roomTypes === 'string' ? JSON.parse(roomTypes) : roomTypes;
        } catch (parseError) {
          conn.release();
          return res.status(400).json({ error: '房型数据格式错误' });
        }
        
        if (Array.isArray(parsedRoomTypes) && parsedRoomTypes.length > 0) {
          for (const room of parsedRoomTypes) {
            if (room.roomType && room.price) {
              await conn.query(
                'INSERT INTO room_types (hotelId, roomType, price) VALUES (?, ?, ?)',
                [hotelId, room.roomType, Number(room.price)]
              );
            }
          }
        }
      }
      
      conn.release();
      res.json({ id: hotelId, ...req.body, images });
    } catch (dbError) {
      conn.release();
      throw dbError;
    }
  } catch (error) {
    console.error('addHotel 错误:', error);
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

// 软删除酒店（下线）
exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    // 软删除：设置 deleted_at 时间戳
    const [result] = await conn.query(
      'UPDATE hotels SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    conn.release();

    if (result.affectedRows > 0) {
      res.json({ success: true, message: '酒店已下线' });
    } else {
      res.status(404).json({ error: '酒店不存在或已下线' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 恢复已删除的酒店
exports.restoreHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    // 恢复：将 deleted_at 设为 NULL
    const [result] = await conn.query(
      'UPDATE hotels SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
      [id]
    );
    conn.release();

    if (result.affectedRows > 0) {
      res.json({ success: true, message: '酒店已恢复' });
    } else {
      res.status(404).json({ error: '酒店不存在或未被删除' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取已删除的酒店列表
exports.getDeletedHotels = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const query = `
      SELECT h.*, MIN(rt.price) as price
      FROM hotels h
      LEFT JOIN room_types rt ON h.id = rt.hotelId
      WHERE h.deleted_at IS NOT NULL
      GROUP BY h.id
      ORDER BY h.deleted_at DESC
    `;
    
    const [rows] = await conn.query(query);
    conn.release();
    
    // 解析 JSON 字段
    const parsedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
      images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : []
    }));

    res.json(parsedRows);
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

// 设置价格日历
exports.setPriceCalendar = async (req, res) => {
  try {
    const { hotelId, roomTypeId, date, price } = req.body;
    const conn = await pool.getConnection();
    
    await conn.query(
      `INSERT INTO price_calendar (hotelId, roomTypeId, date, price) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE price = ?`,
      [hotelId, roomTypeId, date, price, price]
    );
    
    conn.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 批量设置价格日历
exports.setBatchPriceCalendar = async (req, res) => {
  try {
    const { hotelId, roomTypeId, startDate, endDate, price } = req.body;
    const conn = await pool.getConnection();
    
    // 使用日期工具类生成日期范围，避免时区转换问题
    const dates = DateCalculator.generateDateRange(startDate, endDate);
    
    // 批量插入
    for (const date of dates) {
      await conn.query(
        `INSERT INTO price_calendar (hotelId, roomTypeId, date, price) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE price = ?`,
        [hotelId, roomTypeId, date, price, price]
      );
    }
    
    conn.release();
    res.json({ success: true, count: dates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取价格日历
exports.getPriceCalendar = async (req, res) => {
  try {
    const { hotelId, startDate, endDate } = req.query;
    const conn = await pool.getConnection();
    
    let query = 'SELECT * FROM price_calendar WHERE hotelId = ?';
    const params = [hotelId];
    
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY date ASC';
    
    const [rows] = await conn.query(query, params);
    conn.release();
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 计算时间段总价
exports.calculatePeriodPrice = async (req, res) => {
  try {
    const { hotelId, roomTypeId, checkIn, checkOut } = req.query;
    const conn = await pool.getConnection();
    
    // 获取房型基础价格
    const [roomType] = await conn.query(
      'SELECT price FROM room_types WHERE id = ? AND hotelId = ?',
      [roomTypeId, hotelId]
    );
    
    if (roomType.length === 0) {
      conn.release();
      return res.status(404).json({ error: '房型不存在' });
    }
    
    const basePrice = roomType[0].price;
    
    // 获取日期范围内的特殊价格
    const [priceRows] = await conn.query(
      `SELECT date, price FROM price_calendar 
       WHERE hotelId = ? AND roomTypeId = ? AND date >= ? AND date < ?`,
      [hotelId, roomTypeId, checkIn, checkOut]
    );
    
    conn.release();
    
    // 使用日期工具类计算夜数和生成日期范围
    const nights = DateCalculator.calculateNights(checkIn, checkOut);
    const dates = DateCalculator.generateDateRange(checkIn, checkOut);
    
    let totalPrice = 0;
    let minPrice = null;
    const priceMap = {};
    
    // 构建价格映射 - 直接使用数据库返回的日期字符串
    priceRows.forEach(row => {
      // MySQL DATE类型返回的是 Date对象，需要格式化为 YYYY-MM-DD
      let dateStr;
      if (row.date instanceof Date) {
        const year = row.date.getFullYear();
        const month = String(row.date.getMonth() + 1).padStart(2, '0');
        const day = String(row.date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } else {
        dateStr = row.date;
      }
      priceMap[dateStr] = row.price;
    });
    
    // 遍历每一天计算价格（使用生成的日期数组）
    for (const date of dates) {
      const dayPrice = priceMap[date] || basePrice;
      totalPrice += dayPrice;
      
      // 更新最低价格
      if (minPrice === null) {
        minPrice = dayPrice;
      } else {
        minPrice = Math.min(minPrice, dayPrice);
      }
    }
    
    // 如果没有遍历任何天（不应该发生），使用基础价格
    if (minPrice === null) {
      minPrice = basePrice;
    }
    
    res.json({ 
      totalPrice, 
      nights, 
      minPrice,
      avgPrice: Math.round(totalPrice / nights)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
