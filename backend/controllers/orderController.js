const pool = require('../config/database');
const { DateCalculator, DateValidator } = require('../utils/dateUtils');

console.log('✅ orderController.js 已加载 (带权限验证)');

// 差异化亮点2：取消智能提醒
function getCancelCountdown(order) {
  // 只有待确认和已确认的订单才需要倒计时
  if (order.status !== 'pending' && order.status !== 'confirmed') {
    return null;
  }
  
  const hoursLeft = Math.max(0, DateCalculator.hoursUntil(order.cancel_deadline));
  
  // 根据剩余时间设置紧急程度
  let severity = 'success';
  if (hoursLeft < 12) {
    severity = 'error';
  } else if (hoursLeft < 24) {
    severity = 'warning';
  }
  
  return {
    hoursLeft: Math.floor(hoursLeft),
    minutesLeft: Math.floor((hoursLeft % 1) * 60),
    severity,
    message: hoursLeft > 0 
      ? `距免费取消还剩 ${Math.floor(hoursLeft)} 小时`
      : '已超过免费取消时间'
  };
}
// 差异化亮点3：行程小助手（简化版，后续升级接入天气API）
function getTravelAssistant(order) {
  const tips = [];
  const checkIn = new Date(order.check_in_date);
  const now = new Date();
  const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));
  
  // 只在入住前7天内显示提示
  if (daysUntilCheckIn > 7 || daysUntilCheckIn < 0) {
    return null;
  }
  
  // 天气建议（基于月份，后续升级为真实天气API）
  const month = checkIn.getMonth() + 1;
  if (month >= 6 && month <= 8) {
    tips.push({
      icon: '☀️',
      title: '天气提示',
      content: '夏季炎热，建议携带防晒用品和轻便衣物'
    });
  } else if (month >= 12 || month <= 2) {
    tips.push({
      icon: '❄️',
      title: '天气提示',
      content: '冬季寒冷，建议携带保暖衣物'
    });
  } else if (month >= 3 && month <= 5) {
    tips.push({
      icon: '🌸',
      title: '天气提示',
      content: '春季多雨，建议携带雨具'
    });
  } else {
    tips.push({
      icon: '🍂',
      title: '天气提示',
      content: '秋季温差大，建议携带外套'
    });
  }
  
  // 行李建议
  if (order.nights > 3) {
    tips.push({
      icon: '🧳',
      title: '行李建议',
      content: `入住${order.nights}晚，建议携带常用药品和洗漱用品`
    });
  }
  
  // 儿童提示
  if (order.children > 0) {
    tips.push({
      icon: '👶',
      title: '儿童提示',
      content: '携带儿童出行，建议提前确认酒店是否提供儿童设施'
    });
  }
  
  // 入住提醒
  if (daysUntilCheckIn <= 1) {
    tips.push({
      icon: '⏰',
      title: '入住提醒',
      content: '即将入住，请提前准备好身份证件'
    });
  }
  
  return {
    daysUntilCheckIn,
    tips
  };
}

