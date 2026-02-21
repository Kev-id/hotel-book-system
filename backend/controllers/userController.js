const pool = require('../config/database');

// 用户登录
exports.userLogin = async (req, res) => {
  try {
    const { username, password } = req.query;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT id, username, role, phone, email FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const user = rows[0];
    
    // 返回用户信息和认证token（使用base64编码的用户信息作为简单token）
    const userInfo = {
      id: user.id,
      username: user.username,
      role: user.role,
      phone: user.phone,
      email: user.email
    };
    
    const token = Buffer.from(JSON.stringify(userInfo)).toString('base64');
    
    res.json({
      success: true,
      user: userInfo,
      token: token,
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: error.message });
  }
};

// 用户注册
exports.userRegister = async (req, res) => {
  try {
    const { username, password, confirmPwd, role } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    // 验证用户名长度
    if (username.length < 3) {
      return res.status(400).json({ error: '用户名至少3个字符' });
    }
    
    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6个字符' });
    }
    
    // 验证两次密码是否一致
    if (password !== confirmPwd) {
      return res.status(400).json({ error: '两次密码不一致' });
    }

    const conn = await pool.getConnection();
    
    // 检查用户是否已存在
    const [existUser] = await conn.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existUser.length > 0) {
      conn.release();
      return res.status(400).json({ error: '用户名已被注册' });
    }

    // 插入新用户
    const [result] = await conn.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role || 'merchant']
    );
    conn.release();

    // 返回新用户信息和token
    const userInfo = {
      id: result.insertId,
      username,
      role: role || 'merchant'
    };
    
    const token = Buffer.from(JSON.stringify(userInfo)).toString('base64');

    res.json({ 
      success: true,
      user: userInfo,
      token: token,
      message: '注册成功'
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: error.message || '注册失败，请稍后重试' });
  }
};
