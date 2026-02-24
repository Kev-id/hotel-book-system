// 评价数据生成器
const DateHelper = require('../../utils/dateHelper');
const keywords = require('../../config/keywords');

class ReviewGenerator {
  constructor(db, config) {
    this.db = db;
    this.config = config;
    this.keywords = keywords;
  }

  async generate(orders, hotels) {
    const reviews = [];
    
    // 为60%的已完成订单生成评价
    const completedOrders = orders.filter(o => o.status === 'completed');
    const targetReviewCount = Math.floor(completedOrders.length * this.config.reviewToOrderRatio);
    
    // 随机选择订单
    const ordersWithReviews = this.selectRandomItems(completedOrders, targetReviewCount);
    
    for (const order of ordersWithReviews) {
      const hotel = hotels.find(h => h.id === order.hotelId);
      if (hotel) {
        const review = this.generateReview(order, hotel);
        reviews.push(review);
      }
    }
    
    // 注入关键词以支持AI分析
    this.injectKeywords(reviews, hotels);
    
    // 生成5-10%的可疑评价
    this.generateSuspiciousReviews(reviews);
    
    return reviews;
  }

  generateReview(order, hotel) {
    // 生成评分（1-5星，倾向于高分）
    const rating = this.generateRating();
    
    // 生成维度评分
    const dimensions = this.generateDimensions(rating);
    
    // 根据评分生成情感
    const sentiment = this.ratingSentiment(rating);
    
    // 生成评价内容（50-500字符）
    const content = this.generateContent(rating, hotel, dimensions);
    
    // 生成标签
    const tags = this.generateTags(sentiment, hotel);
    
    // 生成评价时间（订单完成后1-7天）
    const checkOutDate = new Date(order.checkOutDate);
    const daysAfter = this.randomInt(1, 7);
    const createTime = DateHelper.addDays(checkOutDate, daysAfter);
    
    // 生成helpful数
    const helpful = this.randomInt(0, 50);
    
    // 是否有商家回复（30%概率）
    const merchantReply = Math.random() < 0.3 ? this.generateMerchantReply(sentiment) : null;
    
    return {
      userId: order.userId,
      hotelId: order.hotelId,
      orderId: order.id,
      overallRating: rating,
      dimensions: JSON.stringify(dimensions),
      content,
      images: JSON.stringify([]),
      tags: JSON.stringify(tags),
      sentiment,
      helpful,
      reported: false,
      merchantReply: merchantReply ? JSON.stringify(merchantReply) : null,
      createTime: DateHelper.formatDateTime(createTime)
    };
  }

  generateRating() {
    // 倾向于高分的分布
    const rand = Math.random();
    if (rand < 0.4) return this.randomFloat(4.5, 5.0); // 40% 高分
    if (rand < 0.7) return this.randomFloat(3.5, 4.4); // 30% 中高分
    if (rand < 0.85) return this.randomFloat(2.5, 3.4); // 15% 中分
    return this.randomFloat(1.0, 2.4); // 15% 低分
  }

  generateDimensions(overallRating) {
    // 生成各维度评分，围绕总评分波动
    const variance = 0.5;
    return {
      cleanliness: Math.max(1, Math.min(5, overallRating + this.randomFloat(-variance, variance))),
      service: Math.max(1, Math.min(5, overallRating + this.randomFloat(-variance, variance))),
      location: Math.max(1, Math.min(5, overallRating + this.randomFloat(-variance, variance))),
      facilities: Math.max(1, Math.min(5, overallRating + this.randomFloat(-variance, variance))),
      value: Math.max(1, Math.min(5, overallRating + this.randomFloat(-variance, variance)))
    };
  }

  ratingSentiment(rating) {
    if (rating >= 4.0) return 'positive';
    if (rating >= 3.0) return 'neutral';
    return 'negative';
  }

