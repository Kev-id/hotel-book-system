import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { orderApi } from '../../../api/orderApi';
import './styles.css';

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // 如果用户未登录，跳转到登录页
  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  // 获取订单详情
  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getOrderDetail(id);
      setOrder(data);
    } catch (error) {
      console.error('获取订单详情失败:', error);
      // 如果是401错误，跳转到登录页
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
      // 如果是403或404错误，显示错误信息
      if (error.response?.status === 403 || error.response?.status === 404) {
        setOrder(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  // 取消订单
  const handleCancelOrder = async () => {
    try {
      await orderApi.cancelOrder(order.id, cancelReason || '用户取消');
      setCancelModalVisible(false);
      fetchOrderDetail();
    } catch (error) {
      console.error('取消订单失败:', error);
    }
  };

  // 状态标签映射
  const statusMap = {
    pending: { text: '待确认', color: '#faad14' },
    confirmed: { text: '已确认', color: '#52c41a' },
    checked_in: { text: '已入住', color: '#1890ff' },
    checked_out: { text: '已离店', color: '#722ed1' },
    completed: { text: '已完成', color: '#8c8c8c' },
    cancelled: { text: '已取消', color: '#ff4d4f' }
  };

  // 格式化日期
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="error">订单不存在</div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        {/* 返回按钮 */}
        <button className="back-button" onClick={() => navigate('/orders')}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回订单列表
        </button>

        {/* 订单状态卡片 */}
        <div className="status-card">
          <div 
            className="status-badge-large"
            style={{ backgroundColor: statusMap[order.status]?.color }}
          >
            {statusMap[order.status]?.text}
          </div>
          <h2 className="order-id">订单号：{order.id}</h2>
          <p className="create-time">创建时间：{formatDateTime(order.create_time)}</p>
        </div>

        {/* 差异化亮点2：取消倒计时 */}
        {order.cancelCountdown && (
          <div className="countdown-card" style={{ borderColor: order.cancelCountdown.severity === 'error' ? '#ff4d4f' : order.cancelCountdown.severity === 'warning' ? '#faad14' : '#52c41a' }}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <h3>免费取消倒计时</h3>
              <p className="countdown-text">{order.cancelCountdown.message}</p>
              {order.cancelCountdown.hoursLeft > 0 && (
                <p className="countdown-detail">
                  剩余 {order.cancelCountdown.hoursLeft} 小时 {order.cancelCountdown.minutesLeft} 分钟
                </p>
              )}
            </div>
          </div>
        )}

        {/* 酒店信息 */}
        <div className="info-card">
          <h3 className="card-title">酒店信息</h3>
          <div className="hotel-info">
            {(() => {
              // 安全地获取订单图片
              let imageUrl = null;
              if (order.images) {
                let imageArray = [];
                
                if (typeof order.images === 'string') {
                  try {
                    imageArray = JSON.parse(order.images);
                  } catch (e) {
                    console.error('解析图片JSON失败:', e);
                  }
                } else if (Array.isArray(order.images)) {
                  imageArray = order.images;
                }
                
                if (imageArray.length > 0) {
                  imageUrl = imageArray[0];
                }
              }
              
              return imageUrl ? (
                <img src={imageUrl} alt={order.hotelName} className="hotel-image" />
              ) : null;
            })()}
            <div className="hotel-details">
              <h2>{order.hotelName}</h2>
              <div className="info-row">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" strokeWidth="2"/>
                </svg>
                <span>{order.address}</span>
              </div>
              {order.stars && (
                <div className="stars">
                  {'⭐'.repeat(order.stars)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 入住信息 */}
        <div className="info-card">
          <h3 className="card-title">入住信息</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">入住日期</span>
              <span className="value">{formatDate(order.check_in_date)}</span>
            </div>
            <div className="info-item">
              <span className="label">离店日期</span>
              <span className="value">{formatDate(order.check_out_date)}</span>
            </div>
            <div className="info-item">
              <span className="label">入住天数</span>
              <span className="value">{order.nights} 晚</span>
            </div>
            <div className="info-item">
              <span className="label">房型</span>
              <span className="value">{order.room_type}</span>
            </div>
            <div className="info-item">
              <span className="label">成人</span>
              <span className="value">{order.adults} 位</span>
            </div>
            <div className="info-item">
              <span className="label">儿童</span>
              <span className="value">{order.children} 位</span>
            </div>
          </div>
        </div>

        {/* 差异化亮点3：行程小助手 */}
        {order.travelAssistant && (
          <div className="assistant-card">
            <h3 className="card-title">🎒 行程小助手</h3>
            <p className="days-until">距离入住还有 <strong>{order.travelAssistant.daysUntilCheckIn}</strong> 天</p>
            <div className="tips-list">
              {order.travelAssistant.tips.map((tip, index) => (
                <div key={index} className="tip-item">
                  <span className="tip-icon">{tip.icon}</span>
                  <div className="tip-content">
                    <h4>{tip.title}</h4>
                    <p>{tip.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 价格信息 */}
        <div className="info-card">
          <h3 className="card-title">价格信息</h3>
          <div className="price-info">
            <div className="price-row">
              <span>房费 ({order.nights} 晚)</span>
              <span>¥{order.total_price}</span>
            </div>
            <div className="price-row total">
              <span>总计</span>
              <span className="total-price">¥{order.total_price}</span>
            </div>
          </div>
        </div>

        {/* 操作日志 */}
        {order.logs && order.logs.length > 0 && (
          <div className="info-card">
            <h3 className="card-title">操作日志</h3>
            <div className="timeline">
              {order.logs.map((log, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p className="timeline-action">{log.action}</p>
                    <p className="timeline-time">{formatDateTime(log.time)}</p>
                    {log.note && <p className="timeline-note">{log.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <button 
            className="cancel-button"
            onClick={() => setCancelModalVisible(true)}
          >
            取消订单
          </button>
        )}

        {/* 取消确认弹窗 */}
        {cancelModalVisible && (
          <div className="modal-overlay" onClick={() => setCancelModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>确认取消订单</h3>
              <p>取消后将根据取消政策进行退款</p>
              <textarea
                placeholder="请输入取消原因（可选）"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
              <div className="modal-actions">
                <button 
                  className="modal-button secondary"
                  onClick={() => setCancelModalVisible(false)}
                >
                  我再想想
                </button>
                <button 
                  className="modal-button primary"
                  onClick={handleCancelOrder}
                >
                  确认取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
