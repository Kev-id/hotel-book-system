import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getHotelDetail } from '../../../api/hotelApi';
import { Card, Button, Tag, Spin, Empty, Divider, message } from 'antd';
import { 
  StarFilled, 
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import './styles.css';

const HotelDetail = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchHotelDetail = async () => {
    setLoading(true);
    const data = await getHotelDetail(id);
    setHotel(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHotelDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = () => {
    message.success('预订功能开发中，敬请期待！');
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
        {/* Hotel Image Gallery */}
        <div className="hotel-gallery">
          <img 
            src={`https://images.unsplash.com/photo-${
              hotel.stars >= 4 
                ? '1566073771259-6a8506099945' 
                : hotel.stars >= 3 
                ? '1551882547-ff40c63fe5fa'
                : '1445019980597-93fa8acb246c'
            }?w=1200&h=400&fit=crop`}
            alt={hotel.name}
            className="hotel-main-image"
          />
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
              <div className="price-label">每晚低至</div>
              <div className="price-value">
                <span className="currency">¥</span>
                <span className="amount">{hotel.price}</span>
              </div>
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
                <div className="info-label">房型</div>
                <div className="info-value">{hotel.roomType || '标准间'}</div>
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
          <div className="bottom-price">
            <span className="bottom-price-label">每晚</span>
            <span className="bottom-price-value">¥{hotel.price}</span>
          </div>
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