// 获取订单列表
exports.getOrders = async (req, res) => {
  try {
    // 从认证中间件获取当前用户ID和角色
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log('=== getOrders被调用 ===');
    console.log('当前用户ID:', userId);
    console.log('当前用户角色:', userRole);
    console.log('请求参数:', req.query);
    
    const { status, hotelId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query, params;
    
    // 根据角色区分查询逻辑
    if (userRole === 'merchant') {
      // 商户查询: 查询自己酒店的所有订单
      query = `
        SELECT o.*, h.name as hotelName, h.address, h.images, u.username, u.phone, u.email
        FROM orders o
        LEFT JOIN hotels h ON o.hotel_id = h.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE h.merchantId = ?
      `;
      params = [userId];
      console.log('商户查询模式: 查询商户酒店的订单');
    } else {
      // 普通用户查询: 查询自己创建的订单
      query = `
        SELECT o.*, h.name as hotelName, h.address, h.images, u.username
        FROM orders o
        LEFT JOIN hotels h ON o.hotel_id = h.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.user_id = ?
      `;
      params = [userId];
      console.log('用户查询模式: 查询用户自己的订单');
    }
    
    console.log('SQL查询:', query);
    console.log('SQL参数:', params);
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    if (hotelId) {
      query += ' AND o.hotel_id = ?';
      params.push(hotelId);
    }
    
    query += ' ORDER BY o.create_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [orders] = await pool.query(query, params);
    
    // 格式化字段名并添加取消倒计时（差异化亮点2）
    const formattedOrders = orders.map(order => ({
      ...order,
      cancelPolicy: order.cancel_policy,
      logs: (() => {
        const rawLogs = order.logs;
        if (!rawLogs) return [];
        if (typeof rawLogs === 'string') {
          try {
            const parsed = JSON.parse(rawLogs);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        }
        return Array.isArray(rawLogs) ? rawLogs : [];
      })(),
      riskFlags: (() => {
        const rawFlags = order.risk_flags;
        if (!rawFlags) return [];
        if (typeof rawFlags === 'string') {
          try {
            const parsed = JSON.parse(rawFlags);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        }
        return Array.isArray(rawFlags) ? rawFlags : [];
      })(),
      images: (() => {
        const rawImages = order.images;
        if (!rawImages) return [];
        if (typeof rawImages === 'string') {
          try {
            const parsed = JSON.parse(rawImages);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        }
        return Array.isArray(rawImages) ? rawImages : [];
      })(),
      cancelCountdown: getCancelCountdown(order)
    }));
    
    // 获取总数
    let countQuery, countParams;
    
    if (userRole === 'merchant') {
      countQuery = 'SELECT COUNT(*) as total FROM orders o LEFT JOIN hotels h ON o.hotel_id = h.id WHERE h.merchantId = ?';
      countParams = [userId];
    } else {
      countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
      countParams = [userId];
    }
    
    if (status) {
      countQuery += ' AND o.status = ?';
      countParams.push(status);
    }
    if (hotelId) {
      countQuery += ' AND o.hotel_id = ?';
      countParams.push(hotelId);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    
    res.json({
      orders: formattedOrders,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取订单详情
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query, params;
    
    if (userRole === 'merchant') {
      // 商户查询: 可以查看自己酒店的订单
      query = `
        SELECT o.*, h.name as hotelName, h.address, h.images, h.stars,
               u.username, u.phone, u.email
        FROM orders o
        LEFT JOIN hotels h ON o.hotel_id = h.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ? AND h.merchantId = ?
      `;
      params = [id, userId];
    } else {
      // 普通用户查询: 只能查看自己的订单
      query = `
        SELECT o.*, h.name as hotelName, h.address, h.images, h.stars,
               u.username, u.phone, u.email
        FROM orders o
        LEFT JOIN hotels h ON o.hotel_id = h.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ? AND o.user_id = ?
      `;
      params = [id, userId];
    }
    
    const [orders] = await pool.query(query, params);
    
    if (orders.length === 0) {
      return res.status(404).json({ 
        error: '订单不存在或无权访问',
        message: '该订单不存在或您没有权限查看'
      });
    }
    
    const order = {
      ...orders[0],
      cancelPolicy: orders[0].cancel_policy,
      logs: (() => {
        const rawLogs = orders[0].logs;
        if (!rawLogs) return [];
        if (typeof rawLogs === 'string') {
          try {
            const parsed = JSON.parse(rawLogs);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        }
        return Array.isArray(rawLogs) ? rawLogs : [];
      })(),
      riskFlags: (() => {
        const rawFlags = orders[0].risk_flags;
        if (!rawFlags) return [];
        if (typeof rawFlags === 'string') {
          try {
            const parsed = JSON.parse(rawFlags);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        }
        return Array.isArray(rawFlags) ? rawFlags : [];
      })(),
      images: (() => {
        const rawImages = orders[0].images;
        if (!rawImages) return [];
        if (typeof rawImages === 'string') {
          try {
            const parsed = JSON.parse(rawImages);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        }
        return Array.isArray(rawImages) ? rawImages : [];
      })(),
      cancelCountdown: getCancelCountdown(orders[0]),
      travelAssistant: getTravelAssistant(orders[0])
    };
    
    res.json(order);
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 创建订单
exports.createOrder = async (req, res) => {
  console.log('=== 创建订单函数被调用 ===');
  try {
    // 从认证中间件获取当前用户ID
    const userId = req.user.id;
    
    const {
      hotelId,
      roomType,
      checkInDate,
      checkOutDate,
      nights,
      adults,
      children = 0,
      totalPrice,
      cancelPolicy
    } = req.body;
    
    console.log('接收到的数据:', { userId, hotelId, checkInDate, checkOutDate });
    
    // 验证必填字段
    if (!hotelId || !roomType || !checkInDate || !checkOutDate || !totalPrice) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    // 验证日期格式
    if (!DateValidator.isValidDateFormat(checkInDate)) {
      return res.status(400).json({ error: '入住日期格式错误，请使用 YYYY-MM-DD 格式' });
    }
    
    if (!DateValidator.isValidDateFormat(checkOutDate)) {
      return res.status(400).json({ error: '退房日期格式错误，请使用 YYYY-MM-DD 格式' });
    }
    
    // 验证业务规则
    if (!DateValidator.isValidCheckOutDate(checkInDate, checkOutDate)) {
      return res.status(400).json({ error: '退房日期必须晚于入住日期' });
    }
    
    // 计算取消截止时间（使用日期工具类，避免时区转换）
    const cancelDeadline = DateCalculator.calculateCancelDeadline(checkInDate);
    
    console.log('计算的取消截止时间:', cancelDeadline);
    
    const logs = [{
      time: new Date().toISOString(),
      action: 'created',
      operator: 'user',
      note: '订单创建'
    }];
    
    const [result] = await pool.query(`
      INSERT INTO orders (
        user_id, hotel_id, room_type, status,
        check_in_date, check_out_date, nights, adults, children,
        total_price, cancel_deadline, cancel_policy, logs
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, hotelId, roomType,
      checkInDate,      // 直接使用字符串，不进行时区转换
      checkOutDate,     // 直接使用字符串，不进行时区转换
      nights, adults, children,
      totalPrice, 
      cancelDeadline,   // 使用工具类计算的截止时间
      JSON.stringify(cancelPolicy || {}),
      JSON.stringify(logs)
    ]);
    
    res.json({
      success: true,
      orderId: result.insertId,
      message: '订单创建成功'
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 更新订单状态
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, operator = 'system', note = '' } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('=== updateOrderStatus 被调用 ===');
    console.log('订单ID:', id);
    console.log('用户ID:', userId);
    console.log('用户角色:', userRole);
    console.log('目标状态:', status);
    
    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '无效的订单状态' });
    }
    
    // 获取当前订单并验证权限
    let query, params;
    
    if (userRole === 'merchant') {
      // 商户只能更新自己酒店的订单
      console.log('权限模式: 商户');
      query = `
        SELECT o.logs, o.status, h.merchantId
        FROM orders o
        LEFT JOIN hotels h ON o.hotel_id = h.id
        WHERE o.id = ? AND h.merchantId = ?
      `;
      params = [id, userId];
    } else if (userRole === 'admin') {
      // 管理员可以更新所有订单
      console.log('权限模式: 管理员');
      query = 'SELECT logs, status FROM orders WHERE id = ?';
      params = [id];
    } else {
      // 普通用户不能更新订单状态
      console.log('权限模式: 普通用户 - 拒绝访问');
      return res.status(403).json({ 
        error: '权限不足',
        message: '您没有权限更新订单状态'
      });
    }
    
    console.log('执行查询:', query);
    console.log('查询参数:', params);
    
    const [orders] = await pool.query(query, params);
    
    console.log('查询结果数量:', orders.length);
    
    if (orders.length === 0) {
      return res.status(404).json({ 
        error: '订单不存在或无权操作',
        message: '该订单不存在或您没有权限操作'
      });
    }
    
    // 确保 logs 是数组
    let logs = [];
    if (orders[0].logs) {
      console.log('原始 logs 类型:', typeof orders[0].logs);
      console.log('原始 logs 值:', orders[0].logs);
      try {
        const parsed = typeof orders[0].logs === 'string' ? JSON.parse(orders[0].logs) : orders[0].logs;
        console.log('解析后的类型:', typeof parsed);
        console.log('是否为数组:', Array.isArray(parsed));
        if (Array.isArray(parsed)) {
          logs = parsed;
        } else {
          console.error('解析结果不是数组，使用空数组');
        }
      } catch (e) {
        console.error('解析 logs 失败，使用空数组', e);
      }
    }
    
    console.log('最终 logs 类型:', typeof logs);
    console.log('最终 logs 是否为数组:', Array.isArray(logs));
    
    logs.push({
      time: new Date().toISOString(),
      action: status,
      operator,
      note
    });
    
    await pool.query(
      'UPDATE orders SET status = ?, logs = ?, update_time = NOW() WHERE id = ?',
      [status, JSON.stringify(logs), id]
    );
    
    res.json({ success: true, message: '订单状态更新成功' });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 取消订单
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;  // 从认证中间件获取当前用户ID
    const { reason = '用户取消', operator = 'user' } = req.body;
    
    // 获取当前订单并验证所有权
    const [orders] = await pool.query(
      'SELECT status, cancel_deadline, logs, user_id FROM orders WHERE id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    const order = orders[0];
    
    // 验证订单所有权
    if (order.user_id !== userId) {
      return res.status(403).json({ 
        error: '无权操作',
        message: '您没有权限取消此订单'
      });
    }
    
    // 检查是否可以取消
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: '订单已取消' });
    }
    
    if (order.status === 'completed') {
      return res.status(400).json({ error: '已完成的订单无法取消' });
    }
    
    if (order.status === 'checked_in' || order.status === 'checked_out') {
      return res.status(400).json({ error: '已入住或已退房的订单无法取消' });
    }
    
    // 检查取消截止时间
    const now = new Date();
    const deadline = new Date(order.cancel_deadline);
    const canCancel = now < deadline;
    
    // 确保 logs 是数组
    let logs = [];
    if (order.logs) {
      try {
        const parsed = typeof order.logs === 'string' ? JSON.parse(order.logs) : order.logs;
        if (Array.isArray(parsed)) {
          logs = parsed;
        }
      } catch (e) {
        console.error('解析 logs 失败，使用空数组');
      }
    }
    
    logs.push({
      time: new Date().toISOString(),
      action: 'cancelled',
      operator,
      note: reason,
      canRefund: canCancel
    });
    
    await pool.query(
      'UPDATE orders SET status = "cancelled", logs = ?, update_time = NOW() WHERE id = ?',
      [JSON.stringify(logs), id]
    );
    
    res.json({
      success: true,
      message: '订单取消成功',
      canRefund: canCancel
    });
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 获取订单统计
exports.getOrderStats = async (req, res) => {
  try {
    // 从认证中间件获取当前用户ID和角色
    const userId = req.user.id;
    const userRole = req.user.role;
    const { hotelId } = req.query;
    
    let query, params;
    
    if (userRole === 'merchant') {
      // 商户统计: 统计自己酒店的订单
      query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN o.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN o.status = 'checked_in' THEN 1 ELSE 0 END) as checkedIn,
          SUM(CASE WHEN o.status = 'checked_out' THEN 1 ELSE 0 END) as checkedOut,
          SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
          SUM(o.total_price) as totalRevenue
        FROM orders o
        LEFT JOIN hotels h ON o.hotel_id = h.id
        WHERE h.merchantId = ?
      `;
      params = [userId];
    } else {
      // 用户统计: 统计自己的订单
      query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as checkedIn,
          SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END) as checkedOut,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
          SUM(total_price) as totalRevenue
        FROM orders
        WHERE user_id = ?
      `;
      params = [userId];
    }
    
    if (hotelId) {
      query += ' AND o.hotel_id = ?';
      params.push(hotelId);
    }
    
    const [stats] = await pool.query(query, params);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('获取订单统计失败:', error);
    res.status(500).json({ error: error.message });
  }
};
