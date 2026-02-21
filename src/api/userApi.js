const baseUrl = import.meta.env.VITE_API_URL || '/api';

// 用户登录
export const userLogin = async (username, password) => {
  try {
    const res = await fetch(`${baseUrl}/users?username=${username}&password=${password}`);
    const data = await res.json();
    
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
    const res = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        confirmPwd: password,
        role
      })
    });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || '注册失败');
    }
    
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
    console.error('注册失败', err);
    throw err;
  }
};