  generateContent(rating, hotel, dimensions) {
    const sentiment = this.ratingSentiment(rating);
    const templates = this.getContentTemplates(sentiment);
    const template = this.selectRandom(templates);
    
    // 替换模板中的占位符
    let content = template
      .replace('{hotel}', hotel.name)
      .replace('{location}', hotel.city || '这里');
    
    // 添加维度相关的评论
    const dimensionComments = this.generateDimensionComments(dimensions, sentiment);
    if (dimensionComments.length > 0) {
      content += ' ' + dimensionComments.join('，') + '。';
    }
    
    // 确保长度在50-500字符之间
    if (content.length < 50) {
      content += this.generateFillerText(sentiment);
    }
    if (content.length > 500) {
      content = content.substring(0, 497) + '...';
    }
    
    return content;
  }

  getContentTemplates(sentiment) {
    if (sentiment === 'positive') {
      return [
        '{hotel}的体验非常好，各方面都很满意。',
        '这次入住{hotel}很愉快，值得推荐。',
        '{hotel}给我留下了深刻的印象，下次还会选择这里。',
        '在{location}住过很多酒店，{hotel}是最满意的一家。',
        '强烈推荐{hotel}，性价比很高，服务也很好。'
      ];
    } else if (sentiment === 'neutral') {
      return [
        '{hotel}整体还可以，有些地方可以改进。',
        '这次入住{hotel}中规中矩，没有特别惊喜。',
        '{hotel}基本符合预期，但也有一些不足。',
        '在{location}的住宿体验一般，{hotel}还算过得去。'
      ];
    } else {
      return [
        '{hotel}的体验很差，不推荐。',
        '这次入住{hotel}很失望，有很多问题。',
        '{hotel}完全不符合预期，浪费钱。',
        '在{location}住过很多酒店，{hotel}是最差的一家。',
        '强烈不推荐{hotel}，问题太多了。'
      ];
    }
  }

  generateDimensionComments(dimensions, sentiment) {
    const comments = [];
    const keywordType = sentiment === 'positive' ? 'positive' : 'negative';
    
    // 根据维度评分生成评论
    if (dimensions.cleanliness > 4.0 && sentiment === 'positive') {
      comments.push(this.selectRandom(this.keywords[keywordType].cleanliness));
    } else if (dimensions.cleanliness < 3.0 && sentiment === 'negative') {
      comments.push(this.selectRandom(this.keywords[keywordType].cleanliness));
    }
    
    if (dimensions.service > 4.0 && sentiment === 'positive') {
      comments.push(this.selectRandom(this.keywords[keywordType].service));
    } else if (dimensions.service < 3.0 && sentiment === 'negative') {
      comments.push(this.selectRandom(this.keywords[keywordType].service));
    }
    
    if (dimensions.location > 4.0 && sentiment === 'positive') {
      comments.push(this.selectRandom(this.keywords[keywordType].location));
    } else if (dimensions.location < 3.0 && sentiment === 'negative') {
      comments.push(this.selectRandom(this.keywords[keywordType].location));
    }
    
    return comments;
  }

  generateFillerText(sentiment) {
    if (sentiment === 'positive') {
      return '总体来说非常满意，会推荐给朋友。';
    } else if (sentiment === 'neutral') {
      return '总体来说还行，但有改进空间。';
    } else {
      return '总体来说很失望，不会再来了。';
    }
  }

  generateTags(sentiment, hotel) {
    const tags = [];
    
    if (sentiment === 'positive') {
      tags.push('值得推荐');
      if (Math.random() < 0.5) tags.push('性价比高');
      if (Math.random() < 0.3) tags.push('服务好');
    } else if (sentiment === 'negative') {
      tags.push('不推荐');
      if (Math.random() < 0.5) tags.push('性价比低');
      if (Math.random() < 0.3) tags.push('服务差');
    }
    
    // 添加酒店相关标签
    if (hotel.tags) {
      const hotelTags = typeof hotel.tags === 'string' ? JSON.parse(hotel.tags) : hotel.tags;
      if (hotelTags.length > 0 && Math.random() < 0.5) {
        tags.push(this.selectRandom(hotelTags));
      }
    }
    
    return tags;
  }

