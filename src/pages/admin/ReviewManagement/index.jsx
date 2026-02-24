import { useState, useEffect } from 'react';
import { Card, Table, Rate, Tag, Button, Modal, Input, message, Space, Spin } from 'antd';
import { MessageOutlined, ThunderboltOutlined } from '@ant-design/icons';
import axios from 'axios';
import { aiApi } from '../../../api/aiApi';
import ReplySuggestionsModal from '../../../components/ReplySuggestionsModal';
import './styles.css';

const { TextArea } = Input;

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  // AI回复建议相关状态
  const [aiSuggestionsVisible, setAiSuggestionsVisible] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [pagination.current]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // 获取当前登录的商家信息
      const userStr = localStorage.getItem('hotelUser');
      if (!userStr) {
        message.error('请先登录');
        return;
      }
      
      const user = JSON.parse(userStr);
      
      // 获取商家的酒店列表
      const hotelsResponse = await axios.get('http://localhost:5000/api/hotels', {
        params: { merchantId: user.id }
      });
      
      const hotels = hotelsResponse.data;
      if (!hotels || hotels.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // 获取所有酒店的评论
      const allReviews = [];
      for (const hotel of hotels) {
        const reviewsResponse = await axios.get('http://localhost:5000/api/reviews', {
          params: { hotelId: hotel.id, page: pagination.current, limit: pagination.pageSize }
        });
        
        if (reviewsResponse.data.reviews) {
          allReviews.push(...reviewsResponse.data.reviews.map(r => ({
            ...r,
            hotelName: hotel.name
          })));
        }
      }

      setReviews(allReviews);
      setPagination(prev => ({ ...prev, total: allReviews.length }));
    } catch (error) {
      console.error('获取评论失败:', error);
      message.error('加载评论失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyContent('');
    setReplyModalVisible(true);
  };

  // 获取AI回复建议
  const handleGetAISuggestions = async () => {
    if (!selectedReview) return;
    
    setAiLoading(true);
    try {
      // 获取酒店名称
      const hotelName = selectedReview.hotelName || '酒店';
      
      const response = await aiApi.generateReplySuggestions({
        reviewId: selectedReview.id,
        reviewContent: selectedReview.content,
        overallRating: selectedReview.overall_rating,
        hotelName: hotelName
      });
      
      if (response.success) {
        setAiSuggestions(response.data);
        setAiSuggestionsVisible(true);
      } else {
        message.error(response.message || 'AI回复生成失败');
      }
    } catch (error) {
      console.error('获取AI回复建议失败:', error);
      message.error('获取AI回复建议失败');
    } finally {
      setAiLoading(false);
    }
  };

  // 使用AI建议的回复
  const handleUseAISuggestion = (content) => {
    setReplyContent(content);
    setAiSuggestionsVisible(false);
    message.success('已填充AI建议的回复内容');
  };

  const submitReply = async () => {
    if (!replyContent.trim()) {
      message.warning('请输入回复内容');
      return;
    }

    try {
      const userStr = localStorage.getItem('hotelUser');
      const user = JSON.parse(userStr);

      await axios.post(`http://localhost:5000/api/reviews/${selectedReview.id}/reply`, {
        content: replyContent,
        merchantId: user.id
      });

      message.success('回复成功');
      setReplyModalVisible(false);
      fetchReviews();
    } catch (error) {
      message.error('回复失败');
    }
  };

  const columns = [
    {
      title: '酒店',
      dataIndex: 'hotelName',
      key: 'hotelName',
      width: 150,
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 100,
      render: (text) => text || '匿名用户'
    },
    {
      title: '评分',
      dataIndex: 'overall_rating',
      key: 'rating',
      width: 150,
      render: (rating) => <Rate disabled value={rating} />
    },
    {
      title: '情感',
      dataIndex: 'sentiment',
      key: 'sentiment',
      width: 80,
      render: (sentiment) => {
        const colorMap = { positive: 'success', negative: 'error', neutral: 'default' };
        const textMap = { positive: '好评', negative: '差评', neutral: '中评' };
        return <Tag color={colorMap[sentiment]}>{textMap[sentiment]}</Tag>;
      }
    },
    {
      title: '评价内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'create_time',
      key: 'time',
      width: 120,
      render: (time) => new Date(time).toLocaleDateString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => handleReply(record)}
            disabled={!!record.merchantReply}
          >
            {record.merchantReply ? '已回复' : '回复'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="review-management-container">
      <Card title="评论管理" className="review-management-card">
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) => setPagination(newPagination)}
        />
      </Card>

      <Modal
        title="回复评价"
        open={replyModalVisible}
        onOk={submitReply}
        onCancel={() => setReplyModalVisible(false)}
        okText="提交回复"
        cancelText="取消"
        width={700}
      >
        {selectedReview && (
          <div className="reply-modal-content">
            <div className="review-info">
              <p><strong>用户：</strong>{selectedReview.username || '匿名用户'}</p>
              <p><strong>评分：</strong><Rate disabled value={selectedReview.overall_rating} /></p>
              <p><strong>内容：</strong>{selectedReview.content}</p>
            </div>
            
            {/* AI回复建议按钮 */}
            <div className="ai-suggestion-section">
              <Button
                type="dashed"
                icon={<ThunderboltOutlined />}
                onClick={handleGetAISuggestions}
                loading={aiLoading}
                block
                className="ai-suggestion-button"
              >
                {aiLoading ? 'AI正在生成回复建议...' : '获取AI智能回复建议'}
              </Button>
            </div>

            <TextArea
              rows={6}
              placeholder="请输入回复内容，或点击上方按钮获取AI建议..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              maxLength={500}
              showCount
            />
          </div>
        )}
      </Modal>

      {/* AI回复建议弹窗 */}
      <ReplySuggestionsModal
        visible={aiSuggestionsVisible}
        onClose={(content) => {
          if (content) {
            handleUseAISuggestion(content);
          } else {
            setAiSuggestionsVisible(false);
          }
        }}
        suggestions={aiSuggestions}
        loading={false}
      />
    </div>
  );
};

export default ReviewManagement;
