import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// 鉴权守卫：allowedRoles为允许的角色数组
const AuthGuard = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // 未登录 → 跳登录
  if (!user) return <Navigate to="/admin/login" replace />;
  // 角色不匹配 → 无权限
  if (!allowedRoles.includes(user.role)) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>
      <h3>无访问权限</h3>
      <button onClick={() => window.history.back()} style={{ marginTop: '20px', padding: '8px 16px', background: '#1677ff', color: '#fff', borderRadius: '4px' }}>返回</button>
    </div>;
  }
  return children;
};

export default AuthGuard;