  generateMerchantReply(sentiment) {
    const templates = {
      positive: [
        '感谢您的好评！我们会继续努力，为您提供更好的服务。',
        '非常感谢您的认可！期待您的再次光临。',
        '谢谢您的支持！我们会保持高标准的服务质量。'
      ],
      neutral: [
        '感谢您的反馈，我们会努力改进。',
        '谢谢您的建议，我们会认真对待。',
        '感谢您的评价，我们会持续提升服务质量。'
      ],
      negative: [
        '非常抱歉给您带来不好的体验，我们会立即改进。',
        '感谢您的反馈，我们已经在着手解决这些问题。',
        '对于给您造成的不便深表歉意，我们会加强管理。'
      ]
    };
    
    const replyTemplates = templates[sentiment] || templates.neutral;
    const content = this.selectRandom(replyTemplates);
    
    return {
      content,
      replyTime: DateHelper.formatDateTime(new Date())
    };
  }

  injectKeywords(reviews, hotels) {
    // 为每个酒店注入3-5个明显的亮点和槽点关键词
    hotels.forEach(hotel => {
      const hotelReviews = reviews.filter(r => r.hotelId === hotel.id);
      
      if (hotelReviews.length === 0) return;
      
      // 选择关键词
      const positiveKeywords = this.selectRandomItems(
        Object.values(this.keywords.positive).flat(),
        this.randomInt(3, 5)
      );
      
      const negativeKeywords = this.selectRandomItems(
        Object.values(this.keywords.negative).flat(),
        this.randomInt(3, 5)
      );
      
      // 在正面评价中注入亮点关键词
      const positiveReviews = hotelReviews.filter(r => r.sentiment === 'positive');
      this.distributeKeywords(positiveReviews, positiveKeywords);
      
      // 在负面评价中注入槽点关键词
      const negativeReviews = hotelReviews.filter(r => r.sentiment === 'negative');
      this.distributeKeywords(negativeReviews, negativeKeywords);
    });
  }

  distributeKeywords(reviews, keywords) {
    if (reviews.length === 0 || keywords.length === 0) return;
    
    // 将关键词分配到评价中
    keywords.forEach((keyword, index) => {
      const reviewIndex = index % reviews.length;
      const review = reviews[reviewIndex];
      
      // 将关键词插入到评价内容中
      if (!review.content.includes(keyword)) {
        // 在句子中间插入
        const sentences = review.content.split('。');
        if (sentences.length > 1) {
          sentences.splice(1, 0, keyword);
          review.content = sentences.join('。');
        } else {
          review.content += '，' + keyword + '。';
        }
      }
    });
  }

  generateSuspiciousReviews(reviews) {
    const minRate = this.config.suspiciousReviewRate.min;
    const maxRate = this.config.suspiciousReviewRate.max;
    const suspiciousRate = this.randomFloat(minRate, maxRate);
    const suspiciousCount = Math.floor(reviews.length * suspiciousRate);
    
    const suspiciousTypes = [
      'TOO_SHORT',        // 内容极短且通用
      'RATING_MISMATCH',  // 评分与内容矛盾
      'SENSITIVE_WORDS'   // 包含敏感词
    ];
    
    // 随机选择评价变成可疑评价
    const selectedReviews = this.selectRandomItems(reviews, suspiciousCount);
    
    selectedReviews.forEach(review => {
      const type = this.selectRandom(suspiciousTypes);
      this.makeSuspicious(review, type);
    });
  }

  makeSuspicious(review, type) {
    switch (type) {
      case 'TOO_SHORT':
        review.content = this.selectRandom(['很好', '不错', '还行', '一般', '很差']);
        review.overallRating = 5.0;
        review.sentiment = 'positive';
        break;
        
      case 'RATING_MISMATCH':
        review.overallRating = 5.0;
        review.content = '体验非常差，房间很脏，服务也不好，完全不推荐。';
        review.sentiment = 'negative';
        break;
        
      case 'SENSITIVE_WORDS':
        review.content += ' 联系微信：xxxxx 获取优惠。';
        break;
    }
  }

  // 工具方法
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  selectRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  selectRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

module.exports = ReviewGenerator;
