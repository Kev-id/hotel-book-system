// 日期处理工具
class DateHelper {
  // 格式化日期为 YYYY-MM-DD
  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 格式化日期时间为 YYYY-MM-DD HH:mm:ss
  static formatDateTime(date) {
    const dateStr = this.formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
  }

  // 添加天数
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // 减去天数
  static subtractDays(date, days) {
    return this.addDays(date, -days);
  }

  // 判断是否为周末
  static isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0=周日, 6=周六
  }

  // 判断是否为节假日（简化版，仅包含主要节假日）
  static isHoliday(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 元旦
    if (month === 1 && day === 1) return true;
    
    // 春节（简化：2月1-7日）
    if (month === 2 && day >= 1 && day <= 7) return true;
    
    // 清明节（简化：4月4-6日）
    if (month === 4 && day >= 4 && day <= 6) return true;
    
    // 劳动节（5月1-3日）
    if (month === 5 && day >= 1 && day <= 3) return true;
    
    // 端午节（简化：6月10-12日）
    if (month === 6 && day >= 10 && day <= 12) return true;
    
    // 中秋节（简化：9月15-17日）
    if (month === 9 && day >= 15 && day <= 17) return true;
    
    // 国庆节（10月1-7日）
    if (month === 10 && day >= 1 && day <= 7) return true;
    
    return false;
  }

  // 生成日期范围
  static getDateRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate = this.addDays(currentDate, 1);
    }
    
    return dates;
  }

  // 获取相对日期范围（相对于今天）
  static getRelativeDateRange(daysAgo, daysAhead) {
    const today = new Date();
    const startDate = this.addDays(today, daysAgo);
    const endDate = this.addDays(today, daysAhead);
    return this.getDateRange(startDate, endDate);
  }

  // 检查日期是否在范围内
  static isInDateRange(date, startDate, endDate) {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return d >= start && d <= endDate;
  }

  // 获取随机日期
  static getRandomDate(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const randomTime = start + Math.random() * (end - start);
    return new Date(randomTime);
  }

  // 获取过去N天的随机日期
  static getRandomPastDate(daysAgo) {
    const today = new Date();
    const pastDate = this.subtractDays(today, daysAgo);
    return this.getRandomDate(pastDate, today);
  }

  // 获取未来N天的随机日期
  static getRandomFutureDate(daysAhead) {
    const today = new Date();
    const futureDate = this.addDays(today, daysAhead);
    return this.getRandomDate(today, futureDate);
  }
}

module.exports = DateHelper;
