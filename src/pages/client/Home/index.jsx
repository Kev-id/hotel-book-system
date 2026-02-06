import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, InputNumber, Button, Card, Carousel } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';
import './styles.css';

const Home = () => {
  const [city, setCity] = useState('shanghai');
  const [stars, setStars] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!city) {
      alert('请选择城市！');
      return;
    }
    navigate(`/list?city=${city}&minPrice=${minPrice}&maxPrice=${maxPrice}&stars=${stars}`);
  };

  // 轮播图数据
  const carouselItems = [
    { 
      id: 1, 
      title: '豪华五星酒店', 
      desc: '享受顶级服务体验', 
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop',
      gradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)' 
    },
    { 
      id: 2, 
      title: '舒适商务酒店', 
      desc: '完美出差选择', 
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&h=400&fit=crop',
      gradient: 'linear-gradient(135deg, rgba(240, 147, 251, 0.8) 0%, rgba(245, 87, 108, 0.8) 100%)' 
    },
    { 
      id: 3, 
      title: '经济实惠酒店', 
      desc: '性价比之选', 
      image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&h=400&fit=crop',
      gradient: 'linear-gradient(135deg, rgba(79, 172, 254, 0.8) 0%, rgba(0, 242, 254, 0.8) 100%)' 
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section with Carousel */}
      <div className="hero-section">
        <Carousel autoplay autoplaySpeed={4000} effect="fade">
          {carouselItems.map((item) => (
            <div key={item.id}>
              <div
                className="carousel-item"
                style={{ 
                  backgroundImage: `${item.gradient}, url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="carousel-content">
                  <h1 className="carousel-title">{item.title}</h1>
                  <p className="carousel-desc">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
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
                <Select.Option value="beijing">北京</Select.Option>
                <Select.Option value="shanghai">上海</Select.Option>
                <Select.Option value="guangzhou">广州</Select.Option>
                <Select.Option value="shenzhen">深圳</Select.Option>
              </Select>
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
