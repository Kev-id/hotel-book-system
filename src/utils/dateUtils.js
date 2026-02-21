import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

/**
 * 日期验证工具类
 * 提供统一的日期格式验证和业务规则验证
 */
export class DateValidator {
  /**
   * 验证日期字符串是否符合 YYYY-MM-DD 格式
   * @param {string} dateString - 待验证的日期字符串
   * @returns {boolean} 是否为有效格式
   */
  static isValidDateFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return false;
    }
    
    // 验证格式：YYYY-MM-DD
    const formatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!formatRegex.test(dateString)) {
      return false;
    }
    
    // 验证是否为有效日期
    const date = dayjs(dateString, 'YYYY-MM-DD', true);
    return date.isValid();
  }

  /**
   * 验证入住日期（不能早于今天）
   * @param {string} dateString - 入住日期字符串 (YYYY-MM-DD)
   * @returns {boolean} 是否为有效的入住日期
   */
  static isValidCheckInDate(dateString) {
    if (!this.isValidDateFormat(dateString)) {
      return false;
    }
    
    const checkInDate = dayjs(dateString);
    const today = dayjs().startOf('day');
    
    return checkInDate.isSameOrAfter(today);
  }

  /**
   * 验证退房日期（必须晚于入住日期）
   * @param {string} checkIn - 入住日期字符串 (YYYY-MM-DD)
   * @param {string} checkOut - 退房日期字符串 (YYYY-MM-DD)
   * @returns {boolean} 是否为有效的退房日期
   */
  static isValidCheckOutDate(checkIn, checkOut) {
    if (!this.isValidDateFormat(checkIn) || !this.isValidDateFormat(checkOut)) {
      return false;
    }
    
    const checkInDate = dayjs(checkIn);
    const checkOutDate = dayjs(checkOut);
    
    return checkOutDate.isAfter(checkInDate);
  }

  /**
   * 验证开业日期（合理范围：不超过100年前，不超过10年后）
   * @param {string} dateString - 开业日期字符串 (YYYY-MM-DD)
   * @returns {boolean} 是否为合理的开业日期
   */
  static isValidOpeningDate(dateString) {
    if (!this.isValidDateFormat(dateString)) {
      return false;
    }
    
    const openingDate = dayjs(dateString);
    const minDate = dayjs().subtract(100, 'year');
    const maxDate = dayjs().add(10, 'year');
    
    return openingDate.isAfter(minDate) && openingDate.isBefore(maxDate);
  }

  /**
   * 解析并验证日期字符串
   * @param {string} dateString - 待解析的日期字符串
   * @returns {{valid: boolean, error?: string}} 验证结果
   */
  static parseDate(dateString) {
    if (!dateString) {
      return { valid: false, error: '日期不能为空' };
    }
    
    if (typeof dateString !== 'string') {
      return { valid: false, error: '日期必须是字符串格式' };
    }
    
    const formatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!formatRegex.test(dateString)) {
      return { valid: false, error: '日期格式错误，请使用 YYYY-MM-DD 格式' };
    }
    
    const date = dayjs(dateString, 'YYYY-MM-DD', true);
    if (!date.isValid()) {
      return { valid: false, error: '无效的日期' };
    }
    
    return { valid: true };
  }
}

/**
 * 日期格式化工具类
 * 提供统一的日期格式化方法
 */
export class DateFormatter {
  /**
   * 格式化为 API 传输格式 (YYYY-MM-DD)
   * @param {dayjs.Dayjs|string|Date} date - 日期对象
   * @returns {string} YYYY-MM-DD 格式的日期字符串
   */
  static toAPIFormat(date) {
    if (!date) {
      return '';
    }
    
    if (typeof date === 'string') {
      // 如果已经是字符串，验证并返回
      if (DateValidator.isValidDateFormat(date)) {
        return date;
      }
      // 尝试解析
      date = dayjs(date);
    }
    
    return dayjs(date).format('YYYY-MM-DD');
  }

  /**
   * 格式化为显示格式（支持本地化）
   * @param {string} dateString - YYYY-MM-DD 格式的日期字符串
   * @param {string} locale - 语言代码 (默认 'zh-CN')
   * @returns {string} 格式化后的日期字符串
   */
  static toDisplayFormat(dateString, locale = 'zh-CN') {
    if (!dateString || !DateValidator.isValidDateFormat(dateString)) {
      return '';
    }
    
    const date = dayjs(dateString);
    
    if (locale === 'zh-CN') {
      return date.format('YYYY年MM月DD日');
    }
    
    return date.format('YYYY-MM-DD');
  }

  /**
   * 格式化时间戳为显示格式
   * @param {string} timestamp - 时间戳字符串
   * @returns {string} 格式化后的时间字符串
   */
  static toTimestampDisplay(timestamp) {
    if (!timestamp) {
      return '';
    }
    
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 标准化日期输入为 YYYY-MM-DD 格式
   * @param {any} dateInput - 各种格式的日期输入
   * @returns {string} YYYY-MM-DD 格式的日期字符串
   */
  static normalize(dateInput) {
    if (!dateInput) {
      return '';
    }
    
    // 如果已经是正确格式
    if (typeof dateInput === 'string' && DateValidator.isValidDateFormat(dateInput)) {
      return dateInput;
    }
    
    // 尝试解析并格式化
    const date = dayjs(dateInput);
    if (date.isValid()) {
      return date.format('YYYY-MM-DD');
    }
    
    return '';
  }
}

/**
 * 日期计算工具类
 * 提供日期算术运算，避免时区转换
 */
export class DateCalculator {
  /**
   * 计算两个日期之间的夜数
   * @param {string} checkIn - 入住日期 (YYYY-MM-DD)
   * @param {string} checkOut - 退房日期 (YYYY-MM-DD)
   * @returns {number} 夜数
   */
  static calculateNights(checkIn, checkOut) {
    const checkInDate = dayjs(checkIn);
    const checkOutDate = dayjs(checkOut);
    
    return checkOutDate.diff(checkInDate, 'day');
  }

  /**
   * 计算取消截止时间（入住前24小时）
   * @param {string} checkInDate - 入住日期 (YYYY-MM-DD)
   * @returns {string} 取消截止时间 (YYYY-MM-DD HH:mm:ss)
   */
  static calculateCancelDeadline(checkInDate) {
    const checkIn = dayjs(checkInDate);
    const deadline = checkIn.subtract(1, 'day').hour(23).minute(59).second(59);
    
    return deadline.format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 生成日期范围数组（不包含结束日期）
   * @param {string} startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} endDate - 结束日期 (YYYY-MM-DD)
   * @returns {string[]} 日期数组
   */
  static generateDateRange(startDate, endDate) {
    const dates = [];
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);
    
    while (currentDate.isBefore(end)) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }
    
    return dates;
  }

  /**
   * 日期加减天数
   * @param {string} dateString - 日期字符串 (YYYY-MM-DD)
   * @param {number} days - 要加减的天数（负数表示减）
   * @returns {string} 计算后的日期 (YYYY-MM-DD)
   */
  static addDays(dateString, days) {
    const date = dayjs(dateString);
    return date.add(days, 'day').format('YYYY-MM-DD');
  }

  /**
   * 计算距离截止时间的小时数
   * @param {string} deadline - 截止时间 (YYYY-MM-DD HH:mm:ss)
   * @returns {number} 剩余小时数（可能为负数）
   */
  static hoursUntil(deadline) {
    const now = dayjs();
    const deadlineDate = dayjs(deadline);
    
    return deadlineDate.diff(now, 'hour', true);
  }
}
