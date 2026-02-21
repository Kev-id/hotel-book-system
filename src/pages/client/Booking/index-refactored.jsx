import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getHotelDetail, calculatePeriodPrice } from '../../../api/hotelApi';
import { orderApi } from '../../../api/orderApi';
import { useAuth } from '../../../context/AuthContext';
import dayjs from 'dayjs';
import { DateFormatter, DateValidator } from '../../../utils/dateUtils';
import './styles.css';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [priceInfo, setPriceInfo] = useState(null);
  const [validationError, setValidationError] = useState(null);
  
  // 从 URL 获取预订参数
  const params = new URLSearchParams(location.search);
  const hotelId = params.get('hotelId');
  const roomTypeIdRaw = params.get('roomTypeId');
  const checkInRaw = params.get('checkIn');
  const checkOutRaw = params.get('checkOut');
  
  // 验证并清理 roomTypeId
  const roomTypeId = (() => {
    if (!roomTypeIdRaw || 
        roomTypeIdRaw === '[object Object]' || 
        roomTypeIdRaw === 'undefined' || 
        roomTypeIdRaw === 'null') {
      return null;
    }
    const parsed = parseInt(roomTypeIdRaw);
    return isNaN(parsed) ? null : parsed;
  })();
  
  // 标准化日期
  const checkIn = DateFormatter.normalize(checkInRaw);
  const checkOut = DateFormatter.normalize(checkOutRaw);
  
  // 表单数据
  const [formData, setFormData] = useState({
    adults: 1,
    children: 0,
    contactName: '',
    contactPhone: '',
    specialRequests: ''
  });
  
  // 初始化表单数据（仅在用户信息变化时）
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: user.username || prev.contactName,
        contactPhone: user.phone || prev.contactPhone
      }));
    }
  }, [user?.id]); // 只依赖用户ID，避免频繁更新

  // 参数验证（仅在组件挂载时执行一次）
  useEffect(() => {
    console.log('=== 预约页面参数验证 ===');
    console.log('参数:', { hotelId, roomTypeId, checkIn, checkOut, user: !!user });
    
    // 验证参数
    if (!hotelId) {
      setValidationError('缺少酒店信息');
      return;
    }
    
    if (!roomTypeId) {
      setValidationError('房型信息无效');
      return;
    }
    
    if (!checkIn || !checkOut) {
      setValidationError('缺少日期信息');
      return;
    }
    
    if (!user) {
      // 用户未登录，跳转到登录页
      const redirectUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/admin/login?redirect=${redirectUrl}`, { replace: true });
      return;
    }
    
    // 所有参数都有效，清除错误
    setValidationError(null);
  }, []); // 空依赖数组，只在挂载时执行一次

  // 获取预订信息
  const fetchBookingInfo = useCallback(async () => {
    if (validationError) {
      console.log('存在验证错误，跳过数据获取:', validationError);
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('=== 开始获取预订信息 ===');
      
      // 获取酒店信息
      const hotelData = await getHotelDetail(hotelId);
      if (!hotelData) {
        throw new Error('无法获取酒店信息');
      }
      
      console.log('酒店数据获取成功:', hotelData.name);
      setHotel(hotelData);
      
      // 计算价格
      const priceUrl = `http://localhost:5000/api/hotels/price-calendar/calculate?hotelId=${hotelId}&roomTypeId=${roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}`;
      console.log('价格计算URL:', priceUrl);
      
      const priceResponse = await fetch(priceUrl);
      
      if (!priceResponse.ok) {
        const errorText = await priceResponse.text();
        console.error('价格计算失败:', errorText);
        throw new Error(`价格计算失败: ${priceResponse.status}`);
      }
      
      const priceData = await priceResponse.json();
      console.log('价格数据:', priceData);
      
      setPriceInfo(priceData);
      console.log('=== 预订信息获取完成 ===');
      
    } catch (error) {
      console.error('获取预订信息失败:', error);
      setValidationError(error.message);
    } finally {
      setLoading(false);
    }
  }, [hotelId, roomTypeId, checkIn, checkOut, validationError]);

  // 当参数验证通过后，获取数据
  useEffect(() => {
    if (!validationError && hotelId && roomTypeId && checkIn && checkOut && user) {
      fetchBookingInfo();
    }
  }, [validationError, fetchBookingInfo, user]);

  // 处理验证错误的重定向
  useEffect(() => {
    if (validationError && !loading) {
      const timer = setTimeout(() => {
        if (validationError === '缺少酒店信息') {
          navigate('/list', { replace: true });
        } else if (validationError === '房型信息无效' || validationError === '缺少日期信息') {
          navigate(`/detail/${hotelId}`, { replace: true });
        }
      }, 2000); // 2秒后重定向
      
      return () => clearTimeout(timer);
    }
  }, [validationError, loading, hotelId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== 开始提交订单 ===');
    console.log('表单数据:', formData);
    
    if (!formData.contactName || !formData.contactPhone) {
      alert('请填写联系人信息');
      return;
    }
    
    // 验证日期
    if (!DateValidator.isValidCheckInDate(checkIn)) {
      alert('入住日期不能早于今天');
      return;
    }
    
    if (!DateValidator.isValidCheckOutDate(checkIn, checkOut)) {
      alert('退房日期必须晚于入住日期');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const selectedRoom = hotel.roomTypes?.find(r => r.id === roomTypeId);
      console.log('选中的房型:', selectedRoom);
      
      const orderData = {
        userId: user.id,
        hotelId: parseInt(hotelId),
        roomType: selectedRoom?.roomType || '标准间',
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights: priceInfo.nights,
        adults: formData.adults,
        children: formData.children,
        totalPrice: priceInfo.totalPrice,
        cancelPolicy: {
          free_before_hours: 24,
          penalty_rate: 0.2
        }
      };
      
      console.log('订单数据:', orderData);
      
      // 使用 fetch 提交订单
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(orderData)
      });
      
      console.log('订单响应状态:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('订单创建失败:', errorData);
        throw new Error(errorData.error || '订单创建失败');
      }
      
      const result = await response.json();
      console.log('订单创建成功:', result);
      
      if (result.success) {
        alert('订单创建成功！');
        navigate(`/orders/${result.orderId}`);
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      alert(`创建订单失败: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 处理输入变化
  const handleInputChange = useCallback((field, value) => {
    console.log(`输入变化: ${field} =`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 加载状态
  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  // 验证错误状态
  if (validationError) {
    return (
      <div className="booking-page">
        <div className="error">
          <div>{validationError}</div>
          <div style={{ marginTop: '16px', fontSize: '14px' }}>
            正在重定向...
          </div>
        </div>
      </div>
    );
  }

  // 数据加载失败
  if (!hotel || !priceInfo) {
    return (
      <div className="booking-page">
        <div className="error">预订信息加载失败</div>
      </div>
    );
  }

  const selectedRoom = hotel.roomTypes?.find(r => r.id === roomTypeId);

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* 返回按钮 */}
        <button 
          type="button"
          className="back-button" 
          onClick={() => navigate(-1)}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回
        </button>

        <h1 className="page-title">确认预订</h1>

        <form onSubmit={handleSubmit}>
          {/* 酒店信息卡片 */}
          <div className="info-card">
            <h3 className="card-title">酒店信息</h3>
            <div className="hotel-info">
              {(() => {
                let imageUrl = null;
                if (hotel.images) {
                  let imageArray = [];
                  
                  if (typeof hotel.images === 'string') {
                    try {
                      imageArray = JSON.parse(hotel.images);
                    } catch (e) {
                      console.error('解析图片JSON失败:', e);
                    }
                  } else if (Array.isArray(hotel.images)) {
                    imageArray = hotel.images;
                  }
                  
                  if (imageArray.length > 0) {
                    const firstImage = imageArray[0];
                    imageUrl = firstImage.startsWith('http') 
                      ? firstImage 
                      : `http://localhost:5000${firstImage}`;
                  }
                }
                
                return imageUrl ? (
                  <img 
                    src={imageUrl}
                    alt={hotel.name} 
                    className="hotel-image" 
                  />
                ) : null;
              })()}
              <div className="hotel-details">
                <h2>{hotel.name}</h2>
                <div className="info-row">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" strokeWidth="2"/>
                  </svg>
                  <span>{hotel.address}</span>
                </div>
                {hotel.stars && (
                  <div className="stars">
                    {'⭐'.repeat(hotel.stars)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 预订信息卡片 */}
          <div className="info-card">
            <h3 className="card-title">预订信息</h3>
            <div className="booking-info-grid">
              <div className="info-item">
                <span className="label">房型</span>
                <span className="value">{selectedRoom?.roomType || '标准间'}</span>
              </div>
              <div className="info-item">
                <span className="label">入住日期</span>
                <span className="value">{DateFormatter.toDisplayFormat(checkIn, 'zh-CN')}</span>
              </div>
              <div className="info-item">
                <span className="label">离店日期</span>
                <span className="value">{DateFormatter.toDisplayFormat(checkOut, 'zh-CN')}</span>
              </div>
              <div className="info-item">
                <span className="label">入住天数</span>
                <span className="value">{priceInfo.nights} 晚</span>
              </div>
            </div>
          </div>

          {/* 入住人信息 */}
          <div className="info-card">
            <h3 className="card-title">入住人信息</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="adults">成人数量</label>
                <select 
                  id="adults"
                  name="adults"
                  value={formData.adults}
                  onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                  required
                >
                  {[1,2,3,4].map(n => (
                    <option key={n} value={n}>{n} 位</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="children">儿童数量</label>
                <select 
                  id="children"
                  name="children"
                  value={formData.children}
                  onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                >
                  {[0,1,2,3].map(n => (
                    <option key={n} value={n}>{n} 位</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 联系人信息 */}
          <div className="info-card">
            <h3 className="card-title">联系人信息</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contactName">联系人姓名 *</label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="请输入姓名"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactPhone">联系电话 *</label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="请输入手机号"
                  required
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="specialRequests">特殊要求（可选）</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="如需要加床、无烟房等特殊要求，请在此说明"
                rows={3}
              />
            </div>
          </div>

          {/* 价格明细 */}
          <div className="info-card">
            <h3 className="card-title">价格明细</h3>
            <div className="price-details">
              <div className="price-row">
                <span>房费 ({priceInfo.nights} 晚)</span>
                <span>¥{priceInfo.totalPrice}</span>
              </div>
              <div className="price-row">
                <span>每晚均价</span>
                <span>¥{Math.round(priceInfo.totalPrice / priceInfo.nights)}</span>
              </div>
              <div className="price-row total">
                <span>总计</span>
                <span className="total-price">¥{priceInfo.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* 取消政策 */}
          <div className="info-card policy-card">
            <h3 className="card-title">取消政策</h3>
            <div className="policy-content">
              <p>• 入住前24小时前取消，免费取消</p>
              <p>• 入住前24小时内取消，收取20%手续费</p>
              <p>• 未入住不退款</p>
            </div>
          </div>

          {/* 提交按钮 */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? '提交中...' : '确认预订'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
