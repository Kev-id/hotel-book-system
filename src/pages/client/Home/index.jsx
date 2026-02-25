import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, InputNumber, Button, Card, Carousel, DatePicker } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined, StarOutlined, CalendarOutlined } from '@ant-design/icons';
import { getHotelList } from '../../../api/hotelApi';
import dayjs from 'dayjs';
import { CITIES } from '../../../config/cities';
import './styles.css';

const { RangePicker } = DatePicker;

const Home = () => {
  const [city, setCity] = useState('shanghai');
  const [stars, setStars] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(1, 'day')]);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const navigate = useNavigate();

  // 获取推荐酒店（用于轮播图）
  useEffect(() => {
    const fetchFeaturedHotels = async () => {
      const hotels = await getHotelList({ status: 'published' });
      // 取前3个酒店用于轮播
      setFeaturedHotels(hotels.slice(0, 3));
    };
    fetchFeaturedHotels();
  }, []);

  const handleSearch = () => {
    if (!city) {
      alert('请选择城市！');
      return;
    }
    if (!dateRange || dateRange.length !== 2) {
      alert('请选择入住和退房日期！');
      return;
    }
    const checkIn = dateRange[0].format('YYYY-MM-DD');
    const checkOut = dateRange[1].format('YYYY-MM-DD');
    navigate(`/list?city=${city}&minPrice=${minPrice}&maxPrice=${maxPrice}&stars=${stars}&checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  // 点击轮播图跳转到酒店详情
  const handleCarouselClick = (hotelId) => {
    navigate(`/detail/${hotelId}`);
  };

  // 获取酒店图片
  const getHotelImage = (hotel) => {
    if (hotel.images) {
      let imageArray = [];
      
      // 处理JSON字符串
      if (typeof hotel.images === 'string') {
        try {
          imageArray = JSON.parse(hotel.images);
        } catch (e) {
          console.error('解析图片JSON失败:', e);
        }
      } else if (Array.isArray(hotel.images)) {
        imageArray = hotel.images;
      }
      
      // 如果有图片，返回第一张
      if (imageArray.length > 0) {
        const imageUrl = imageArray[0];
        return imageUrl.startsWith('http') 
          ? imageUrl 
          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`;
      }
    }
    
    // 默认图片
    return `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop`;
  };

  return (
    <div className="home-container">
      {/* Hero Section with Carousel */}
      <div className="hero-section">
        <Carousel autoplay autoplaySpeed={4000} effect="fade">
          {featuredHotels.length > 0 ? (
            featuredHotels.map((hotel) => (
              <div key={hotel.id}>
                <div
                  className="carousel-item"
                  style={{ 
                    backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 100%), url(${getHotelImage(hotel)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleCarouselClick(hotel.id)}
                >
                  <div className="carousel-content">
                    <h1 className="carousel-title">{hotel.name}</h1>
                    <p className="carousel-desc">
                      {hotel.address} · ¥{hotel.price}/晚起
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // 加载中显示默认轮播
            <div>
              <div
                className="carousel-item"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%), url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="carousel-content">
                  <h1 className="carousel-title">加载中...</h1>
                  <p className="carousel-desc">正在为您推荐精选酒店</p>
                </div>
              </div>
            </div>
          )}
        </Carousel>
      </div>

      {/* Search Form */}
      <div className="search-section">
        <Card className="search-card">
          <h2 className="search-title">
            <SearchOutlined /> 查找理想酒店
          </h2>
          <p className="search-subtitle">输入您的需求，我们为您推荐最合适的酒店</p>

          <div className="search-form">
            {/* 城市选择 */}
            <div className="form-group">
              <label className="form-label">
                <EnvironmentOutlined /> 选择城市
              </label>
              <Select
                value={city}
                onChange={(value) => setCity(value)}
                size="large"
                className="form-select"
                placeholder="-- 请选择城市 --"
              >
                <Select.Option value="">-- 请选择城市 --</Select.Option>
                {CITIES.map(city => (
                  <Select.Option key={city.value} value={city.value}>
                    {city.label}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* 日期选择 */}
            <div className="form-group">
              <label className="form-label">
                <CalendarOutlined /> 入住时间
              </label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                size="large"
                className="form-select"
                placeholder={['入住日期', '退房日期']}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                format="YYYY-MM-DD"
              />
            </div>

            {/* 价格区间 */}
            <div className="form-group">
              <label className="form-label">
                <DollarOutlined /> 价格区间（元/晚）
              </label>
              <div className="price-range">
                <InputNumber
                  value={minPrice}
                  onChange={(value) => setMinPrice(value || 0)}
                  min={0}
                  max={20000}
                  size="large"
                  className="price-input"
                  placeholder="最低价格"
                />
                <span className="price-separator">-</span>
                <InputNumber
                  value={maxPrice}
                  onChange={(value) => setMaxPrice(value || 1000)}
                  min={0}
                  max={20000}
                  size="large"
                  className="price-input"
                  placeholder="最高价格"
                />
              </div>
            </div>

            {/* 星级选择 */}
            <div className="form-group">
              <label className="form-label">
                <StarOutlined /> 选择星级
              </label>
              <Select
                value={stars}
                onChange={(value) => setStars(value)}
                size="large"
                className="form-select"
                allowClear
                placeholder="-- 请选择星级 --"
              >
                <Select.Option value="1">⭐ 1星</Select.Option>
                <Select.Option value="2">⭐⭐ 2星</Select.Option>
                <Select.Option value="3">⭐⭐⭐ 3星</Select.Option>
                <Select.Option value="4">⭐⭐⭐⭐ 4星</Select.Option>
                <Select.Option value="5">⭐⭐⭐⭐⭐ 5星</Select.Option>
              </Select>
            </div>

            {/* 查询按钮 */}
            <Button 
              type="primary" 
              size="large" 
              block 
              onClick={handleSearch}
              className="search-button"
              icon={<SearchOutlined />}
            >
              查询酒店
            </Button>
          </div>
        </Card>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">为什么选择我们</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-image">
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop" 
                alt="精选酒店"
              />
            </div>
            <h3>精选酒店</h3>
            <p>严格筛选，品质保证</p>
          </div>
          <div className="feature-card">
            <div className="feature-image">
              <img 
                src="https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=400&h=300&fit=crop" 
                alt="价格优惠"
              />
            </div>
            <h3>价格优惠</h3>
            <p>最优价格，超值体验</p>
          </div>
          <div className="feature-card">
            <div className="feature-image">
              <img 
                src="https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400&h=300&fit=crop" 
                alt="快速预订"
              />
            </div>
            <h3>快速预订</h3>
            <p>简单流程，即刻入住</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
