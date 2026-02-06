import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

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
  };

  // 登出清除信息
  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotelUser');
    // 清除所有相关的本地存储
    localStorage.removeItem('hotelUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};