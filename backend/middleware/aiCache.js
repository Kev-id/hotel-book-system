const pool = require('../config/database');
const aiConfig = require('../config/ai');
const crypto = require('crypto');

/**
 * ✅ P1-1修复：缓存键包含参数，支持不同参数的缓存
 * 使用MD5哈希参数对象，确保相同参数返回相同缓存
 */
async function getCache(hotelId, cacheType, params = {}) {
  if (!aiConfig.cache.enabled) return null;
  
  // 生成包含参数的缓存键
  const cacheKey = generateCacheKey(hotelId, cacheType, params);
  
  const [rows] = await pool.query(
    `SELECT cache_data FROM review_ai_cache 
     WHERE hotel_id = ? AND cache_type = ? AND cache_key = ? 
     AND expire_time > NOW()
     ORDER BY create_time DESC LIMIT 1`,
    [hotelId, cacheType, cacheKey]
  );
  
  return rows.length > 0 ? rows[0].cache_data : null;
}

async function setCache(hotelId, cacheType, data, reviewsCount, params = {}) {
  if (!aiConfig.cache.enabled) return;
  
  const ttl = aiConfig.cache.ttl[cacheType] || 3600;
  const expireTime = new Date(Date.now() + ttl * 1000);
  
  // 生成包含参数的缓存键
  const cacheKey = generateCacheKey(hotelId, cacheType, params);
  
  await pool.query(
    `INSERT INTO review_ai_cache 
     (hotel_id, cache_type, cache_key, cache_data, reviews_count, expire_time)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [hotelId, cacheType, cacheKey, JSON.stringify(data), reviewsCount, expireTime]
  );
}

/**
 * ✅ P1-1新增：生成包含参数的缓存键
 * 使用MD5哈希确保相同参数生成相同键
 */
function generateCacheKey(hotelId, cacheType, params) {
  // 如果没有参数，返回简单键
  if (!params || Object.keys(params).length === 0) {
    return `${hotelId}:${cacheType}`;
  }
  
  // 对参数对象进行MD5哈希
  const paramsHash = crypto
    .createHash('md5')
    .update(JSON.stringify(params))
    .digest('hex');
  
  return `${hotelId}:${cacheType}:${paramsHash}`;
}

/**
 * Analytics缓存辅助函数
 */
async function getCachedInsights(merchantId, period, generator) {
  const cacheKey = `insights:${merchantId}:${period}`;
  const cached = await getCache(merchantId, 'insights', { period });
  if (cached) return cached;
  
  const result = await generator();
  await setCache(merchantId, 'insights', result, 0, { period });
  return result;
}

async function getCachedPricing(merchantId, period, generator) {
  const cacheKey = `pricing:${merchantId}:${period}`;
  const cached = await getCache(merchantId, 'pricing', { period });
  if (cached) return cached;
  
  const result = await generator();
  await setCache(merchantId, 'pricing', result, 0, { period });
  return result;
}

async function getCachedAlerts(merchantId, period, generator) {
  const cacheKey = `alerts:${merchantId}:${period}`;
  const cached = await getCache(merchantId, 'alerts', { period });
  if (cached) return cached;
  
  const result = await generator();
  await setCache(merchantId, 'alerts', result, 0, { period });
  return result;
}

module.exports = { 
  getCache, 
  setCache,
  getCachedInsights,
  getCachedPricing,
  getCachedAlerts
};
