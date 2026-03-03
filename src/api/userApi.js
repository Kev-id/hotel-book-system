import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || '/api';

// 用户登录
export const userLogin = async (username, password) => {
  try {
    const { data } = await axios.get(`${baseUrl}/users`, {
      params: { username, password }
    });
    
    // 新格式：返回 { success, user, token, message }
    if (data.success && data.user && data.token) {
      return {
        ...data.user,
        token: data.token
      };
    }
    
    // 旧格式兼容：返回数组
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return null;
  } catch (err) {
    console.error('登录失败', err);
    return null;
  }
};

// 用户注册
export const userRegister = async (username, password, role = 'user') => {
  try {
    const { data } = await axios.post(`${baseUrl}/users`, {
      username,
      password,
      confirmPwd: password,
      role
    });
    
    // 新格式：返回 { success, user, token, message }
    if (data.success && data.user && data.token) {
      return {
        ...data.user,
        token: data.token
      };
    }
    
    // 旧格式兼容
    return data && data.id ? data : null;
  } catch (err) {
    console.error('注册失败', err.response?.data || err);
    throw err;
  }
};