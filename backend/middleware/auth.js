// 简单的认证中间件
// 支持两种认证方式：x-user-info header 和 Bearer token

const authMiddleware = (req, res, next) => {
  try {
    console.log('=== authMiddleware 被调用 ===');
    console.log('请求路径:', req.path);
    console.log('请求方法:', req.method);
    
    // 方式1: 从请求头获取 x-user-info
    let userHeader = req.headers['x-user-info'];
    
    // 方式2: 从 Authorization Bearer token 获取
    if (!userHeader && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Token 是 base64 编码的用户信息
        try {
          userHeader = Buffer.from(token, 'base64').toString('utf-8');
        } catch (e) {
          // Token 解码失败
        }
      }
    }
    
    if (!userHeader) {
      return res.status(401).json({ 
        error: '未登录',
        message: '请先登录后再访问此接口'
      });
    }

    // 解析用户信息
    const user = JSON.parse(userHeader);
    
    console.log('解析的用户信息:', user);
    
    if (!user.id || !user.username) {
      return res.status(401).json({ 
        error: '用户信息无效',
        message: '请重新登录'
      });
    }

    // 将用户信息附加到请求对象
    req.user = user;
    console.log('req.user 已设置:', req.user);
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(401).json({ 
      error: '认证失败',
      message: '用户信息解析失败，请重新登录'
    });
  }
};

// 可选的认证中间件（允许未登录访问，但会尝试获取用户信息）
const optionalAuthMiddleware = (req, res, next) => {
  try {
    let userHeader = req.headers['x-user-info'];
    
    // 尝试从 Bearer token 获取
    if (!userHeader && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          userHeader = Buffer.from(token, 'base64').toString('utf-8');
        } catch (e) {
          // Token 解码失败，继续
        }
      }
    }
    
    if (userHeader) {
      const user = JSON.parse(userHeader);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // 解析失败也继续，只是没有用户信息
    next();
  }
};

// 角色验证中间件
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: '未登录',
        message: '请先登录'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: '权限不足',
        message: `此操作需要 ${allowedRoles.join(' 或 ')} 权限`
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole
};
