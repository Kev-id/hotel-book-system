import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import favoriteApi from '../../../api/favoriteApi';
import './styles.css';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['全部', '🏢 商务出行', '🏖️ 度假休闲', '💰 性价比之选', '👨‍👩‍👧 亲子家庭'];

  // 初始加载
  useEffect(() => {
    loadFavorites();
    loadRecommendations();
  }, []);

  // 分类切换时只重新加载收藏列表
  useEffect(() => {
    if (selectedCategory) {
      setSelectedHotels([]);  // 切换分类时清空选中
      loadFavorites();
    }
  }, [selectedCategory]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = selectedCategory === '全部' ? {} : { category: selectedCategory };
      const data = await favoriteApi.getFavorites(params);
      setFavorites(data);
    } catch (error) {
      setError('加载失败，请刷新重试');
      console.error('加载收藏失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await favoriteApi.getAIRecommendations();
      setRecommendations(data.slice(0, 3));
    } catch (error) {
      console.error('加载推荐失败:', error);
      // AI推荐失败不影响主功能，静默处理
    }
  };

  const handleRemoveFavorite = async (hotelId) => {
    try {
      await favoriteApi.removeFavorite(hotelId);
      loadFavorites();
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  const handleSelectHotel = (hotelId) => {
    setSelectedHotels(prev => {
      if (prev.includes(hotelId)) {
        return prev.filter(id => id !== hotelId);
      } else if (prev.length < 3) {
        return [...prev, hotelId];
      } else {
        alert('最多选择3个酒店进行对比');
        return prev;
      }
    });
  };

  const handleCompare = () => {
    if (selectedHotels.length < 2) {
      alert('请至少选择2个酒店进行对比');
      return;
    }
    navigate(`/compare?hotels=${selectedHotels.join(',')}`);
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>我的收藏</h1>
        {selectedHotels.length > 0 && (
          <button className="compare-btn" onClick={handleCompare}>
            对比选中的酒店 ({selectedHotels.length})
          </button>
        )}
      </div>

      {/* AI分类标签 */}
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 收藏列表 */}
      <div className="favorites-list">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadFavorites}>重试</button>
          </div>
        )}
        {loading && favorites.length === 0 ? (
          <div className="loading">加载中...</div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            <p>暂无收藏</p>
            <button onClick={() => navigate('/list')}>去看看酒店</button>
          </div>
        ) : (
          favorites.map(fav => (
            <div key={fav.id} className="favorite-card">
              <input
                type="checkbox"
                className="select-checkbox"
                checked={selectedHotels.includes(fav.hotel_id)}
                onChange={() => handleSelectHotel(fav.hotel_id)}
              />
              <img 
                src={fav.images?.[0] || '/placeholder.png'} 
                alt={fav.name}
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
              <div className="favorite-info">
                <h3>{fav.name}</h3>
                <p className="address">{fav.address}</p>
                <div className="rating">⭐ {fav.rating}</div>
                <div className="price">¥{fav.price}/晚</div>
                {fav.note && (
                  <div className="ai-reason">
                    🤖 {fav.note}
                  </div>
                )}
                <div className="category-badge">{fav.category}</div>
              </div>
              <button
                className="remove-btn"
                onClick={() => handleRemoveFavorite(fav.hotel_id)}
              >
                取消收藏
              </button>
            </div>
          ))
        )}
      </div>

      {/* AI推荐模块 */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2>🤖 AI为您推荐</h2>
          <div className="recommendations-grid">
            {recommendations.map(hotel => (
              <div
                key={hotel.id}
                className="recommendation-card"
                onClick={() => navigate(`/detail/${hotel.id}`)}
              >
                <img 
                  src={hotel.images?.[0] || '/placeholder.png'} 
                  alt={hotel.name}
                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                />
                <div className="recommendation-info">
                  <h3>{hotel.name}</h3>
                  <div className="ai-reason">
                    💡 {hotel.aiReason}
                  </div>
                  <div className="price">¥{hotel.price}/晚</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
