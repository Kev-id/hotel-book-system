/**
 * Task13: AI收藏对比系统 - 缓存中间件
 * 使用node-cache实现内存缓存
 */

const NodeCache = require('node-cache');

// 创建缓存实例（默认1小时过期）
const favoriteCache = new NodeCache({ 
  stdTTL: 3600,
  checkperiod: 600  // 每10分钟检查过期
});

/**
 * 对比分析缓存（相同酒店组合结果相同）
 * @param {Array} hotelIds - 酒店ID数组
 * @param {Function} fn - 获取数据的函数
 * @returns {Promise} 缓存或新数据
 */
async function getCachedComparison(hotelIds, fn) {
  const cacheKey = `compare:${hotelIds.sort().join('-')}`;
  
  const cached = favoriteCache.get(cacheKey);
  if (cached) {
    console.log('✓ 命中对比缓存:', cacheKey);
    return cached;
  }
  
  console.log('✗ 未命中缓存，调用AI:', cacheKey);
  const result = await fn();
  favoriteCache.set(cacheKey, result);
  return result;
}

/**
 * 推荐缓存（按用户ID缓存，30分钟过期）
 * @param {Number} userId - 用户ID
 * @param {Function} fn - 获取数据的函数
 * @returns {Promise} 缓存或新数据
 */
async function getCachedRecommendation(userId, fn) {
  const cacheKey = `recommend:${userId}`;
  
  const cached = favoriteCache.get(cacheKey);
  if (cached) {
    console.log('✓ 命中推荐缓存:', cacheKey);
    return cached;
  }
  
  console.log('✗ 未命中缓存，调用AI:', cacheKey);
  const result = await fn();
  favoriteCache.set(cacheKey, result, 1800);  // 30分钟
  return result;
}

/**
 * 清除用户相关缓存（收藏变更时调用）
 * @param {Number} userId - 用户ID
 */
function clearUserCache(userId) {
  const cacheKey = `recommend:${userId}`;
  favoriteCache.del(cacheKey);
  console.log('✓ 清除用户缓存:', cacheKey);
}

/**
 * 获取缓存统计信息
 * @returns {Object} 缓存统计
 */
function getCacheStats() {
  return favoriteCache.getStats();
}

module.exports = {
  getCachedComparison,
  getCachedRecommendation,
  clearUserCache,
  getCacheStats
};
