const pool = require('../config/database');

// 差异化亮点2：取消智能提醒
function getCancelCountdown(order) {
  // 只有待确认和已确认的订单才需要倒计时
  if (order.status !== 'pending' && order.status !== 'confirmed') {
    return null;
  }
  
  const now = new Date();
  const deadline = new Date(order.cancel_deadline);
  const hoursLeft = Math.max(0, (deadline - now) / (1000 * 60 * 60));
  
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
    const { userId, status, hotelId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT o.*, h.name as hotelName, h.address, h.images, u.username
      FROM orders o
      LEFT JOIN hotels h ON o.hotel_id = h.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (userId) {
      query += ' AND o.user_id = ?';
      params.push(userId);
    }
    
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
      logs: order.logs || [],
      riskFlags: order.risk_flags || [],
      images: order.images || [],
      cancelCountdown: getCancelCountdown(order)
    }));
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];
    if (userId) {
      countQuery += ' AND user_id = ?';
      countParams.push(userId);
    }
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (hotelId) {
      countQuery += ' AND hotel_id = ?';
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
    
    const [orders] = await pool.query(`
      SELECT o.*, h.name as hotelName, h.address, h.images, h.stars,
             u.username, u.phone, u.email
      FROM orders o
      LEFT JOIN hotels h ON o.hotel_id = h.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    const order = {
      ...orders[0],
      cancelPolicy: orders[0].cancel_policy,
      logs: orders[0].logs || [],
      riskFlags: orders[0].risk_flags || [],
      images: orders[0].images || []
    };
    
    res.json(order);
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ error: error.message });
  }
};

// 创建订单
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
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
    
    // 验证必填字段
    if (!userId || !hotelId || !roomType || !checkInDate || !checkOutDate || !totalPrice) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    // 计算取消截止时间（入住前24小时）
    const cancelDeadline = new Date(checkInDate);
    cancelDeadline.setHours(cancelDeadline.getHours() - 24);
    
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
      checkInDate, checkOutDate, nights, adults, children,
      totalPrice, cancelDeadline.toISOString(),
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
    
    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '无效的订单状态' });
    }
    
    // 获取当前订单
    const [orders] = await pool.query('SELECT logs FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    const logs = orders[0].logs || [];
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
    const { reason = '用户取消', operator = 'user' } = req.body;
    
    // 获取当前订单
    const [orders] = await pool.query(
      'SELECT status, cancel_deadline, logs FROM orders WHERE id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    const order = orders[0];
    
    // 检查是否可以取消
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: '订单已取消' });
    }
    
    if (order.status === 'completed') {
      return res.status(400).json({ error: '已完成的订单无法取消' });
    }
    
    // 检查取消截止时间
    const now = new Date();
    const deadline = new Date(order.cancel_deadline);
    const canCancel = now < deadline;
    
    const logs = JSON.parse(order.logs || '[]');
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
    const { userId, hotelId } = req.query;
    
    let query = `
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
      WHERE 1=1
    `;
    const params = [];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    if (hotelId) {
      query += ' AND hotel_id = ?';
      params.push(hotelId);
    }
    
    const [stats] = await pool.query(query, params);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('获取订单统计失败:', error);
    res.status(500).json({ error: error.message });
  }
};
