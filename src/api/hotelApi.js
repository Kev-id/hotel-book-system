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