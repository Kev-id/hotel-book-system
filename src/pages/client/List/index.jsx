import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHotelList } from '../../../api/hotelApi';
import { Card, Empty, Spin, Tag, Pagination, Button, Select } from 'antd';
import { 
  StarFilled, 
  EnvironmentOutlined, 
  ArrowLeftOutlined,
  FilterOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import './styles.css';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [selectedTags, setSelectedTags] = useState([]);
  const pageSize = 10;
  const location = useLocation();
  const navigate = useNavigate();

  const parseSearchParams = () => {
    const params = new URLSearchParams(location.search);
    // 支持 ?tag=WiFi,健身房 或 ?tag=WiFi&tag=健身房 两种形式
    const tagParams = params.getAll('tag');
    let tags = [];
    if (tagParams.length > 0) {
      tags = tagParams.flatMap(t => String(t).split(',').map(s => s.trim()).filter(Boolean));
    } else if (params.get('tag')) {
      tags = String(params.get('tag')).split(',').map(s => s.trim()).filter(Boolean);
    }

    return {
      city: params.get('city'),
      minPrice: params.get('minPrice'),
      maxPrice: params.get('maxPrice'),
      stars: params.get('stars'),
      tags
    };
  };

  const fetchHotels = async () => {
    setLoading(true);
    const { city, minPrice, maxPrice, stars, tags } = parseSearchParams();

    const filterParams = {};
    if (city) filterParams.city = city;
    if (minPrice) filterParams.price_gte = minPrice;
    if (maxPrice) filterParams.price_lte = maxPrice;
    if (stars) filterParams.stars = stars;
    if (tags && tags.length > 0) filterParams.tag = tags.join(',');
    filterParams.status = 'published';

    let data = await getHotelList(filterParams);
    
    // 排序
    if (sortBy === 'price-asc') {
      data = data.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      data = data.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stars') {
      data = data.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    }
    
    setHotels(data);
    setCurrentPage(1);
    setLoading(false);
  };

  useEffect(() => {
    const { tags } = parseSearchParams();
    setSelectedTags(tags || []);
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, sortBy]);

  const goToDetail = (id) => {
    navigate(`/detail/${id}${location.search}`);
  };

  const goBack = () => {
    navigate('/');
  };

  const handleTagClick = (tag) => {
    const params = new URLSearchParams(location.search);
    let newTags = Array.isArray(selectedTags) ? [...selectedTags] : [];
    const idx = newTags.indexOf(tag);
    if (idx > -1) {
      // 取消该标签
      newTags.splice(idx, 1);
    } else {
      // 添加该标签
      newTags.push(tag);
    }

    // 更新 URL: 使用逗号分隔的单个 tag 参数（后端支持解析）
    if (newTags.length > 0) {
      params.set('tag', newTags.join(','));
    } else {
      params.delete('tag');
    }

    setSelectedTags(newTags);
    navigate(`?${params.toString()}`);
  };

  const getCityName = (cityCode) => {
    const cityMap = {
      'beijing': '北京',
      'shanghai': '上海',
      'guangzhou': '广州',
      'shenzhen': '深圳'
    };
    return cityMap[cityCode] || cityCode;
  };

  // 分页数据
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedHotels = hotels.slice(startIndex, startIndex + pageSize);

  const { city, minPrice, maxPrice, stars } = parseSearchParams();

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="正在搜索酒店..." />
      </div>
    );
  }

  return (
    <div className="list-container">
      {/* Header */}
      <div className="list-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={goBack}
          className="back-button"
        >
          返回首页
        </Button>
        <h1 className="list-title">酒店列表</h1>
      </div>

      {/* Search Summary */}
      <Card className="search-summary">
        <div className="summary-content">
          <div className="summary-item">
            <EnvironmentOutlined className="summary-icon" />
            <span className="summary-label">城市：</span>
            <span className="summary-value">{city ? getCityName(city) : '全部'}</span>
          </div>
          {stars && (
            <div className="summary-item">
              <StarFilled className="summary-icon star" />
              <span className="summary-label">星级：</span>
              <span className="summary-value">{stars}星</span>
            </div>
          )}
          {(minPrice || maxPrice) && (
            <div className="summary-item">
              <FilterOutlined className="summary-icon" />
              <span className="summary-label">价格：</span>
              <span className="summary-value">
                ¥{minPrice || 0} - ¥{maxPrice || '不限'}
              </span>
            </div>
          )}
          <div className="summary-tags">
            <span className="summary-label">筛选标签：</span>
            <Button 
              className={`tag-filter-btn ${selectedTags && selectedTags.includes('WiFi') ? 'active' : ''}`}
              onClick={() => handleTagClick('WiFi')}
            >
              WiFi
            </Button>
            <Button 
              className={`tag-filter-btn ${selectedTags && selectedTags.includes('健身房') ? 'active' : ''}`}
              onClick={() => handleTagClick('健身房')}
            >
              健身房
            </Button>
            <Button 
              className={`tag-filter-btn ${selectedTags && selectedTags.includes('停车场') ? 'active' : ''}`}
              onClick={() => handleTagClick('停车场')}
            >
              停车场
            </Button>
            <Button 
              className={`tag-filter-btn ${selectedTags && selectedTags.includes('游泳池') ? 'active' : ''}`}
              onClick={() => handleTagClick('游泳池')}
            >
              游泳池
            </Button>
            <Button 
              className={`tag-filter-btn ${selectedTags && selectedTags.includes('前台24小时') ? 'active' : ''}`}
              onClick={() => handleTagClick('前台24小时')}
            >
              前台24小时
            </Button>
            <Button 
              className={`tag-filter-btn ${selectedTags && selectedTags.includes('行李寄存') ? 'active' : ''}`}
              onClick={() => handleTagClick('行李寄存')}
            >
              行李寄存
            </Button>
            <Button 
              className={`tag-filter-btn ${selectedTags && selectedTags.includes('商务中心') ? 'active' : ''}`}
              onClick={() => handleTagClick('商务中心')}
            >
              商务中心
            </Button>
            <Button 
              className={`tag-filter-btn ${selectedTags && selectedTags.includes('会议室') ? 'active' : ''}`}
              onClick={() => handleTagClick('会议室')}
            >
              会议室
            </Button>
          </div>
          <div className="summary-count">
            找到 <strong>{hotels.length}</strong> 家酒店
          </div>
        </div>
      </Card>

      {/* Sort Bar */}
      <div className="sort-bar">
        <div className="sort-label">
          <SortAscendingOutlined /> 排序方式：
        </div>
        <Select
          value={sortBy}
          onChange={setSortBy}
          className="sort-select"
          options={[
            { value: 'default', label: '默认排序' },
            { value: 'price-asc', label: '价格从低到高' },
            { value: 'price-desc', label: '价格从高到低' },
            { value: 'stars', label: '星级从高到低' }
          ]}
        />
      </div>

      {/* Hotel List */}
      {hotels.length === 0 ? (
        <div className="empty-container">
          <Empty 
            description="暂无符合条件的酒店" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button type="primary" onClick={goBack} className="back-home-button">
            返回首页重新搜索
          </Button>
        </div>
      ) : (
        <>
          <div className="hotel-list">
            {paginatedHotels.map((hotel) => (
              <Card
                key={hotel.id}
                hoverable
                onClick={() => goToDetail(hotel.id)}
                className="hotel-card"
              >
                <div className="hotel-card-content">
                  {/* Hotel Image */}
                  <div className="hotel-image">
                    <img 
                      src={`https://images.unsplash.com/photo-${
                        hotel.stars >= 4 
                          ? '1566073771259-6a8506099945' 
                          : hotel.stars >= 3 
                          ? '1551882547-ff40c63fe5fa'
                          : '1445019980597-93fa8acb246c'
                      }?w=300&h=200&fit=crop`}
                      alt={hotel.name}
                      loading="lazy"
                    />
                  </div>

                  {/* Left: Hotel Info */}
                  <div className="hotel-info">
                    <div className="hotel-header">
                      <h3 className="hotel-name">{hotel.name}</h3>
                      {hotel.stars && (
                        <div className="hotel-stars">
                          {[...Array(parseInt(hotel.stars))].map((_, i) => (
                            <StarFilled key={i} className="star-icon" />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="hotel-address">
                      <EnvironmentOutlined className="address-icon" />
                      {hotel.address}
                    </div>

                    <div className="hotel-tags">
                      {hotel.roomType && (
                        <Tag color="blue">{hotel.roomType}</Tag>
                      )}
                      {hotel.openingDate && (
                        <Tag color="green">开业于 {hotel.openingDate}</Tag>
                      )}
                      {hotel.status === 'published' && (
                        <Tag color="success">可预订</Tag>
                      )}
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="hotel-price-section">
                    <div className="price-label">每晚低至</div>
                    <div className="price-value">
                      <span className="price-currency">¥</span>
                      <span className="price-amount">{hotel.price}</span>
                    </div>
                    <Button type="primary" className="book-button">
                      查看详情
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {hotels.length > pageSize && (
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={hotels.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 家酒店`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HotelList;
