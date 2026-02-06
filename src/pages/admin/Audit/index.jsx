import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { getHotelList, updateHotel, deleteHotel } from '../../../api/hotelApi';
import { Table, Button, Space, Tag, Popconfirm, message, Modal, Input, Form } from 'antd';
import { DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const Audit = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hotelList, setHotelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [form] = Form.useForm();

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

  // 审核操作：通过
  const handleApprove = async (id) => {
    const res = await updateHotel(id, { status: 'published' });
    if (res) {
      message.success('审核通过');
      fetchAllHotels();
    } else {
      message.error('操作失败');
    }
  };

  // 显示驳回原因输入框
  const showRejectModal = (id) => {
    setSelectedHotelId(id);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // 提交驳回
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error('请输入驳回原因');
      return;
    }
    const res = await updateHotel(selectedHotelId, { 
      status: 'rejected',
      rejectReason: rejectReason.trim()
    });
    if (res) {
      message.success('已驳回');
      setRejectModalVisible(false);
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
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags) => {
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
          return <span style={{ color: '#999' }}>无</span>;
        }
        return (
          <Space size={[0, 4]} wrap>
            {tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} color="blue" style={{ fontSize: '12px' }}>
                {tag}
              </Tag>
            ))}
            {tags.length > 3 && (
              <Tag color="default" style={{ fontSize: '12px' }}>
                +{tags.length - 3}
              </Tag>
            )}
          </Space>
        );
      }
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
                onConfirm={() => handleApprove(record.id)}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary" size="small" icon={<CheckOutlined />}>
                  通过
                </Button>
              </Popconfirm>
              <Button 
                danger 
                size="small" 
                icon={<CloseOutlined />}
                onClick={() => showRejectModal(record.id)}
              >
                驳回
              </Button>
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
        scroll={{ x: 1400 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '12px 24px', background: '#fafafa' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#333' }}>
                酒店介绍：
              </p>
              <p style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>
                {record.description || '暂无介绍'}
              </p>
            </div>
          ),
          rowExpandable: (record) => !!record.description,
        }}
      />

      <Modal
        title="驳回酒店"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="确认驳回"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="驳回原因" required>
            <Input.TextArea
              rows={4}
              placeholder="请输入驳回原因，商户将看到此信息"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Audit;