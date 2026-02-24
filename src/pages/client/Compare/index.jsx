import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import favoriteApi from '../../../api/favoriteApi';
import './styles.css';

const Compare = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hotelIdsStr = searchParams.get('hotels');
    
    // URL参数验证
    const hotelIds = hotelIdsStr
      ?.split(',')
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id) && id > 0);

    if (!hotelIds || hotelIds.length < 2) {
      setError('无效的对比参数，请至少选择2个酒店');
      setLoading(false);
      return;
    }

    loadComparison(hotelIds);
  }, [searchParams]);

  const loadComparison = async (hotelIds) => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoriteApi.compareHotels(hotelIds);
      setHotels(data.hotels);
      setAnalysis(data.analysis);
    } catch (error) {
      setError('加载对比失败，请检查酒店ID是否正确');
      console.error('加载对比失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComparisonClass = (value, values, type) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // 价格越低越好，评分越高越好
    if (type === 'price') {
      if (value === min && max !== min) return 'best';
      if (value === max && max !== min) return 'worst';
    } else {
      // rating等越高越好
      if (value === max && max !== min) return 'best';
      if (value === min && max !== min) return 'worst';
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="compare-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>正在加载对比数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compare-page">
        <div className="error-message">
          {error}
          <button onClick={() => window.history.back()}>返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <h1>酒店对比</h1>

      {/* AI分析卡片 */}
      {analysis && (
        <div className="ai-analysis-card">
          <h2>🤖 AI智能分析</h2>
          <p className="summary">{analysis.summary}</p>
          
          <div className="key-differences">
            <h3>核心差异：</h3>
            <ul>
              {analysis.keyDifferences.map((diff, idx) => (
                <li key={idx}>{diff}</li>
              ))}
            </ul>
          </div>

          <div className="recommendations">
            {analysis.recommendations.map(rec => {
              const hotel = hotels.find(h => h.id === rec.hotelId);
              return (
                <div key={rec.hotelId} className="recommendation-badge">
                  <span className="label">{rec.label}</span>
                  <span className="hotel-name">{hotel?.name}</span>
                  <span className="reason">{rec.reason}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 对比表格 */}
      <div className="compare-table">
        <table>
          <thead>
            <tr>
              <th>对比项</th>
              {hotels.map(hotel => (
                <th key={hotel.id}>
                  <img 
                    src={hotel.images?.[0] || '/placeholder.png'} 
                    alt={hotel.name}
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                  <div className="hotel-name">{hotel.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>价格</td>
              {hotels.map(hotel => (
                <td
                  key={hotel.id}
                  className={getComparisonClass(
                    hotel.price,
                    hotels.map(h => h.price),
                    'price'
                  )}
                >
                  ¥{hotel.price}/晚
                </td>
              ))}
            </tr>
            <tr>
              <td>评分</td>
              {hotels.map(hotel => (
                <td
                  key={hotel.id}
                  className={getComparisonClass(
                    hotel.rating,
                    hotels.map(h => h.rating),
                    'rating'
                  )}
                >
                  ⭐ {hotel.rating}
                </td>
              ))}
            </tr>
            <tr>
              <td>位置</td>
              {hotels.map(hotel => (
                <td key={hotel.id}>{hotel.address}</td>
              ))}
            </tr>
            <tr>
              <td>设施</td>
              {hotels.map(hotel => (
                <td key={hotel.id}>
                  <div className="facilities">
                    {hotel.facilities?.slice(0, 5).map((f, idx) => (
                      <span key={idx} className="facility-tag">{f}</span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compare;
