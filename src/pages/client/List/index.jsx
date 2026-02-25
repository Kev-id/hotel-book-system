import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHotelList, calculatePeriodPrice } from '../../../api/hotelApi';
import { 
  Card, Empty, Spin, Tag, Pagination, Button, Select, 
  InputNumber, Form, Row, Col, Space,
  Input, DatePicker
} from 'antd';
import { 
  StarFilled, 
  EnvironmentOutlined, 
  ArrowLeftOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import FavoriteButton from '../../../components/FavoriteButton';
import dayjs from 'dayjs';
import { CITIES, getCityLabel } from '../../../config/cities';
import './styles.css';

const { RangePicker } = DatePicker;

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [selectedTags, setSelectedTags] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [hotelPrices, setHotelPrices] = useState({});
  const [form] = Form.useForm();
  const pageSize = 10;
  const location = useLocation();
  const navigate = useNavigate();

  // 城市选项配置
  const cityOptions = [
    { label: '全部', value: '' },
    ...CITIES.map(city => ({ label: city.label, value: city.value }))
  ];

  // 新增：星级选项配置
  const starOptions = [
    { label: '全部', value: '' },
    { label: '1星', value: '1' },
    { label: '2星', value: '2' },
    { label: '3星', value: '3' },
    { label: '4星', value: '4' },
    { label: '5星', value: '5' },
  ];

  const parseSearchParams = () => {
    const params = new URLSearchParams(location.search);
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
      keyword: params.get('keyword'),
      checkIn: params.get('checkIn'),
      checkOut: params.get('checkOut'),
      tags
    };
  };

  // 新增：处理筛选表单提交（更新URL参数）
  const handleFilterSubmit = (values) => {
    const params = new URLSearchParams(location.search);
    // 清空原有筛选参数
    params.delete('city');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('stars');
    params.delete('keyword');
    params.delete('checkIn');
    params.delete('checkOut');

    // 添加新的筛选参数
    if (values.city) params.set('city', values.city);
    if (values.minPrice) params.set('minPrice', values.minPrice);
    if (values.maxPrice) params.set('maxPrice', values.maxPrice);
    if (values.stars) params.set('stars', values.stars);
    if (values.keyword) params.set('keyword', keyword);
    
    // 添加日期参数
    if (values.dateRange && values.dateRange.length === 2) {
      params.set('checkIn', values.dateRange[0].format('YYYY-MM-DD'));
      params.set('checkOut', values.dateRange[1].format('YYYY-MM-DD'));
    }

    // 更新URL触发数据刷新
    navigate(`?${params.toString()}`);
  };

  // 新增：重置筛选条件
  const handleFilterReset = () => {
    const params = new URLSearchParams(location.search);
    params.delete('city');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('stars');
    params.delete('keyword');
    params.delete('checkIn');
    params.delete('checkOut');
    form.resetFields(); // 重置表单显示
    navigate(`?${params.toString()}`);
  };

  const fetchHotels = async () => {
    setLoading(true);
    const { city, minPrice, maxPrice, stars, tags, keyword, checkIn, checkOut } = parseSearchParams();

    const filterParams = {};
    if (city) filterParams.city = city;
    if (minPrice) filterParams.price_gte = minPrice;
    if (maxPrice) filterParams.price_lte = maxPrice;
    if (stars) filterParams.stars = stars;
    if (keyword) filterParams.keyword = keyword;
    if (tags && tags.length > 0) filterParams.tag = tags.join(',');
    filterParams.status = 'published';

    let data = await getHotelList(filterParams);
    
    // 如果有日期范围，计算每个酒店的价格
    if (checkIn && checkOut && data.length > 0) {
      const pricePromises = data.map(async (hotel) => {
        // 确保酒店有房型数据
        if (hotel.roomTypes && hotel.roomTypes.length > 0) {
          try {
            const roomTypeId = hotel.roomTypes[0].id;
            const priceData = await calculatePeriodPrice({
              hotelId: hotel.id,
              roomTypeId,
              checkIn,
              checkOut
            });
            return { hotelId: hotel.id, ...priceData };
          } catch (error) {
            console.error(`计算酒店 ${hotel.id} 价格失败:`, error);
            return { hotelId: hotel.id, totalPrice: hotel.price, minPrice: hotel.price, nights: 1 };
          }
        }
        // 如果没有房型数据，使用默认价格
        return { hotelId: hotel.id, totalPrice: hotel.price, minPrice: hotel.price, nights: 1 };
      });
      
      const prices = await Promise.all(pricePromises);
      const priceMap = {};
      prices.forEach(p => {
        if (p) priceMap[p.hotelId] = p;
      });
      setHotelPrices(priceMap);
    } else {
      // 没有日期范围时，清空价格映射
      setHotelPrices({});
    }
    
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
    const { tags, city, minPrice, maxPrice, stars, keyword, checkIn, checkOut } = parseSearchParams();
    setSelectedTags(tags || []);
    
    // 表单回显当前URL中的筛选条件
    const formValues = {
      city: city || '',
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      stars: stars || '',
      keyword: keyword || '',
    };
    
    // 回显日期范围
    if (checkIn && checkOut) {
      formValues.dateRange = [dayjs(checkIn), dayjs(checkOut)];
    }
    
    form.setFieldsValue(formValues);
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
    return getCityLabel(cityCode) || cityCode;
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

      {/* 新增：筛选表单区域（城市/价格/星级） */}
      <Card className="filter-form-card" title="高级筛选" bordered={true}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleFilterSubmit}
          initialValues={{ city: '', stars: '' }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="city" label="城市">
                <Select 
                  options={cityOptions} 
                  placeholder="选择城市"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Form.Item name="minPrice" label="最低价格">
                <InputNumber 
                  min={0} 
                  placeholder="¥0" 
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`}
                  parser={value => value.replace(/¥\s?/, '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Form.Item name="maxPrice" label="最高价格">
                <InputNumber 
                  min={0} 
                  placeholder="¥不限" 
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`}
                  parser={value => value.replace(/¥\s?/, '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Form.Item name="stars" label="星级">
                <Select 
                  options={starOptions} 
                  placeholder="选择星级"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="dateRange" label={<><CalendarOutlined /> 入住时间</>}>
                <RangePicker
                  placeholder={['入住日期', '退房日期']}
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Form.Item name="keyword" label="关键词">
                <Input 
                  placeholder="搜索酒店名称"
                  allowClear
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={4}>
              <Space>
                <Button type="primary" htmlType="submit">
                  筛选
                </Button>
                <Button onClick={handleFilterReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

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
                      src={(() => {
                        // 安全地处理图片URL
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
                            const firstImage = imageArray[0];
                            return firstImage.startsWith('http') 
                              ? firstImage 
                              : `http://localhost:5000${firstImage}`;
                          }
                        }
                        
                        // 默认图片
                        return `https://images.unsplash.com/photo-${
                          hotel.stars >= 4 
                            ? '1566073771259-6a8506099945' 
                            : hotel.stars >= 3 
                            ? '1551882547-ff40c63fe5fa'
                            : '1445019980597-93fa8acb246c'
                        }?w=300&h=200&fit=crop`;
                      })()}
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
                    {hotelPrices[hotel.id] ? (
                      <>
                        <div className="price-label">总价</div>
                        <div className="price-value">
                          <span className="price-currency">¥</span>
                          <span className="price-amount">{hotelPrices[hotel.id].totalPrice}</span>
                        </div>
                        <div className="price-detail">
                          每晚低至 ¥{hotelPrices[hotel.id].minPrice}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="price-label">每晚低至</div>
                        <div className="price-value">
                          <span className="price-currency">¥</span>
                          <span className="price-amount">{hotel.price}</span>
                        </div>
                      </>
                    )}
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Button type="primary" className="book-button">
                        查看详情
                      </Button>
                      <FavoriteButton hotelId={hotel.id} size="middle" />
                    </div>
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