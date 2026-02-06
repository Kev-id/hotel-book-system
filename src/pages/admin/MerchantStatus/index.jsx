import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Table, Tag, Empty, Spin, Button, Modal, message } from 'antd';
import { getHotelList } from '../../../api/hotelApi';
import './styles.css';

const MerchantStatus = () => {
  const { user } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchMerchantHotels();
  }, []);

  const fetchMerchantHotels = async () => {
    setLoading(true);
    try {
      const allHotels = await getHotelList({});
      // 只显示当前商户的酒店
      const merchantHotels = allHotels.filter(h => h.merchantId === user?.id);
      setHotels(merchantHotels);
    } catch (error) {
      message.error('获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', label: '待审核' },
      published: { color: 'green', label: '已发布' },
      rejected: { color: 'red', label: '已驳回' }
    };
    const config = statusMap[status] || { color: 'default', label: status };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const showDetails = (hotel) => {
    setSelectedHotel(hotel);
    setModalVisible(true);
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => `¥${price}`,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => showDetails(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className="merchant-status-container">
      <div className="status-header">
        <h2>我的酒店审核状态</h2>
        <p>查看您发布的酒店审核进度和结果</p>
      </div>

      <Spin spinning={loading}>
        {hotels.length > 0 ? (
          <Table
            columns={columns}
            dataSource={hotels}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="status-table"
          />
        ) : (
          <Empty description="暂无酒店数据" />
        )}
      </Spin>

      <Modal
        title="酒店审核详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedHotel && (
          <div className="hotel-details">
            <div className="detail-row">
              <span className="label">酒店名称：</span>
              <span className="value">{selectedHotel.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">地址：</span>
              <span className="value">{selectedHotel.address}</span>
            </div>
            <div className="detail-row">
              <span className="label">城市：</span>
              <span className="value">{selectedHotel.city}</span>
            </div>
            <div className="detail-row">
              <span className="label">价格：</span>
              <span className="value">¥{selectedHotel.price}</span>
            </div>
            <div className="detail-row">
              <span className="label">星级：</span>
              <span className="value">{'⭐'.repeat(selectedHotel.stars)}</span>
            </div>
            <div className="detail-row">
              <span className="label">房间类型：</span>
              <span className="value">{selectedHotel.roomType}</span>
            </div>
            <div className="detail-row">
              <span className="label">酒店标签：</span>
              <span className="value">
                {selectedHotel.tags && Array.isArray(selectedHotel.tags) && selectedHotel.tags.length > 0 ? (
                  selectedHotel.tags.map((tag, index) => (
                    <Tag key={index} color="blue" style={{ marginRight: '4px', marginBottom: '4px' }}>
                      {tag}
                    </Tag>
                  ))
                ) : (
                  <span style={{ color: '#999' }}>无</span>
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">酒店介绍：</span>
              <span className="value" style={{ display: 'block', marginTop: '8px', lineHeight: '1.6' }}>
                {selectedHotel.description || '暂无介绍'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">审核状态：</span>
              <span className="value">{getStatusTag(selectedHotel.status)}</span>
            </div>
            {selectedHotel.status === 'rejected' && selectedHotel.rejectReason && (
              <div className="detail-row reject-reason">
                <span className="label">驳回原因：</span>
                <span className="value">{selectedHotel.rejectReason}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="label">提交时间：</span>
              <span className="value">{new Date(selectedHotel.created_at).toLocaleString('zh-CN')}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MerchantStatus;
