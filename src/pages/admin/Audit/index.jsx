import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { getHotelList } from '../../../api/hotelApi';
import { updateHotel, deleteHotel } from '../../../api/userApi';
import { Table, Button, Space, Tag, Popconfirm, message } from 'antd';
import { DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const Audit = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hotelList, setHotelList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取所有酒店数据
  const fetchAllHotels = async () => {
    setLoading(true);
    const data = await getHotelList({});
    const sorted = data.sort((a, b) => {
      const order = { pending: 0, published: 1, rejected: 2 };
      return order[a.status] - order[b.status];
    });
    setHotelList(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllHotels();
  }, []);

  // 审核操作：通过/驳回
  const handleAudit = async (id, status) => {
    const res = await updateHotel(id, { status });
    if (res) {
      message.success(status === 'published' ? '审核通过' : '已驳回');
      fetchAllHotels();
    } else {
      message.error('操作失败');
    }
  };

  // 删除酒店
  const handleDelete = async (id) => {
    const res = await deleteHotel(id);
    if (res) {
      message.success('删除成功');
      fetchAllHotels();
    } else {
      message.error('删除失败');
    }
  };

  // 状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待审核' },
      published: { color: 'green', text: '已上线' },
      rejected: { color: 'red', text: '已驳回' }
    };
    const config = statusMap[status] || {};
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200
    },
    {
      title: '星级',
      dataIndex: 'stars',
      key: 'stars',
      width: 80,
      render: (stars) => stars ? `${stars}星` : '-'
    },
    {
      title: '房型',
      dataIndex: 'roomType',
      key: 'roomType',
      width: 100
    },
    {
      title: '价格/晚',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => `¥${price}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="确认通过？"
                onConfirm={() => handleAudit(record.id, 'published')}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary" size="small" icon={<CheckOutlined />}>
                  通过
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确认驳回？"
                onConfirm={() => handleAudit(record.id, 'rejected')}
                okText="确认"
                cancelText="取消"
              >
                <Button danger size="small" icon={<CloseOutlined />}>
                  驳回
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status !== 'pending' && (
            <Popconfirm
              title="确认删除？"
              description="删除后无法恢复"
              onConfirm={() => handleDelete(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button danger size="small" icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>酒店信息审核管理</h2>
      <Table
        columns={columns}
        dataSource={hotelList}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default Audit;