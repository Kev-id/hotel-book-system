// 订单数据生成器
const DateHelper = require('../../utils/dateHelper');
const { assignPersonasToUsers, filterHotelsByPersona } = require('../userPersonas');

class OrderGenerator {
  constructor(db, config) {
    this.db = db;
    this.config = config;
    this.orderIdCounter = 1;
  }

  async generate(users, hotels, roomTypes) {
    const orders = [];
    const usersWithPersonas = assignPersonasToUsers(users);
    
    // 计算订单总数
    const totalOrders = this.randomInt(
      this.config.totalOrders.min,
      this.config.totalOrders.max
    );
    
    // 生成订单
    for (let i = 0; i < totalOrders; i++) {
      const user = this.selectRandom(usersWithPersonas);
      const order = this.generateOrder(user, hotels, roomTypes);
      if (order) {
        orders.push(order);
      }
    }
    
    // 分配订单状态
    this.distributeStatuses(orders);
    
    return orders;
  }

  generateOrder(user, hotels, roomTypes) {
    // 确保有默认画像
    const defaultPersona = {
      id: 'budget',
      preferences: {
        stars: [3, 4, 5]
      },
      bookingPattern: {
        stayDuration: [1, 3],
        advanceBooking: [7, 30]
      }
    };
    
    const persona = user.persona || defaultPersona;
    
    // 确保bookingPattern存在
    if (!persona.bookingPattern) {
      persona.bookingPattern = defaultPersona.bookingPattern;
    }
    
    // 根据用户画像筛选酒店
    let suitableHotels = filterHotelsByPersona(hotels, persona);
    
    // 如果没有合适的酒店，使用所有酒店
    if (suitableHotels.length === 0) {
      suitableHotels = hotels;
    }
    
    const hotel = this.selectRandom(suitableHotels);
    
    // 选择房型
    const hotelRoomTypes = roomTypes.filter(rt => rt.hotelId === hotel.id);
    if (hotelRoomTypes.length === 0) {
      return null;
    }
    
    const roomType = this.selectRandom(hotelRoomTypes);
    
    // 生成入住日期
    const checkInDate = this.generateCheckInDate(persona);
    
    // 生成住宿时长
    const nights = this.randomInt(
      persona.bookingPattern.stayDuration[0],
      persona.bookingPattern.stayDuration[1]
    );
    
    const checkOutDate = DateHelper.addDays(checkInDate, nights);
    
    // 生成客人数量
    const adults = this.randomInt(1, 4);
    const children = persona.bookingPattern.children
      ? this.randomInt(0, persona.bookingPattern.children[1])
      : 0;
    
    // 计算价格
    const basePrice = roomType.price;
    const totalPrice = this.calculateTotalPrice(basePrice, nights);
    
    // 生成创建时间（在入住日期之前）
    const advanceBooking = this.randomInt(
      persona.bookingPattern.advanceBooking[0],
      persona.bookingPattern.advanceBooking[1]
    );
    const createTime = DateHelper.subtractDays(checkInDate, advanceBooking);
    
    return {
      id: this.orderIdCounter++,  // 使用整数ID
      userId: user.id,
      hotelId: hotel.id,
      roomType: roomType.roomType,
      status: 'pending', // 稍后分配
      checkInDate: DateHelper.formatDate(checkInDate),
      checkOutDate: DateHelper.formatDate(checkOutDate),
      nights,
      adults,
      children,
      basePrice,
      totalPrice,
      createTime: DateHelper.formatDateTime(createTime),
      updateTime: DateHelper.formatDateTime(createTime),
      cancelDeadline: DateHelper.formatDateTime(DateHelper.subtractDays(checkInDate, 1)),
      cancelPolicy: JSON.stringify({
        freeCancellation: true,
        deadline: DateHelper.formatDate(DateHelper.subtractDays(checkInDate, 1))
      }),
      logs: JSON.stringify([{
        time: DateHelper.formatDateTime(createTime),
        action: 'created',
        operator: 'user'
      }]),
      riskFlags: JSON.stringify([])
    };
  }

