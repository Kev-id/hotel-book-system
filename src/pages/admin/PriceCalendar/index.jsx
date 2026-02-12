import { useState, useEffect } from 'react';
import { Card, Select, DatePicker, InputNumber, Button, Table, message, Space } from 'antd';
import { getHotelList, getHotelRoomTypes, setPriceCalendar, setBatchPriceCalendar, getPriceCalendar } from '../../../api/hotelApi';
import dayjs from 'dayjs';
import './styles.css';

const { RangePicker } = DatePicker;

const PriceCalendar = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [singleDate, setSingleDate] = useState(null);
  const [singlePrice, setSinglePrice] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [batchPrice, setBatchPrice] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const merchantId = localStorage.getItem('userId');
    const data = await getHotelList({ merchantId });
    setHotels(data);
  };

  const handleHotelChange = async (hotelId) => {
    setSelectedHotel(hotelId);
    setSelectedRoomType(null);
    const rooms = await getHotelRoomTypes(hotelId);
    setRoomTypes(rooms);
    fetchPriceList(hotelId);
  };

  const handleRoomTypeChange = (roomTypeId) => {
    setSelectedRoomType(roomTypeId);
  };

  const fetchPriceList = async (hotelId) => {
    if (!hotelId) return;
    const startDate = dayjs().format('YYYY-MM-DD');
    const endDate = dayjs().add(90, 'day').format('YYYY-MM-DD');
    const data = await getPriceCalendar({ hotelId, startDate, endDate });
    setPriceList(data);
  };

  const handleSetSinglePrice = async () => {
    if (!selectedHotel || !selectedRoomType || !singleDate || !singlePrice) {
      message.error('请填写完整信息');
      return;
    }

    setLoading(true);
    const result = await setPriceCalendar({
      hotelId: selectedHotel,
      roomTypeId: selectedRoomType,
      date: singleDate.format('YYYY-MM-DD'),
      price: singlePrice
    });
    setLoading(false);

    if (result?.success) {
      message.success('设置成功');
      fetchPriceList(selectedHotel);
      setSingleDate(null);
      setSinglePrice(null);
    } else {
      message.error('设置失败');
    }
  };

  const handleSetBatchPrice = async () => {
    if (!selectedHotel || !selectedRoomType || !dateRange || !batchPrice) {
      message.error('请填写完整信息');
      return;
    }

    setLoading(true);
    const result = await setBatchPriceCalendar({
      hotelId: selectedHotel,
      roomTypeId: selectedRoomType,
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
      price: batchPrice
    });
    setLoading(false);

    if (result?.success) {
      message.success(`批量设置成功，共 ${result.count} 天`);
      fetchPriceList(selectedHotel);
      setDateRange(null);
      setBatchPrice(null);
    } else {
      message.error('批量设置失败');
    }
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '房型',
      dataIndex: 'roomTypeId',
      key: 'roomTypeId',
      render: (id) => {
        const room = roomTypes.find(r => r.id === id);
        return room?.roomType || '-';
      }
    },
    {
      title: '价格（元）',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price}`
    }
  ];

  return (
    <div className="price-calendar-container">
      <h1>价格日历管理</h1>

      <Card title="选择酒店和房型" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label>选择酒店：</label>
            <Select
              style={{ width: 300, marginLeft: 10 }}
              placeholder="请选择酒店"
              onChange={handleHotelChange}
              value={selectedHotel}
            >
              {hotels.map(hotel => (
                <Select.Option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {roomTypes.length > 0 && (
            <div>
              <label>选择房型：</label>
              <Select
                style={{ width: 300, marginLeft: 10 }}
                placeholder="请选择房型"
                onChange={handleRoomTypeChange}
                value={selectedRoomType}
              >
                {roomTypes.map(room => (
                  <Select.Option key={room.id} value={room.id}>
                    {room.roomType} - 基础价格 ¥{room.price}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}
        </Space>
      </Card>

      {selectedRoomType && (
        <>
          <Card title="设置单日价格" style={{ marginBottom: 20 }}>
            <Space>
              <DatePicker
                placeholder="选择日期"
                value={singleDate}
                onChange={setSingleDate}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
              <InputNumber
                placeholder="价格"
                value={singlePrice}
                onChange={setSinglePrice}
                min={0}
                prefix="¥"
              />
              <Button type="primary" onClick={handleSetSinglePrice} loading={loading}>
                设置
              </Button>
            </Space>
          </Card>

          <Card title="批量设置价格" style={{ marginBottom: 20 }}>
            <Space>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                value={dateRange}
                onChange={setDateRange}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
              <InputNumber
                placeholder="价格"
                value={batchPrice}
                onChange={setBatchPrice}
                min={0}
                prefix="¥"
              />
              <Button type="primary" onClick={handleSetBatchPrice} loading={loading}>
                批量设置
              </Button>
            </Space>
          </Card>

          <Card title="已设置的价格">
            <Table
              columns={columns}
              dataSource={priceList}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default PriceCalendar;
