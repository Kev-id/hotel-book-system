const rateLimit = require('express-rate-limit');

/**
 * ✅ P1-4修复：分级限流策略
 * 根据用户角色设置不同的限流规则
 */

// 创建分级限流器
const createRateLimiter = (role) => {
  const limits = {
    user: { windowMs: 60000, max: 20 },      // 普通用户：20次/分钟
    merchant: { windowMs: 60000, max: 50 },  // 商户：50次/分钟
    guest: { windowMs: 60000, max: 5 }       // 游客：5次/分钟
  };
  
  const config = limits[role] || limits.guest;
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      error: 'AI服务调用过于频繁，请稍后再试',
      retryAfter: Math.ceil(config.windowMs / 1000),
      role: role
    },
    standardHeaders: true,
    legacyHeaders: false,
    // 修复IPv6问题：使用简单的字符串键
    skip: (req) => false
  });
};

// 智能限流中间件：根据用户角色自动选择限流策略
const smartRateLimiter = (req, res, next) => {
  let role = 'guest';
  
  if (req.user) {
    // 判断用户角色
    if (req.user.role === 'merchant' || req.user.role === 'admin') {
      role = 'merchant';
    } else {
      role = 'user';
    }
  }
  
  // 动态应用对应的限流器
  const limiter = createRateLimiter(role);
  return limiter(req, res, next);
};

// 导出不同角色的限流器
module.exports = {
  smartRateLimiter,
  userLimiter: createRateLimiter('user'),
  merchantLimiter: createRateLimiter('merchant'),
  guestLimiter: createRateLimiter('guest')
};
