import { useState, useEffect, useContext } from 'react';
import { Button, message } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import favoriteApi from '../../api/favoriteApi';
import './styles.css';

const FavoriteButton = ({ hotelId, size = 'middle', type = 'default' }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && hotelId) {
      checkFavoriteStatus();
    }
  }, [user, hotelId]);

  const checkFavoriteStatus = async () => {
    try {
      const result = await favoriteApi.checkFavorite(hotelId);
      setIsFavorited(result.isFavorited);
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation(); // 阻止事件冒泡

    if (!user) {
      message.warning('请先登录');
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    try {
      if (isFavorited) {
        await favoriteApi.removeFavorite(hotelId);
        setIsFavorited(false);
        message.success('已取消收藏');
      } else {
        const result = await favoriteApi.addFavorite(hotelId);
        setIsFavorited(true);
        
        // 显示AI分类结果
        if (result.category) {
          message.success({
            content: (
              <div>
                <div>收藏成功！</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  🤖 AI分类：{result.category}
                </div>
                {result.reason && (
                  <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                    💡 {result.reason}
                  </div>
                )}
              </div>
            ),
            duration: 5
          });
        } else {
          message.success('收藏成功');
        }
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      message.error(error.error || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type={type}
      size={size}
      icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
      onClick={handleFavorite}
      loading={loading}
      className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
      danger={isFavorited}
    >
      {isFavorited ? '已收藏' : '收藏'}
    </Button>
  );
};

export default FavoriteButton;
