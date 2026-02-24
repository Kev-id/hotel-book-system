import { useState } from 'react';
import { Card, Button, Input, message, Tabs } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import AISummaryCard from '../../../components/AISummaryCard';
import ReplySuggestionsModal from '../../../components/ReplySuggestionsModal';
import ReviewAnalytics from '../ReviewAnalytics';
import { aiApi } from '../../../api/aiApi';
import './styles.css';

const { TextArea } = Input;
const { TabPane } = Tabs;

const AIDemo = () => {
  const [hotelId, setHotelId] = useState('1');
  const [reviewContent, setReviewContent] = useState('房间很干净，服务态度好，但是隔音效果一般');
  const [rating, setRating] = useState(4.0);
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReply = async () => {
    setLoading(true);
    try {
      const response = await aiApi.generateReplySuggestions({
        reviewId: 1,
        reviewContent: reviewContent,
        overallRating: rating,
        hotelName: '北京国际大饭店'
      });
      
      if (response.success) {
        setSuggestions(response.data);
        setModalVisible(true);
      } else {
        message.error('生成失败');
      }
    } catch (error) {
      console.error('生成回复失败:', error);
      message.error('生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = (content) => {
    setModalVisible(false);
    if (content) {
      message.success('已使用该回复');
      console.log('使用的回复:', content);
    }
  };

  return (
    <div className="ai-demo-page">
      <Card className="demo-header">
        <div className="header-content">
          <RobotOutlined className="header-icon" />
          <div>
            <h1>AI功能演示中心</h1>
            <p>体验AI增强评价系统的所有功能</p>
          </div>
        </div>
      </Card>

      <Tabs defaultActiveKey="1" className="demo-tabs">
        {/* Tab 1: AI摘要 */}
        <TabPane tab="📊 AI评价摘要" key="1">
          <Card className="demo-card">
            <div className="demo-section">
              <h3>AI评价摘要</h3>
              <p className="section-desc">
                自动分析最近30条评价，生成智能摘要、优缺点、情感分析和高频关键词
              </p>
              
              <div className="input-group">
                <label>酒店ID:</label>
                <Input 
                  value={hotelId}
                  onChange={(e) => setHotelId(e.target.value)}
                  placeholder="输入酒店ID"
                  style={{ width: 200 }}
                />
              </div>

              <AISummaryCard hotelId={hotelId} />
            </div>
          </Card>
        </TabPane>

        {/* Tab 2: 智能回复 */}
        <TabPane tab="💬 智能回复建议" key="2">
          <Card className="demo-card">
            <div className="demo-section">
              <h3>AI智能回复建议</h3>
              <p className="section-desc">
                为商户生成3种不同风格的回复建议（专业、友好、补偿型）
              </p>

              <div className="input-group">
                <label>评价内容:</label>
                <TextArea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="输入评价内容"
                  rows={4}
                />
              </div>

              <div className="input-group">
                <label>评分:</label>
                <Input
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  min={1}
                  max={5}
                  step={0.1}
                  style={{ width: 200 }}
                />
              </div>

              <Button
                type="primary"
                size="large"
                onClick={handleGenerateReply}
                loading={loading}
                icon={<RobotOutlined />}
              >
                生成回复建议
              </Button>
            </div>
          </Card>
        </TabPane>

        {/* Tab 3: 趋势分析 */}
        <TabPane tab="📈 趋势分析" key="3">
          <Card className="demo-card">
            <div className="demo-section">
              <h3>AI评价趋势分析</h3>
              <p className="section-desc">
                分析评价趋势、热点问题、AI洞察建议
              </p>

              <ReviewAnalytics hotelId={hotelId} />
            </div>
          </Card>
        </TabPane>

        {/* Tab 4: 质量检测 */}
        <TabPane tab="🔍 质量检测" key="4">
          <Card className="demo-card">
            <div className="demo-section">
              <h3>AI评价质量检测</h3>
              <p className="section-desc">
                识别刷单、虚假评价，提供质量评分和建议
              </p>

              <div className="quality-demo">
                <div className="demo-example">
                  <h4>示例1: 可疑评价</h4>
                  <div className="example-content">
                    <p><strong>内容:</strong> 非常好，很满意！</p>
                    <p><strong>评分:</strong> 5.0分（所有维度都是5分）</p>
                    <p><strong>检测结果:</strong></p>
                    <div className="result-box suspicious">
                      <p>质量: <strong>可疑 (suspicious)</strong></p>
                      <p>置信度: <strong>85%</strong></p>
                      <p>标记:</p>
                      <ul>
                        <li>所有维度都是满分，可能存在刷单</li>
                        <li>评价内容过短（少于20字）</li>
                      </ul>
                      <p>建议: <strong>建议人工审核</strong></p>
                    </div>
                  </div>
                </div>

                <div className="demo-example">
                  <h4>示例2: 正常评价</h4>
                  <div className="example-content">
                    <p><strong>内容:</strong> 酒店位置很好，房间干净整洁，服务态度也不错。唯一的缺点是隔音效果一般，晚上能听到隔壁的声音。</p>
                    <p><strong>评分:</strong> 4.2分</p>
                    <p><strong>检测结果:</strong></p>
                    <div className="result-box good">
                      <p>质量: <strong>良好 (good)</strong></p>
                      <p>置信度: <strong>95%</strong></p>
                      <p>建议: <strong>可以正常发布</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* Reply Suggestions Modal */}
      <ReplySuggestionsModal
        visible={modalVisible}
        onClose={handleModalClose}
        suggestions={suggestions}
        loading={loading}
      />
    </div>
  );
};

export default AIDemo;
