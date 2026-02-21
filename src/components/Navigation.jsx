import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button, Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pathname = location.pathname;

  // 构造菜单项
  const baseItems = [
    { path: '/', label: '首页' },
    { path: '/list', label: '酒店列表' },
  ];

  // 普通用户和所有登录用户都可以看到"我的订单"
  if (user) {
    baseItems.push({ path: '/orders', label: '我的订单' });
  }

  if (user?.role === 'admin') {
    baseItems.push({ path: '/admin/audit', label: '审核管理' });
  }
  if (user?.role === 'merchant') {
    baseItems.push({ path: '/admin/hotel-form', label: '酒店录入' });
    baseItems.push({ path: '/admin/merchant-orders', label: '订单管理' });
    baseItems.push({ path: '/admin/price-calendar', label: '价格管理' });
    baseItems.push({ path: '/admin/merchant-status', label: '审核状态' });
  }

  if (!user) {
    baseItems.push({ path: '/admin/login', label: '登录' });
    baseItems.push({ path: '/admin/register', label: '注册' });
  }

  const isActive = (path) => {
    if (path === '/list' && pathname.startsWith('/detail')) return true;
    return pathname === path;
  };

  return (
    <nav className="nav-header">
      <div className="nav-wrapper">
        <div className="nav-logo" onClick={() => navigate('/')}>🏨 酒店预订系统</div>

        <div className="nav-menu">
          <div className="nav-links">
            {baseItems.map((item) => (
              <button
                key={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 12 }}>
            {user ? (
              <Space size={12} align="center">
                <Avatar icon={<UserOutlined />} />
                <span className="user-name">{user.username}</span>
                <Button size="small" danger onClick={handleLogout}>退出</Button>
              </Space>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
