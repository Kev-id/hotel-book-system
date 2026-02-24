import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import analyticsApi from '../../../api/analyticsApi';
import './styles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  
  const [overview, setOverview] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [roomRanking, setRoomRanking] = useState([]);
  
  const [aiInsights, setAiInsights] = useState(null);
  const [aiPricing, setAiPricing] = useState([]);
  const [aiAlerts, setAiAlerts] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, trendRes, rankingRes] = await Promise.all([
        analyticsApi.getOverview(period),
        analyticsApi.getTrend(period),
        analyticsApi.getRoomRanking(period)
      ]);
      
      setOverview(overviewRes.data);
      setTrendData(trendRes.data);
      setRoomRanking(rankingRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIData = async () => {
    setAiLoading(true);
    
    try {
      // 使用 Promise.allSettled 确保单点故障不扩散
      const results = await Promise.allSettled([
        analyticsApi.getAIInsights(period),
        analyticsApi.getAIPricing(period),
        analyticsApi.getAIAlerts(period)
      ]);
      
      if (results[0].status === 'fulfilled') {
        setAiInsights(results[0].value.data);
      } else {
        setAiInsights({ opportunities: [], risks: [], error: '加载失败' });
      }
      
      if (results[1].status === 'fulfilled') {
        setAiPricing(results[1].value.data);
      } else {
        setAiPricing([]);
      }
      
      if (results[2].status === 'fulfilled') {
        setAiAlerts(results[2].value.data);
      } else {
        setAiAlerts([]);
      }
      
    } catch (error) {
      console.error('加载AI数据异常:', error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">加载中...</div>;
  }

  // 空数据处理
  if (!overview || overview.totalOrders === 0) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>暂无数据</h3>
          <p>您还没有订单数据，快去接待第一位客人吧！</p>
        </div>
      </div>
    );
  }

  const orderTrendConfig = {
    labels: trendData.map(d => new Date(d.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: '订单量',
      data: trendData.map(d => d.orders),
      borderColor: 'rgb(102, 126, 234)',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4
    }]
  };

  const revenueTrendConfig = {
    labels: trendData.map(d => new Date(d.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: '营收（元）',
      data: trendData.map(d => d.revenue),
      backgroundColor: 'rgba(118, 75, 162, 0.8)',
      borderColor: 'rgb(118, 75, 162)',
      borderWidth: 1
    }]
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 数据看板</h1>
        <div className="period-selector">
          <button className={period === '7' ? 'active' : ''} onClick={() => setPeriod('7')}>近7天</button>
          <button className={period === '30' ? 'active' : ''} onClick={() => setPeriod('30')}>近30天</button>
          <button className={period === '90' ? 'active' : ''} onClick={() => setPeriod('90')}>近90天</button>
        </div>
      </div>

      {/* 数据概览卡片 */}
      <div className="overview-cards">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">总订单量</div>
            <div className="stat-value">{overview.totalOrders}</div>
            <div className={`stat-change ${overview.orderGrowth >= 0 ? 'positive' : 'negative'}`}>
              {overview.orderGrowth >= 0 ? '↑' : '↓'} {Math.abs(overview.orderGrowth)}%
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">总营收</div>
            <div className="stat-value">¥{overview.totalRevenue.toLocaleString()}</div>
            <div className={`stat-change ${overview.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
              {overview.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(overview.revenueGrowth)}%
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏨</div>
          <div className="stat-content">
            <div className="stat-label">平均入住率</div>
            <div className="stat-value">{overview.avgOccupancy}%</div>
            <div className="stat-change neutral">
              {overview.avgOccupancy >= 70 ? '优秀' : overview.avgOccupancy >= 50 ? '良好' : '待提升'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-label">平均评分</div>
            <div className="stat-value">{overview.avgRating}</div>
            <div className="stat-change neutral">
              {overview.avgRating >= 4.5 ? '优秀' : overview.avgRating >= 4.0 ? '良好' : '待提升'}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* 左侧：图表区域 */}
        <div className="charts-section">
          <div className="chart-card">
            <h3>📈 订单趋势</h3>
            <Line data={orderTrendConfig} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>

          <div className="chart-card">
            <h3>💰 营收趋势</h3>
            <Bar data={revenueTrendConfig} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>

          <div className="ranking-card">
            <h3>🏆 热门房型排行</h3>
            <div className="ranking-list">
              {roomRanking.map((room, index) => (
                <div key={room.room_type} className="ranking-item">
                  <div className="ranking-number">{index + 1}</div>
                  <div className="ranking-info">
                    <div className="ranking-name">{room.room_type}</div>
                    <div className="ranking-stats">
                      {room.orders}单 · ¥{room.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="ranking-bar">
                    <div 
                      className="ranking-bar-fill" 
                      style={{ width: `${(room.orders / roomRanking[0].orders) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：AI洞察区域 */}
        <div className="ai-section">
          {!aiInsights && !aiLoading && (
            <button className="ai-analyze-btn" onClick={loadAIData}>
              🤖 AI 智能分析
            </button>
          )}

          {aiLoading && (
            <div className="ai-loading">
              <div className="spinner"></div>
              <p>AI正在分析数据...</p>
            </div>
          )}

          {aiInsights && (
            <>
              {/* AI数据洞察 */}
              <div className="ai-card insights-card">
                <h3>🤖 AI 数据洞察</h3>
                {aiInsights.isFallback && (
                  <div className="fallback-badge">规则引擎</div>
                )}
                
                {aiInsights.opportunities && aiInsights.opportunities.length > 0 && (
                  <div className="insights-section">
                    <h4 className="insights-title opportunities">✅ 机会点</h4>
                    {aiInsights.opportunities.map((item, index) => (
                      <div key={index} className="insight-item">
                        <div className="insight-finding">{item.finding}</div>
                        <div className="insight-suggestion">💡 {item.suggestion}</div>
                      </div>
                    ))}
                  </div>
                )}

                {aiInsights.risks && aiInsights.risks.length > 0 && (
                  <div className="insights-section">
                    <h4 className="insights-title risks">⚠️ 风险点</h4>
                    {aiInsights.risks.map((item, index) => (
                      <div key={index} className="insight-item">
                        <div className="insight-finding">{item.finding}</div>
                        <div className="insight-suggestion">💡 {item.suggestion}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI定价建议 */}
              {aiPricing.length > 0 && (
                <div className="ai-card pricing-card">
                  <h3>💰 AI 定价建议</h3>
                  {aiPricing.map((item, index) => (
                    <div key={index} className="pricing-item">
                      <div className="pricing-header">
                        <span className="pricing-room-type">{item.roomType}</span>
                        {item.change !== 0 && (
                          <span className={`pricing-change ${item.change > 0 ? 'up' : 'down'}`}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </span>
                        )}
                      </div>
                      <div className="pricing-prices">
                        <div className="pricing-current">当前：¥{item.currentPrice}/晚</div>
                        <div className="pricing-arrow">→</div>
                        <div className="pricing-suggested">建议：¥{item.suggestedPrice}/晚</div>
                      </div>
                      <div className="pricing-reason">{item.reason}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI异常预警 */}
              {aiAlerts.length > 0 && (
                <div className="ai-card alerts-card">
                  <h3>🚨 AI 异常预警</h3>
                  {aiAlerts.map((alert, index) => (
                    <div key={index} className={`alert-item ${alert.severity}`}>
                      <div className="alert-header">
                        <span className="alert-icon">
                          {alert.severity === 'error' ? '🔴' : '⚠️'}
                        </span>
                        <span className="alert-title">{alert.title}</span>
                      </div>
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-suggestion">💡 {alert.suggestion}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