  generateCheckInDate(persona) {
    const today = new Date();
    
    // 根据画像生成入住日期（过去3个月到未来3个月）
    const minDays = -90;
    const maxDays = 90;
    
    let checkInDate;
    let attempts = 0;
    const maxAttempts = 50;
    
    do {
      const daysOffset = this.randomInt(minDays, maxDays);
      checkInDate = DateHelper.addDays(today, daysOffset);
      attempts++;
      
      // 如果是商务旅客，倾向于工作日
      if (persona.id === 'business' && persona.bookingPattern && persona.bookingPattern.daysOfWeek) {
        if (persona.bookingPattern.daysOfWeek.includes(checkInDate.getDay())) {
          break;
        }
      }
      // 如果是家庭度假，倾向于周末
      else if (persona.id === 'family' && persona.bookingPattern && persona.bookingPattern.daysOfWeek) {
        if (persona.bookingPattern.daysOfWeek.includes(checkInDate.getDay())) {
          break;
        }
      }
      // 其他用户随机
      else {
        break;
      }
    } while (attempts < maxAttempts);
    
    return checkInDate;
  }

  calculateTotalPrice(basePrice, nights) {
    // 简单计算：基础价格 × 晚数
    // 可以添加服务费、税费等
    return basePrice * nights;
  }

  distributeStatuses(orders) {
    const distribution = this.config.orderStatusDistribution;
    const today = new Date();
    
    // 计算每种状态的数量
    const completedCount = Math.floor(orders.length * distribution.completed);
    const confirmedCount = Math.floor(orders.length * distribution.confirmed);
    const cancelledCount = Math.floor(orders.length * distribution.cancelled);
    // 剩余的为pending
    
    // 打乱订单顺序
    this.shuffleArray(orders);
    
    let index = 0;
    
    // 分配已完成状态（入住日期必须在过去）
    for (let i = 0; i < completedCount && index < orders.length; index++) {
      const order = orders[index];
      const checkInDate = new Date(order.checkInDate);
      
      if (checkInDate < today) {
        order.status = 'completed';
        order.updateTime = DateHelper.formatDateTime(
          DateHelper.addDays(new Date(order.checkOutDate), this.randomInt(0, 2))
        );
        const logs = JSON.parse(order.logs);
        logs.push({
          time: order.updateTime,
          action: 'completed',
          operator: 'system'
        });
        order.logs = JSON.stringify(logs);
        i++;
      }
    }
    
    // 分配已确认状态（入住日期可以在未来）
    for (let i = 0; i < confirmedCount && index < orders.length; index++) {
      const order = orders[index];
      if (order.status === 'pending') {
        order.status = 'confirmed';
        order.updateTime = DateHelper.formatDateTime(
          DateHelper.addDays(new Date(order.createTime), this.randomInt(0, 2))
        );
        const logs = JSON.parse(order.logs);
        logs.push({
          time: order.updateTime,
          action: 'confirmed',
          operator: 'merchant'
        });
        order.logs = JSON.stringify(logs);
        i++;
      }
    }
    
    // 分配已取消状态
    for (let i = 0; i < cancelledCount && index < orders.length; index++) {
      const order = orders[index];
      if (order.status === 'pending') {
        order.status = 'cancelled';
        order.updateTime = DateHelper.formatDateTime(
          DateHelper.addDays(new Date(order.createTime), this.randomInt(1, 5))
        );
        const logs = JSON.parse(order.logs);
        logs.push({
          time: order.updateTime,
          action: 'cancelled',
          operator: 'user',
          reason: this.selectRandom(['价格原因', '行程变更', '找到更好的酒店', '个人原因']),
          refundRate: 1.0
        });
        order.logs = JSON.stringify(logs);
        i++;
      }
    }
    
    // 剩余的保持pending状态
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

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

module.exports = OrderGenerator;
