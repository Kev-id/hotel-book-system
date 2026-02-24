import { useState, useEffect } from 'react';
import { Card, Rate, Tag, Avatar, Button, Empty, Spin, Pagination, message } from 'antd';
import { UserOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';
import './styles.css';

const ReviewList = ({ hotelId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    fetchReviews();
  }, [hotelId, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/reviews', {
        params: { hotelId, page, limit }
      });
      setReviews(response.data.reviews || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('获取评论失败:', error);
      message.error('加载评论失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId) => {
    try {
      await axios.post(`http://localhost:5000/api/reviews/${reviewId}/helpful`);
      message.success('点赞成功');
      fetchReviews();
    } catch (error) {
      message.error('点赞失败');
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      default: return 'default';
    }
  };

  const getSentimentText = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '好评';
      case 'negative': return '差评';
      default: return '中评';
    }
  };

  if (loading) {
    return (
      <Card className="review-list-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" tip="加载评论中..." />
        </div>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="review-list-card" title="用户评价">
        <Empty description="暂无评价" />
      </Card>
    );
  }

  return (
    <Card className="review-list-card" title={`用户评价 (${total})`}>
      <div className="reviews-container">
        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="review-user">
                <Avatar icon={<UserOutlined />} size={48} />
                <div className="user-info">
                  <div className="username">{review.username || '匿名用户'}</div>
                  <div className="review-date">
                    {new Date(review.create_time).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
              <div className="review-rating">
                <Rate disabled value={review.overall_rating} />
                <Tag color={getSentimentColor(review.sentiment)}>
                  {getSentimentText(review.sentiment)}
                </Tag>
              </div>
            </div>

            <div className="review-content">
              <p>{review.content}</p>
            </div>

            {review.tags && review.tags.length > 0 && (
              <div className="review-tags">
                {review.tags.map((tag, index) => (
                  <Tag key={index} color="blue">{tag}</Tag>
                ))}
              </div>
            )}

            {review.dimensions && Object.keys(review.dimensions).length > 0 && (
              <div className="review-dimensions">
                {review.dimensions.cleanliness && (
                  <div className="dimension-item">
                    <span>清洁卫生</span>
                    <Rate disabled value={review.dimensions.cleanliness} style={{ fontSize: 14 }} />
                  </div>
                )}
                {review.dimensions.service && (
                  <div className="dimension-item">
                    <span>服务态度</span>
                    <Rate disabled value={review.dimensions.service} style={{ fontSize: 14 }} />
                  </div>
                )}
                {review.dimensions.facilities && (
                  <div className="dimension-item">
                    <span>设施设备</span>
                    <Rate disabled value={review.dimensions.facilities} style={{ fontSize: 14 }} />
                  </div>
                )}
              </div>
            )}

            {review.merchantReply && (
              <div className="merchant-reply">
                <MessageOutlined style={{ marginRight: 8 }} />
                <span className="reply-label">商家回复：</span>
                <span className="reply-content">{review.merchantReply.content}</span>
              </div>
            )}

            <div className="review-actions">
              <Button
                type="text"
                icon={<LikeOutlined />}
                onClick={() => handleLike(review.id)}
              >
                有用 ({review.helpful || 0})
              </Button>
            </div>
          </div>
        ))}
      </div>

      {total > limit && (
        <div className="review-pagination">
          <Pagination
            current={page}
            total={total}
            pageSize={limit}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </Card>
  );
};

export default ReviewList;
