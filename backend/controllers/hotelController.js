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
    res.json(rows);
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
      res.json(rows[0]);
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
    const { name, address, price, city, status, merchantId, openingDate, stars, roomType } = req.body;
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO hotels (name, address, price, city, status, merchantId, openingDate, stars, roomType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, address, price, city, status || 'pending', merchantId, openingDate, stars, roomType]
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
    const { status } = req.body;
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'UPDATE hotels SET status = ? WHERE id = ?',
      [status, id]
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
