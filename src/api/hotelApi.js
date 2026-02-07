// 酒店接口封装（适配 Vite 跨域代理）
const baseUrl = '/api';

// 获取酒店列表（支持筛选）
export const getHotelList = async (params) => {
  try {
    const query = new URLSearchParams(params).toString();
    console.log(query);
    const res = await fetch(`${baseUrl}/hotels?${query}`);
    if (!res.ok) throw new Error('请求失败');
    console.log(res);
    return await res.json();
  } catch (err) {
    console.error('获取酒店列表失败：', err);
    return [];
  }
};

// 获取酒店详情
export const getHotelDetail = async (id) => {
  try {
    const res = await fetch(`${baseUrl}/hotels/${id}`);
    if (!res.ok) throw new Error('请求失败');
    return await res.json();
  } catch (err) {
    console.error('获取酒店详情失败：', err);
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
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('更新失败:', errorData);
      throw new Error(errorData.error || '更新失败');
    }
    const data = await res.json();
    return data; // 返回 { success: true } 或其他数据
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
    if (!res.ok) throw new Error('新增失败');
    return await res.json();
  } catch (err) {
    console.error('新增酒店失败', err);
    return null;
  }
};

// 删除酒店
export const deleteHotel = async (id) => {
  try {
    const res = await fetch(`${baseUrl}/hotels/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch (err) {
    console.error('删除酒店失败', err);
    return false;
  }
};

// 获取同名酒店的所有房型
export const getHotelRoomTypes = async (id) => {
  try {
    const res = await fetch(`${baseUrl}/hotels/${id}/room-types`);
    if (!res.ok) throw new Error('请求失败');
    return await res.json();
  } catch (err) {
    console.error('获取酒店房型失败：', err);
    return [];
  }
};