module.exports = {
  apiKey: process.env.QWEN_API_KEY,
  baseURL: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: process.env.QWEN_MODEL || 'qwen-turbo-latest',
  maxModel: process.env.QWEN_MAX_MODEL || 'qwen-max-latest',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 1500,
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
  timeout: parseInt(process.env.AI_TIMEOUT) || 30000,
  
  cache: {
    enabled: process.env.AI_CACHE_ENABLED !== 'false',
    ttl: {
      summary: parseInt(process.env.AI_CACHE_TTL_SUMMARY) || 3600,
      quality: parseInt(process.env.AI_CACHE_TTL_QUALITY) || 86400,
      trend: parseInt(process.env.AI_CACHE_TTL_TREND) || 21600
    }
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW) || 60000,
    max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 10
  }
};
