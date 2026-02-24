import { useState, useEffect } from 'react';
import { Card, Spin, Tag, Progress, Empty, Button } from 'antd';
import { 
  RobotOutlined, 
  LikeOutlined, 
  DislikeOutlined,
  ReloadOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { aiApi } from '../../api/aiApi';
import './styles.css';

const AISummaryCard = ({ hotelId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSummary = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiApi.getReviewSummary(hotelId, force);
      if (response.success) {
        setSummary(response.data);
      } else {
        setError('加载失败');
      }
    } catch (err) {
      console.error('加载AI摘要失败:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [hotelId]);

  if (loading) {
    return (
      <Card className="ai-summary-card loading-card">
        <div className="loading-content">
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#666' }}>AI正在分析评价...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="ai-summary-card error-card">
        <Empty 
          description={error}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => loadSummary()}>
            重新加载
          </Button>
        </Empty>
      </Card>
    );
  }

  if (!summary || summary.reviewsAnalyzed === 0) {
    return (
      <Card className="ai-summary-card empty-card">
        <Empty 
          description="暂无足够评价生成AI摘要"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card className="ai-summary-card">
      {/* Header */}
      <div className="ai-card-header">
        <div className="ai-badge">
          <RobotOutlined className="ai-icon" />
          <span className="ai-text">AI智能摘要</span>
          {summary.isFallback && (
            <Tag color="orange" style={{ marginLeft: 8 }}>基础版</Tag>
          )}
        </div>
        <div className="ai-meta">
          <span className="review-count">
            基于 {summary.reviewsAnalyzed} 条评价
          </span>
          {summary.cached && (
            <Tag color="blue" icon={<ThunderboltOutlined />}>已缓存</Tag>
          )}
          <Button 
            type="text" 
            size="small" 
            icon={<ReloadOutlined />}
            onClick={() => loadSummary(true)}
            title="刷新摘要"
          />
        </div>
      </div>

      {/* Summary Content */}
      <div className="summary-content">
        <p className="summary-text">{summary.summary}</p>
      </div>

      {/* Pros and Cons */}
      {(summary.pros?.length > 0 || summary.cons?.length > 0) && (
        <div className="pros-cons-section">
          {summary.pros?.length > 0 && (
            <div className="pros-section">
              <div className="section-title">
                <LikeOutlined className="section-icon pros-icon" />
                <span>优点</span>
              </div>
              <ul className="points-list">
                {summary.pros.map((pro, index) => (
                  <li key={index} className="point-item pros-item">
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.cons?.length > 0 && (
            <div className="cons-section">
              <div className="section-title">
                <DislikeOutlined className="section-icon cons-icon" />
                <span>需要改进</span>
              </div>
              <ul className="points-list">
                {summary.cons.map((con, index) => (
                  <li key={index} className="point-item cons-item">
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Sentiment Bar */}
      {summary.sentiment && (
        <div className="sentiment-section">
          <div className="sentiment-title">评价分布</div>
          <div className="sentiment-bars">
            <div className="sentiment-bar-wrapper">
              <Progress 
                percent={summary.sentiment.positive} 
                strokeColor="#52c41a"
                format={percent => `${percent}% 好评`}
                className="sentiment-progress positive"
              />
            </div>
            <div className="sentiment-bar-wrapper">
              <Progress 
                percent={summary.sentiment.neutral} 
                strokeColor="#faad14"
                format={percent => `${percent}% 中评`}
                className="sentiment-progress neutral"
              />
            </div>
            <div className="sentiment-bar-wrapper">
              <Progress 
                percent={summary.sentiment.negative} 
                strokeColor="#ff4d4f"
                format={percent => `${percent}% 差评`}
                className="sentiment-progress negative"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {summary.tags?.length > 0 && (
        <div className="tags-section">
          <div className="tags-title">高频关键词</div>
          <div className="tags-list">
            {summary.tags.map((tag, index) => (
              <Tag 
                key={index} 
                className="keyword-tag"
                color="blue"
              >
                {tag.name} ({tag.count})
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Fallback Message */}
      {summary.isFallback && summary.message && (
        <div className="fallback-message">
          <Tag color="orange">{summary.message}</Tag>
        </div>
      )}
    </Card>
  );
};

export default AISummaryCard;
