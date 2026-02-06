import { createContext, useState, useEffect } from 'react';

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
  };

  // 持久化存储
  useEffect(() => {
    if (user) localStorage.setItem('hotelUser', JSON.stringify(user));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};