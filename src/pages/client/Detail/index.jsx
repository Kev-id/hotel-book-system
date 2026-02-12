import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getHotelDetail, getHotelRoomTypes, calculatePeriodPrice } from '../../../api/hotelApi';
import { Card, Button, Tag, Spin, Empty, Divider, message, Carousel } from 'antd';
import { 
  StarFilled, 
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  SafetyOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import './styles.css';

const HotelDetail = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomPrices, setRoomPrices] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [carouselRef, setCarouselRef] = useState(null);

  const getSearchParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      checkIn: params.get('checkIn'),
      checkOut: params.get('checkOut')
    };
  };

  const fetchHotelDetail = async () => {
    setLoading(true);
    const data = await getHotelDetail(id);
    setHotel(data);
    
    // 如果有日期范围，计算每个房型的价格
    const { checkIn, checkOut } = getSearchParams();
    if (checkIn && checkOut && data?.roomTypes && data.roomTypes.length > 0) {
      try {
        const pricePromises = data.roomTypes.map(async (room) => {
          try {
            const priceData = await calculatePeriodPrice({
              hotelId: id,
              roomTypeId: room.id,
              checkIn,
              checkOut
            });
            return { roomTypeId: room.id, ...priceData };
          } catch (error) {
            console.error(`计算房型 ${room.id} 价格失败:`, error);
            return { roomTypeId: room.id, totalPrice: room.price, minPrice: room.price, nights: 1 };
          }
        });
        
        const prices = await Promise.all(pricePromises);
        const priceMap = {};
        prices.forEach(p => {
          if (p) priceMap[p.roomTypeId] = p;
        });
        setRoomPrices(priceMap);
      } catch (error) {
        console.error('计算价格失败:', error);
        setRoomPrices({});
      }
    } else {
      // 没有日期范围时，清空价格映射
      setRoomPrices({});
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchHotelDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = () => {
    message.success('预订功能开发中，敬请期待！');
  };

  // 默认图片列表
  const getDefaultImages = () => {
    const baseUrl = 'https://images.unsplash.com/photo-';
    const imageIds = hotel.stars >= 4 
      ? ['1566073771259-6a8506099945', '1582719478250-c89cae4dc85b', '1445019980597-93fa8acb246c']
      : hotel.stars >= 3 
      ? ['1551882547-ff40c63fe5fa', '1566073771259-6a8506099945', '1445019980597-93fa8acb246c']
      : ['1445019980597-93fa8acb246c', '1551882547-ff40c63fe5fa', '1582719478250-c89cae4dc85b'];
    
    return imageIds.map(id => `${baseUrl}${id}?w=1200&h=500&fit=crop`);
  };

  // 获取图片列表（优先使用上传的图片，否则使用默认图片）
  const getImageList = () => {
    if (hotel.images && hotel.images.length > 0) {
      return hotel.images.map(img => 
        img.startsWith('http') ? img : `http://localhost:5000${img}`
      );
    }
    return getDefaultImages();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载酒店信息..." />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="error-container">
        <Empty 
          description="酒店信息不存在" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button 
          type="primary" 
          onClick={() => navigate(`/list${location.search}`)}
          className="back-button-error"
        >
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      {/* Header */}
      <div className="detail-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/list${location.search}`)}
          className="back-button"
        >
          返回列表
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="hero-card">
        {/* Hotel Image Gallery - Carousel */}
        <div className="hotel-gallery">
          <Carousel 
            autoplay 
            ref={setCarouselRef}
            dots={{ className: 'custom-dots' }}
            effect="fade"
          >
            {getImageList().map((img, index) => (
              <div key={index} className="carousel-slide">
                <img 
                  src={img}
                  alt={`${hotel.name} - 图片 ${index + 1}`}
                  className="hotel-main-image"
                />
              </div>
            ))}
          </Carousel>
          <div className="carousel-controls">
            <Button 
              className="carousel-btn carousel-btn-prev"
              icon={<LeftOutlined />}
              onClick={() => carouselRef?.prev()}
            />
            <Button 
              className="carousel-btn carousel-btn-next"
              icon={<RightOutlined />}
              onClick={() => carouselRef?.next()}
            />
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hotel-title">{hotel.name}</h1>
            
            {hotel.stars && (
              <div className="hotel-stars">
                {[...Array(parseInt(hotel.stars))].map((_, i) => (
                  <StarFilled key={i} className="star-icon" />
                ))}
                <span className="stars-text">{hotel.stars}星级酒店</span>
              </div>
            )}

            <div className="hotel-address">
              <EnvironmentOutlined className="icon" />
              <span>{hotel.address}</span>
            </div>

            {hotel.status === 'published' && (
              <Tag color="success" className="status-tag">
                <CheckCircleOutlined /> 可预订
              </Tag>
            )}
          </div>

          <div className="hero-right">
            <div className="price-card">
              {roomPrices[hotel.roomTypes?.[0]?.id] ? (
                <>
                  <div className="price-label">总价</div>
                  <div className="price-value">
                    <span className="currency">¥</span>
                    <span className="amount">{roomPrices[hotel.roomTypes[0].id].totalPrice}</span>
                  </div>
                  <div className="price-detail-info">
                    {roomPrices[hotel.roomTypes[0].id].nights} 晚 · 每晚低至 ¥{roomPrices[hotel.roomTypes[0].id].minPrice}
                  </div>
                </>
              ) : (
                <>
                  <div className="price-label">每晚低至</div>
                  <div className="price-value">
                    <span className="currency">¥</span>
                    <span className="amount">{hotel.price}</span>
                  </div>
                </>
              )}
              <Button 
                type="primary" 
                size="large" 
                block 
                onClick={handleBook}
                className="book-button"
              >
                立即预订
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Info Grid */}
      <div className="info-grid">
        {/* Basic Info */}
        <Card className="info-card" title="基本信息">
          <div className="info-list">
            <div className="info-item">
              <HomeOutlined className="info-icon" />
              <div className="info-content">
                <div className="info-label">房型数量</div>
                <div className="info-value">{hotel.roomTypes?.length || 0} 种</div>
              </div>
            </div>

            <Divider />

            <div className="info-item">
              <CalendarOutlined className="info-icon" />
              <div className="info-content">
                <div className="info-label">开业时间</div>
                <div className="info-value">{hotel.openingDate || '未知'}</div>
              </div>
            </div>

            <Divider />

            <div className="info-item">
              <SafetyOutlined className="info-icon" />
              <div className="info-content">
                <div className="info-label">状态</div>
                <div className="info-value">
                  {hotel.status === 'published' ? (
                    <Tag color="success">已上线</Tag>
                  ) : (
                    <Tag color="orange">审核中</Tag>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Facilities */}
        <Card className="info-card" title="酒店标签">
          <div className="tags-display">
            {hotel.tags && Array.isArray(hotel.tags) && hotel.tags.length > 0 ? (
              hotel.tags.map((tag, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: '8px' }}>
                  {tag}
                </Tag>
              ))
            ) : (
              <span className="no-tags">暂无标签</span>
            )}
          </div>
        </Card>
      </div>

      {/* Description */}
      <Card className="description-card" title="酒店介绍">
        <p className="description-text">
          {hotel.description || `${hotel.name}位于${hotel.address}，是一家${hotel.stars}星级酒店。
          酒店设施齐全，服务周到，是您商务出行和休闲度假的理想选择。
          我们提供舒适的客房、美味的餐饮、完善的会议设施以及贴心的服务，
          致力于为每一位宾客创造难忘的入住体验。`}
        </p>
      </Card>

      {/* Room Types Section */}
      {hotel.roomTypes && hotel.roomTypes.length > 0 && (
        <Card className="room-types-card" title={`${hotel.name} - 全部房型`}>
          <div className="room-types-grid">
            {hotel.roomTypes.map((room) => (
              <Card 
                key={room.id} 
                className="room-type-card"
                hoverable
              >
                <div className="room-type-header">
                  <div className="room-type-name">
                    <HomeOutlined className="room-icon" />
                    <span>{room.roomType}</span>
                  </div>
                </div>
                
                <Divider style={{ margin: '12px 0' }} />
                
                <div className="room-type-footer">
                  {roomPrices[room.id] ? (
                    <div className="room-price">
                      <span className="room-price-label">总价</span>
                      <span className="room-price-value">¥{roomPrices[room.id].totalPrice}</span>
                      <span className="room-price-detail">
                        {roomPrices[room.id].nights}晚 · 每晚¥{roomPrices[room.id].minPrice}起
                      </span>
                    </div>
                  ) : (
                    <div className="room-price">
                      <span className="room-price-label">每晚</span>
                      <span className="room-price-value">¥{room.price}</span>
                    </div>
                  )}
                  <Button type="primary" size="small" onClick={handleBook}>
                    预订
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Contact */}
      <Card className="contact-card" title="联系方式">
        <div className="contact-info">
          <PhoneOutlined className="contact-icon" />
          <div className="contact-content">
            <div className="contact-label">预订热线</div>
            <div className="contact-value">400-123-4567</div>
          </div>
        </div>
      </Card>

      {/* Fixed Bottom Bar */}
      <div className="fixed-bottom-bar">
        <div className="bottom-bar-content">
          {roomPrices[hotel.roomTypes?.[0]?.id] ? (
            <div className="bottom-price">
              <span className="bottom-price-label">总价</span>
              <span className="bottom-price-value">¥{roomPrices[hotel.roomTypes[0].id].totalPrice}</span>
            </div>
          ) : (
            <div className="bottom-price">
              <span className="bottom-price-label">每晚</span>
              <span className="bottom-price-value">¥{hotel.price}</span>
            </div>
          )}
          <Button 
            type="primary" 
            size="large" 
            onClick={handleBook}
            className="bottom-book-button"
          >
            立即预订
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
