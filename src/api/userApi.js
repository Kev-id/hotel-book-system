const baseUrl = import.meta.env.VITE_API_URL || '/api';

// 用户登录
export const userLogin = async (username, password) => {
  try {
    const res = await fetch(`${baseUrl}/users?username=${username}&password=${password}`);
    const data = await res.json();
    return data.length > 0 ? data[0] : null;
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
    
    return data && data.id ? data : null;
  } catch (err) {
    console.error('注册失败', err);
    throw err;
  }
};