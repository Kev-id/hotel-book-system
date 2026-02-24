import { createContext, useState, useContext } from 'react';

export const AuthContext = createContext(null);

// 自定义 hook 用于访问 AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // 从localStorage读取登录态（兼容多个key）
  const [user, setUser] = useState(() => {
    // 优先使用 'user'，然后尝试 'hotelUser'
    const userStr = localStorage.getItem('user') || localStorage.getItem('hotelUser');
    return userStr ? JSON.parse(userStr) : null;
  });

  // 登录保存信息
  const login = (userInfo) => {
    setUser(userInfo);
    // 同时保存到两个key，确保兼容性
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('hotelUser', JSON.stringify(userInfo));
    
    // 如果有 token，单独存储
    if (userInfo.token) {
      localStorage.setItem('token', userInfo.token);
    }
  };

  // 登出清除信息
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('hotelUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};