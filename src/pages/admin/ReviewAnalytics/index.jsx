import { useState, useEffect } from 'react';
import { Card, Spin, Empty, Button, Tag, Select, Statistic, Row, Col } from 'antd';
import { 
  LineChartOutlined,
  FireOutlined,
  BulbOutlined,
  ReloadOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  WarningOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { aiApi } from '../../../api/aiApi';
import './styles.css';

const { Option } = Select;

const ReviewAnalytics = ({ hotelId }) => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  const loadTrendData = async (selectedDays = days) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiApi.getReviewTrend(hotelId, selectedDays);
      if (response.success) {
        setTrendData(response.data);
      } else {
        setError('加载失败');
      }
    } catch (err) {
      console.error('加载趋势数据失败:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      loadTrendData();
    }
  }, [hotelId]);

  const handleDaysChange = (value) => {
    setDays(value);
    loadTrendData(value);
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving':
        return <RiseOutlined className="trend-icon improving" />;
      case 'declining':
        return <FallOutlined className="trend-icon declining" />;
      default:
        return <MinusOutlined className="trend-icon stable" />;
    }
  };

  const getTrendText = (direction) => {
    switch (direction) {
      case 'improving':
        return '上升趋势';
      case 'declining':
        return '下降趋势';
      default:
        return '保持稳定';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningOutlined className="insight-icon warning" />;
      case 'opportunity':
        return <TrophyOutlined className="insight-icon opportunity" />;
      default:
        return <BulbOutlined className="insight-icon info" />;
    }
  };

  if (loading) {
    return (
      <Card className="analytics-card loading-card">
        <div className="loading-content">
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#666' }}>AI正在分析评价趋势...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="analytics-card error-card">
        <Empty 
          description={error}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => loadTrendData()}>
            重新加载
          </Button>
        </Empty>
      </Card>
    );
  }

  if (!trendData) {
    return (
      <Card className="analytics-card empty-card">
        <Empty 
          description="暂无趋势数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div className="review-analytics">
      {/* Header */}
      <Card className="analytics-header">
        <div className="header-content">
          <div className="header-left">
            <LineChartOutlined className="header-icon" />
            <h2>评价趋势分析</h2>
          </div>
          <div className="header-right">
            <Select 
              value={days} 
              onChange={handleDaysChange}
              style={{ width: 120 }}
            >
              <Option value={7}>近7天</Option>
              <Option value={30}>近30天</Option>
              <Option value={90}>近90天</Option>
            </Select>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => loadTrendData()}
            >
              刷新
            </Button>
          </div>
        </div>
      </Card>

      {/* Trend Overview */}
      <Card className="trend-overview-card">
        <Row gutter={16}>
          <Col span={12}>
            <div className="trend-stat">
              {getTrendIcon(trendData.trend.direction)}
              <div className="trend-info">
                <div className="trend-label">评分趋势</div>
                <div className="trend-value">{getTrendText(trendData.trend.direction)}</div>
                <div className="trend-desc">{trendData.trend.description}</div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <Statistic
              title="评分变化"
              value={Math.abs(trendData.trend.change)}
              precision={2}
              valueStyle={{ 
                color: trendData.trend.change > 0 ? '#52c41a' : trendData.trend.change < 0 ? '#ff4d4f' : '#666'
              }}
              prefix={trendData.trend.change > 0 ? '+' : trendData.trend.change < 0 ? '-' : ''}
              suffix="分"
            />
          </Col>
        </Row>
      </Card>

      {/* Dimension Trends */}
      {trendData.dimensionTrends && Object.keys(trendData.dimensionTrends).length > 0 && (
        <Card className="dimension-trends-card" title="维度评分">
          <div className="dimension-list">
            {Object.entries(trendData.dimensionTrends).map(([key, value]) => (
              <div key={key} className="dimension-item">
                <div className="dimension-name">
                  {getDimensionLabel(key)}
                </div>
                <div className="dimension-score">
                  <span className="score-value">{value.avgScore}</span>
                  <span className="score-max">/5.0</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hot Issues */}
      {trendData.hotIssues && trendData.hotIssues.length > 0 && (
        <Card 
          className="hot-issues-card" 
          title={
            <div className="card-title">
              <FireOutlined className="title-icon" />
              <span>热点问题</span>
            </div>
          }
        >
          <div className="issues-list">
            {trendData.hotIssues.map((issue, index) => (
              <div key={index} className={`issue-card severity-${issue.severity}`}>
                <div className="issue-header">
                  <div className="issue-name">{issue.issue}</div>
                  <Tag color={getSeverityColor(issue.severity)}>
                    {issue.severity === 'high' ? '高' : issue.severity === 'medium' ? '中' : '低'}
                  </Tag>
                </div>
                <div className="issue-stats">
                  <span className="mentions">{issue.mentions} 次提及</span>
                  <span className="trend">
                    {issue.trend === 'increasing' ? '📈 增加中' : '➡️ 稳定'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Insights */}
      {trendData.insights && trendData.insights.length > 0 && (
        <Card 
          className="insights-card"
          title={
            <div className="card-title">
              <BulbOutlined className="title-icon" />
              <span>AI洞察</span>
            </div>
          }
        >
          <div className="insights-list">
            {trendData.insights.map((insight, index) => (
              <div key={index} className={`insight-card type-${insight.type}`}>
                <div className="insight-header">
                  {getInsightIcon(insight.type)}
                  <h4>{insight.title}</h4>
                </div>
                <p className="insight-description">{insight.description}</p>
                <div className="insight-recommendation">
                  <strong>建议：</strong>
                  <span>{insight.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Fallback Message */}
      {trendData.isFallback && trendData.message && (
        <Card className="fallback-card">
          <Tag color="orange" icon={<WarningOutlined />}>
            {trendData.message}
          </Tag>
        </Card>
      )}
    </div>
  );
};

// Helper function
const getDimensionLabel = (key) => {
  const labels = {
    cleanliness: '清洁度',
    service: '服务',
    facilities: '设施',
    location: '位置',
    valueForMoney: '性价比'
  };
  return labels[key] || key;
};

export default ReviewAnalytics;
