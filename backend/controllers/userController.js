const pool = require('../config/database');

// 用户登录
exports.userLogin = async (req, res) => {
  try {
    const { username, password, role } = req.query;
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password, role]
    );
    conn.release();

    // 返回数组格式以兼容前端期望
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 用户注册
exports.userRegister = async (req, res) => {
  try {
    const { username, password, confirmPwd, role } = req.body;
    
    if (password !== confirmPwd) {
      return res.status(400).json({ error: '两次密码不一致' });
    }

    const conn = await pool.getConnection();
    const [existUser] = await conn.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existUser.length > 0) {
      conn.release();
      return res.status(400).json({ error: '用户已存在' });
    }

    const [result] = await conn.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role || 'merchant']
    );
    conn.release();

    res.json({ id: result.insertId, username, role: role || 'merchant' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
