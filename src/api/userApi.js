const baseUrl = '/api';

// 用户登录
export const userLogin = async (username, password, role) => {
  try {
    const res = await fetch(`${baseUrl}/users?username=${username}&password=${password}&role=${role}`);
    const data = await res.json();
    return data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('登录失败', err);
    return null;
  }
};

// 用户注册
export const userRegister = async (userData) => {
  try {
    const res = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  } catch (err) {
    console.error('注册失败', err);
    return null;
  }
};

// 更新酒店信息(审核/编辑)
export const updateHotel = async (id, hotelData) => {
  try {
    const res = await fetch(`${baseUrl}/hotels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData)
    });
    return await res.json();
  } catch (err) {
    console.error('更新酒店失败', err);
    return null;
  }
};

// 新增酒店(商户录入)
export const addHotel = async (hotelData) => {
  try {
    const res = await fetch(`${baseUrl}/hotels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData)
    });
    return await res.json();
  } catch (err) {
    console.error('新增酒店失败', err);
    return null;
  }
};

// 新增：删除酒店
export const deleteHotel = async (id) => {
  try {
    const res = await fetch(`${baseUrl}/hotels/${id}`, {
      method: 'DELETE', // DELETE请求
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok; // 返回是否删除成功
  } catch (err) {
    console.error('删除酒店失败', err);
    return false;
  }
};