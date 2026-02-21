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
  // 从localStorage读取登录态
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem('hotelUser');
    return local ? JSON.parse(local) : null;
  });

  // 登录保存信息
  const login = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('hotelUser', JSON.stringify(userInfo));
    
    // 如果有 token，单独存储
    if (userInfo.token) {
      localStorage.setItem('token', userInfo.token);
    }
  };

  // 登出清除信息
  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotelUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};