import { Modal, Button, Card, Tag, message } from 'antd';
import { 
  CopyOutlined, 
  CheckOutlined,
  BulbOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import './styles.css';

const ReplySuggestionsModal = ({ visible, onClose, suggestions, loading }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content).then(() => {
      message.success('已复制到剪贴板');
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(() => {
      message.error('复制失败');
    });
  };

  const handleUse = (content) => {
    // 触发父组件的使用回复事件
    if (onClose) {
      onClose(content);
    }
  };

  const getStyleBadgeColor = (style) => {
    const colors = {
      professional: 'blue',
      friendly: 'green',
      compensatory: 'orange'
    };
    return colors[style] || 'default';
  };

  const getStyleLabel = (style) => {
    const labels = {
      professional: '专业正式',
      friendly: '友好亲切',
      compensatory: '补偿型'
    };
    return labels[style] || style;
  };

  const getToneLabel = (tone) => {
    const labels = {
      formal: '正式',
      casual: '随意',
      apologetic: '道歉'
    };
    return labels[tone] || tone;
  };

  return (
    <Modal
      title={
        <div className="modal-title">
          <ThunderboltOutlined className="title-icon" />
          <span>AI智能回复建议</span>
        </div>
      }
      open={visible}
      onCancel={() => onClose && onClose()}
      footer={null}
      width={800}
      className="reply-suggestions-modal"
    >
      {loading ? (
        <div className="loading-content">
          <div className="loading-spinner" />
          <p>AI正在生成回复建议...</p>
        </div>
      ) : suggestions ? (
        <div className="suggestions-content">
          {/* Suggestions List */}
          <div className="suggestions-list">
            {suggestions.suggestions?.map((suggestion, index) => (
              <Card 
                key={index} 
                className="suggestion-card"
                hoverable
              >
                <div className="suggestion-header">
                  <div className="style-badges">
                    <Tag color={getStyleBadgeColor(suggestion.style)}>
                      {getStyleLabel(suggestion.style)}
                    </Tag>
                    <Tag>{getToneLabel(suggestion.tone)}</Tag>
                  </div>
                </div>
                
                <div className="suggestion-content">
                  <p>{suggestion.content}</p>
                </div>
                
                <div className="suggestion-actions">
                  <Button
                    type="primary"
                    icon={copiedIndex === index ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={() => handleCopy(suggestion.content, index)}
                  >
                    {copiedIndex === index ? '已复制' : '复制'}
                  </Button>
                  <Button
                    onClick={() => handleUse(suggestion.content)}
                  >
                    使用此回复
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          {suggestions.tips && suggestions.tips.length > 0 && (
            <Card className="tips-card">
              <div className="tips-header">
                <BulbOutlined className="tips-icon" />
                <span className="tips-title">回复建议</span>
              </div>
              <ul className="tips-list">
                {suggestions.tips.map((tip, index) => (
                  <li key={index} className="tip-item">
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Fallback Message */}
          {suggestions.isFallback && suggestions.message && (
            <div className="fallback-notice">
              <Tag color="orange">{suggestions.message}</Tag>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-content">
          <p>暂无回复建议</p>
        </div>
      )}
    </Modal>
  );
};

export default ReplySuggestionsModal;
