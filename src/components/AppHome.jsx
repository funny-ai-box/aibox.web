import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Layout, Typography, message, Avatar, Space } from 'antd';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import '../App.css';
import { getCurrentUser, logout } from '../utils/http';
import { appCards } from '../routes/config';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function AppHome() {
  const [user, setUser] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  useEffect(() => {
    const userInfo = getCurrentUser();
    if (userInfo) {
      setUser(userInfo.userInfo);
    }
  }, []);

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
  };

  // 筛选应用卡片的函数
  const filterApps = () => {
    let filtered = [...appCards];
    
    // 如果有搜索值，按名称或描述过滤
    if (searchValue) {
      filtered = filtered.filter(app => 
        app.title.toLowerCase().includes(searchValue.toLowerCase()) || 
        app.description.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    
    // 如果选择了特定分类（非"全部"），则按分类过滤
    if (activeCategory !== '全部') {
      filtered = filtered.filter(app => app.category === activeCategory);
    }
    
    return filtered;
  };

  // 获取所有应用分类
  const getCategories = () => {
    const categories = ['全部'];
    appCards.forEach(app => {
      if (app.category && !categories.includes(app.category)) {
        categories.push(app.category);
      }
    });
    return categories;
  };

  // 根据应用ID获取背景颜色
  const getGradientStyle = (id) => {
    const gradients = [
      'linear-gradient(135deg, #6366f1, #818cf8)',
      'linear-gradient(135deg, #10b981, #34d399)',
      'linear-gradient(135deg, #f59e0b, #fbbf24)',
      'linear-gradient(135deg, #ec4899, #f472b6)',
      'linear-gradient(135deg, #3b82f6, #60a5fa)',
      'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      'linear-gradient(135deg, #0891b2, #22d3ee)',
      'linear-gradient(135deg, #f43f5e, #fb7185)'
    ];
    
    return gradients[id % gradients.length];
  };

  const filteredApps = filterApps();
  const categories = getCategories();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header className="header" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="logo-container">
        <Title level={3} style={{ margin: 0, marginRight: '20px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI应用中心</Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
      
          {user && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '15px', color: 'var(--text-color)' }}>
                欢迎，{user.name}
              </span>
              <a
                onClick={handleLogout}
                style={{ color: 'var(--light-text)' }}
              >
                退出登录
              </a>
            </div>
          )}
        </div>
      </Header>

      <Content style={{ padding: '24px 50px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '20px' }}>
 
          <Text style={{ color: 'var(--light-text)', fontSize: '1.1rem', display: 'block', maxWidth: '600px', margin: '0 auto' }}>
          
          </Text>
        </div>
        
        {/* 搜索框 */}
        <div style={{ maxWidth: '600px', margin: '0 auto 35px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="搜索AI工具..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ 
              width: '100%',
              padding: '16px 24px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '16px',
              backgroundColor: 'white',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              fontSize: '1.05rem',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.15)';
              e.target.style.borderColor = 'rgba(99, 102, 241, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.05)';
            }}
          />
          <span style={{ 
            position: 'absolute', 
            right: '20px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#6366f1',
            background: '#f5f7fa',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        
        {/* 分类选择 */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '35px', justifyContent: 'center' }}>
          {categories.map(category => (
            <div 
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{ 
                padding: '10px 20px',
                backgroundColor: activeCategory === category ? '#6366f1' : 'white',
                color: activeCategory === category ? 'white' : '#4b5563',
                borderRadius: '12px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeCategory === category 
                  ? '0 8px 16px rgba(99, 102, 241, 0.25)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.08)',
                fontWeight: activeCategory === category ? '600' : '500',
                border: '1px solid',
                borderColor: activeCategory === category ? '#6366f1' : 'rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {category}
            </div>
          ))}
        </div>
        
        {/* 卡片网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto' }}>
          {filteredApps.map((app) => (
            <Link to={app.path} key={app.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ 
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                height: '100%',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transform: 'translateY(0)',
                backfaceVisibility: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
              }}>
                <div style={{ 
                  height: '160px',
                  background: getGradientStyle(app.id),
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* 装饰性背景图案 */}
                  <div style={{
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    top: '-100px',
                    right: '-50px'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    bottom: '-20px',
                    left: '30px'
                  }}></div>
                  
                  <div style={{ 
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                    position: 'absolute',
                    bottom: '-30px',
                    left: '24px',
                    zIndex: 1
                  }}>
                    {app.icon ? app.icon : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4.5V18M12 4.5L7.5 9M12 4.5L16.5 9M7.5 15H16.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                
                {app.badge && (
                  <span style={{ 
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#6366f1',
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                    borderRadius: '100px',
                    fontWeight: 600,
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    letterSpacing: '0.5px'
                  }}>
                    {app.badge}
                  </span>
                )}
                
                <div style={{ padding: '40px 24px 24px' }}>
                  <h3 style={{ 
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#1e293b'
                  }}>
                    {app.title}
                  </h3>
                  <p style={{ 
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    margin: 0
                  }}>
                    {app.description}
                  </p>
                  
                  <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                  }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      进入应用
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginLeft: '4px'}}>
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: 'transparent' }}>
        AI应用中心 ©{new Date().getFullYear()} Created with Ant Design
      </Footer>
    </Layout>
  );
}

export default AppHome;