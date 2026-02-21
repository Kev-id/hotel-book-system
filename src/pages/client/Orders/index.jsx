import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { orderApi } from '../../../api/orderApi';
import './styles.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // 如果用户未登录，跳转到登录页
  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  // 获取订单列表
  const fetchOrders = async (status = null) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 不再需要传递userId，后端会从认证信息中获取
      const params = {};
      if (status && status !== 'all') {
        params.status = status;
      }
      const data = await orderApi.getOrders(params);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('获取订单列表失败:', error);
      // 如果是401错误，跳转到登录页
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const status = activeTab === 'all' ? null : activeTab;
    fetchOrders(status);
  }, [activeTab, user]);

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
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // 渲染取消倒计时（差异化亮点2）
  const renderCancelCountdown = (countdown) => {
    if (!countdown) return null;

    const colorMap = {
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f'
    };

    return (
      <div className="cancel-countdown" style={{ color: colorMap[countdown.severity] }}>
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>{countdown.message}</span>
      </div>
    );
  };

  // 渲染风险标记（差异化亮点1）
  const renderRiskFlags = (riskFlags) => {
    if (!riskFlags || riskFlags.length === 0) return null;

    return (
      <div className="risk-flags">
        {riskFlags.map((flag, index) => (
          <div key={index} className={`risk-flag ${flag.severity}`}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="2"/>
              <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{flag.message}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1 className="page-title">我的订单</h1>

        {/* 状态筛选标签 */}
        <div className="status-tabs">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待确认' },
            { key: 'confirmed', label: '已确认' },
            { key: 'checked_in', label: '已入住' },
            { key: 'completed', label: '已完成' },
            { key: 'cancelled', label: '已取消' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 订单列表 */}
        {loading ? (
          <div className="loading">加载中...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="9" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="13" x2="15" y2="13" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>暂无订单</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div
                key={order.id}
                className="order-card"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                {/* 酒店图片 */}
                <div className="order-image">
                  <img
                    src={(() => {
                      // 安全地获取订单图片
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
                          return imageArray[0];
                        }
                      }
                      return '/placeholder-hotel.jpg';
                    })()}
                    alt={order.hotelName}
                  />
                  <div
                    className="status-badge"
                    style={{ backgroundColor: statusMap[order.status]?.color }}
                  >
                    {statusMap[order.status]?.text}
                  </div>
                </div>

                {/* 订单信息 */}
                <div className="order-info">
                  <h3 className="hotel-name">{order.hotelName}</h3>
                  <div className="order-details">
                    <div className="detail-row">
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                      </svg>
                      <span>
                        {formatDate(order.check_in_date)} - {formatDate(order.check_out_date)} · {order.nights}晚
                      </span>
                    </div>
                    <div className="detail-row">
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                      </svg>
                      <span>{order.adults}位成人 {order.children > 0 && `· ${order.children}位儿童`}</span>
                    </div>
                  </div>

                  {/* 差异化亮点1：风险标记 */}
                  {renderRiskFlags(order.riskFlags)}

                  {/* 差异化亮点2：取消倒计时 */}
                  {renderCancelCountdown(order.cancelCountdown)}

                  <div className="order-footer">
                    <span className="price">¥{order.total_price}</span>
                    <button className="view-detail-btn">
                      查看详情
                      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
