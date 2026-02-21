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
      title: '星级',
      dataIndex: 'stars',
      key: 'stars',
      width: 80,
      render: (stars) => stars ? `${stars}星` : '-'
    },
    {
      title: '房型数量',
      dataIndex: 'roomTypes',
      key: 'roomTypes',
      width: 100,
      render: (roomTypes) => roomTypes?.length || 0
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (time) => time ? new Date(time).toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary"
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
        <div>
          <h2>我的酒店审核状态</h2>
          <p>查看您发布的酒店审核进度和结果</p>
        </div>
        <Button 
          type="primary" 
          size="large"
          onClick={() => window.location.href = '/admin/hotel-form'}
        >
          发布新酒店
        </Button>
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
        title="酒店详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedHotel && (
          <div className="hotel-details">
            <div className="detail-section">
              <h4 style={{ marginBottom: '16px', color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>基本信息</h4>
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
                <span className="label">星级：</span>
                <span className="value">{'⭐'.repeat(selectedHotel.stars)}</span>
              </div>
              <div className="detail-row">
                <span className="label">开业时间：</span>
                <span className="value">{selectedHotel.openingDate || '未填写'}</span>
              </div>
            </div>

            <div className="detail-section" style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '16px', color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>房型信息</h4>
              {selectedHotel.roomTypes && selectedHotel.roomTypes.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedHotel.roomTypes.map((room, index) => (
                    <div key={index} style={{ 
                      padding: '12px', 
                      background: '#f5f5f5', 
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 500 }}>{room.roomType}</span>
                      <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{room.price}/晚</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#999' }}>暂无房型信息</span>
              )}
            </div>

            <div className="detail-section" style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '16px', color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>酒店设施</h4>
              <div className="detail-row">
                <span className="value">
                  {selectedHotel.tags && Array.isArray(selectedHotel.tags) && selectedHotel.tags.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedHotel.tags.map((tag, index) => (
                        <Tag key={index} color="blue">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>无</span>
                  )}
                </span>
              </div>
            </div>

            <div className="detail-section" style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '16px', color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>酒店介绍</h4>
              <div style={{ lineHeight: '1.8', color: '#666', background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                {selectedHotel.description || '暂无介绍'}
              </div>
            </div>

            <div className="detail-section" style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '16px', color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>审核状态</h4>
              <div className="detail-row">
                <span className="label">当前状态：</span>
                <span className="value">{getStatusTag(selectedHotel.status)}</span>
              </div>
              {selectedHotel.status === 'rejected' && selectedHotel.rejectReason && (
                <div className="detail-row" style={{ marginTop: '12px', padding: '12px', background: '#fff2f0', borderLeft: '4px solid #ff4d4f', borderRadius: '4px' }}>
                  <span className="label" style={{ color: '#ff4d4f', fontWeight: 600 }}>驳回原因：</span>
                  <span className="value" style={{ display: 'block', marginTop: '8px', color: '#666' }}>{selectedHotel.rejectReason}</span>
                </div>
              )}
              <div className="detail-row" style={{ marginTop: '12px' }}>
                <span className="label">提交时间：</span>
                <span className="value">{new Date(selectedHotel.created_at).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MerchantStatus;
