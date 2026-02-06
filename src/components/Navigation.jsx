import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, Button, Avatar, Space } from 'antd';
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

  // 选中菜单 key（针对子路由做简单映射）
  const pathname = location.pathname;
  const selectedKey = pathname.startsWith('/detail') ? '/list' : pathname;

  // 构造菜单项
  const baseItems = [
    { key: '/', label: '首页' },
    { key: '/list', label: '酒店列表' },
  ];

  if (user?.role === 'admin') {
    baseItems.push({ key: '/admin/audit', label: '审核管理' });
  }
  if (user?.role === 'merchant') {
    baseItems.push({ key: '/admin/hotel-form', label: '酒店录入' });
  }

  if (!user) {
    baseItems.push({ key: '/admin/login', label: '登录' });
    baseItems.push({ key: '/admin/register', label: '注册' });
  }

  return (
    <nav className="nav-header">
      <div className="nav-wrapper">
        <div className="nav-logo" onClick={() => navigate('/')}>🏨 酒店预订系统</div>

        <div className="nav-menu">
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => navigate(key)}
            className="nav-ant-menu"
            overflowedIndicator={null}
          >
            {baseItems.map((it) => (
              <Menu.Item key={it.key}>{it.label}</Menu.Item>
            ))}
          </Menu>

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
