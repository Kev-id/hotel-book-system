import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { orderApi } from '../../../api/orderApi';
import './styles.css';

const MerchantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // 权限检查
  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else if (user.role !== 'merchant') {
      navigate('/');
    }
  }, [user, navigate]);

  // 获取订单统计
  const fetchStats = async () => {
    try {
      const data = await orderApi.getOrderStats({ viewMode: 'management' });
      setStats(data);
    } catch (error) {
      console.error('获取订单统计失败:', error);
    }
  };

  // 获取订单列表
  const fetchOrders = async (status = null) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const params = {
        viewMode: 'management'  // 商家管理模式
      };
      if (status && status !== 'all') {
        params.status = status;
      }
      const data = await orderApi.getOrders(params);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('获取订单列表失败:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const status = activeTab === 'all' ? null : activeTab;
    fetchOrders(status);
  }, [activeTab, user]);

  // 状态标签映射
  const statusMap = {
    pending: { text: '待确认', color: '#faad14', bgColor: '#fff7e6' },
    confirmed: { text: '已确认', color: '#52c41a', bgColor: '#f6ffed' },
    checked_in: { text: '已入住', color: '#1890ff', bgColor: '#e6f7ff' },
    checked_out: { text: '已离店', color: '#722ed1', bgColor: '#f9f0ff' },
    completed: { text: '已完成', color: '#8c8c8c', bgColor: '#fafafa' },
    cancelled: { text: '已取消', color: '#ff4d4f', bgColor: '#fff1f0' }
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

  // 格式化日期时间
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 快速操作
  const handleQuickAction = async (orderId, newStatus, note) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus, note);
      // 刷新列表
      const status = activeTab === 'all' ? null : activeTab;
      fetchOrders(status);
      fetchStats();
    } catch (error) {
      console.error('更新订单状态失败:', error);
      alert('操作失败: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="merchant-orders-page">
      <div className="merchant-orders-container">
        <h1 className="page-title">订单管理</h1>

        {/* 订单统计卡片 */}
        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e6f7ff' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1890ff">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="9" strokeWidth="2"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total || 0}</div>
                <div className="stat-label">总订单</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff7e6' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#faad14">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.pending || 0}</div>
                <div className="stat-label">待确认</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f6ffed' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#52c41a">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.confirmed || 0}</div>
                <div className="stat-label">已确认</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff1f0' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#ff4d4f">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.cancelled || 0}</div>
                <div className="stat-label">已取消</div>
              </div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-icon" style={{ backgroundColor: '#f0f5ff' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1890ff">
                  <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">¥{stats.totalRevenue || 0}</div>
                <div className="stat-label">总收入</div>
              </div>
            </div>
          </div>
        )}

        {/* 状态筛选标签 */}
        <div className="status-tabs">
          {[
            { key: 'all', label: '全部', count: stats?.total },
            { key: 'pending', label: '待确认', count: stats?.pending },
            { key: 'confirmed', label: '已确认', count: stats?.confirmed },
            { key: 'checked_in', label: '已入住', count: stats?.checkedIn },
            { key: 'completed', label: '已完成', count: stats?.completed },
            { key: 'cancelled', label: '已取消', count: stats?.cancelled }
          ].map(tab => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.count !== undefined && <span className="tab-count">({tab.count})</span>}
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
              <line x1="9" y1="9" x2="15" y2="9" strokeWidth="2"/>
              <line x1="9" y1="13" x2="15" y2="13" strokeWidth="2"/>
            </svg>
            <p>暂无订单</p>
          </div>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>客户</th>
                  <th>酒店</th>
                  <th>房型</th>
                  <th>入住日期</th>
                  <th>退房日期</th>
                  <th>天数</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id}</td>
                    <td>{order.username}</td>
                    <td className="hotel-name">{order.hotelName}</td>
                    <td>{order.room_type}</td>
                    <td>{formatDate(order.check_in_date)}</td>
                    <td>{formatDate(order.check_out_date)}</td>
                    <td>{order.nights}晚</td>
                    <td className="price">¥{order.total_price}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ 
                          color: statusMap[order.status]?.color,
                          backgroundColor: statusMap[order.status]?.bgColor
                        }}
                      >
                        {statusMap[order.status]?.text}
                      </span>
                    </td>
                    <td className="datetime">{formatDateTime(order.create_time)}</td>
                    <td className="actions">
                      <button
                        className="btn-detail"
                        onClick={() => navigate(`/admin/merchant-orders/${order.id}`)}
                      >
                        详情
                      </button>
                      {order.status === 'pending' && (
                        <button
                          className="btn-confirm"
                          onClick={() => handleQuickAction(order.id, 'confirmed', '商户确认订单')}
                        >
                          确认
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          className="btn-checkin"
                          onClick={() => handleQuickAction(order.id, 'checked_in', '客户已入住')}
                        >
                          入住
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantOrders;
