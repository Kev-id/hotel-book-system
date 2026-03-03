// 酒店接口封装（适配 Vite 跨域代理）
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || '/api';

// 获取酒店列表（支持筛选）
export const getHotelList = async (params) => {
  try {
    const { data } = await axios.get(`${baseUrl}/hotels`, { params });
    console.log(data);
    return data;
  } catch (err) {
    console.error('获取酒店列表失败：', err);
    return [];
  }
};

// 获取酒店详情
export const getHotelDetail = async (id) => {
  try {
    const { data } = await axios.get(`${baseUrl}/hotels/${id}`);
    return data;
  } catch (err) {
    console.error('获取酒店详情失败：', err);
    return null;
  }
};

// 更新酒店信息(审核/编辑)
export const updateHotel = async (id, hotelData) => {
  try {
    const { data } = await axios.patch(`${baseUrl}/hotels/${id}`, hotelData);
    return data; // 返回 { success: true } 或其他数据
  } catch (err) {
    console.error('更新酒店失败', err.response?.data || err);
    return null;
  }
};

// 新增酒店(商户录入)
export const addHotel = async (hotelData) => {
  try {
    const { data } = await axios.post(`${baseUrl}/hotels`, hotelData);
    return data;
  } catch (err) {
    console.error('新增酒店失败', err);
    return null;
  }
};

// 删除酒店（软删除/下线）
export const deleteHotel = async (id) => {
  try {
    await axios.delete(`${baseUrl}/hotels/${id}`);
    return true;
  } catch (err) {
    console.error('删除酒店失败', err);
    return false;
  }
};

// 恢复已删除的酒店
export const restoreHotel = async (id) => {
  try {
    const { data } = await axios.post(`${baseUrl}/hotels/${id}/restore`);
    return data;
  } catch (err) {
    console.error('恢复酒店失败', err);
    return null;
  }
};

// 获取已删除的酒店列表
export const getDeletedHotels = async () => {
  try {
    const { data } = await axios.get(`${baseUrl}/hotels/deleted/list`);
    return data;
  } catch (err) {
    console.error('获取已删除酒店列表失败：', err);
    return [];
  }
};

// 获取同名酒店的所有房型
export const getHotelRoomTypes = async (id) => {
  try {
    const { data } = await axios.get(`${baseUrl}/hotels/${id}/room-types`);
    return data;
  } catch (err) {
    console.error('获取酒店房型失败：', err);
    return [];
  }
};

// 设置单日价格
export const setPriceCalendar = async (priceData) => {
  try {
    const { data } = await axios.post(`${baseUrl}/hotels/price-calendar`, priceData);
    return data;
  } catch (err) {
    console.error('设置价格失败', err);
    return null;
  }
};

// 批量设置价格
export const setBatchPriceCalendar = async (priceData) => {
  try {
    const { data } = await axios.post(`${baseUrl}/hotels/price-calendar/batch`, priceData);
    return data;
  } catch (err) {
    console.error('批量设置价格失败', err);
    return null;
  }
};

// 获取价格日历
export const getPriceCalendar = async (params) => {
  try {
    const { data } = await axios.get(`${baseUrl}/hotels/price-calendar/query`, { params });
    return data;
  } catch (err) {
    console.error('获取价格日历失败：', err);
    return [];
  }
};

// 计算时间段总价
export const calculatePeriodPrice = async (params) => {
  try {
    const { data } = await axios.get(`${baseUrl}/hotels/price-calendar/calculate`, { params });
    return data;
  } catch (err) {
    console.error('计算价格失败：', err);
    return null;
  }
};
