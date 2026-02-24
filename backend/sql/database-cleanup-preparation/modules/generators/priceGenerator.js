// 价格历史生成器
const DateHelper = require('../../utils/dateHelper');

class PriceHistoryGenerator {
  constructor(db, config) {
    this.db = db;
    this.config = config;
  }

  async generate(hotels, roomTypes) {
    const priceHistory = [];
    const days = this.config.priceHistoryDays || 90;
    
    // 获取日期范围（过去90天）
    const today = new Date();
    const startDate = DateHelper.subtractDays(today, days);
    const dates = DateHelper.getDateRange(startDate, today);
    
    for (const hotel of hotels) {
      const hotelRoomTypes = roomTypes.filter(rt => rt.hotelId === hotel.id);
      
      for (const roomType of hotelRoomTypes) {
        const basePrice = roomType.price;
        
        // 为每一天生成价格记录
        for (const date of dates) {
          const record = this.generatePriceRecord(hotel, roomType, date, basePrice);
          priceHistory.push(record);
        }
      }
    }
    
    return priceHistory;
  }

  generatePriceRecord(hotel, roomType, date, basePrice) {
    const isWeekend = DateHelper.isWeekend(date);
    const isHoliday = DateHelper.isHoliday(date);
    
    // 计算价格
    let price = basePrice;
    
    if (isHoliday) {
      // 节假日溢价 +50%
      price *= (1 + this.config.holidayPremium);
    } else if (isWeekend) {
      // 周末溢价 +30%
      price *= (1 + this.config.weekendPremium);
    } else {
      // 工作日随机波动 ±20%
      const fluctuation = this.randomFloat(
        -this.config.priceFluctuation,
        this.config.priceFluctuation
      );
      price *= (1 + fluctuation);
    }
    
    // 四舍五入到整数
    price = Math.round(price);
    
    // 生成入住率
    let occupancyRate;
    if (isHoliday) {
      occupancyRate = this.randomFloat(0.8, 0.95);
    } else if (isWeekend) {
      occupancyRate = this.randomFloat(0.7, 0.90);
    } else {
      occupancyRate = this.randomFloat(0.4, 0.75);
    }
    
    // 保留两位小数
    occupancyRate = Math.round(occupancyRate * 100) / 100;
    
    return {
      hotelId: hotel.id,
      date: DateHelper.formatDate(date),
      price,
      occupancyRate,
      isWeekend: isWeekend ? 1 : 0,
      isHoliday: isHoliday ? 1 : 0
    };
  }

  // 工具方法
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
}

module.exports = PriceHistoryGenerator;
