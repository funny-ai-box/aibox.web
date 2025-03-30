import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Layout, Typography, message, Avatar, Space, Input, Badge, Button } from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  ArrowRightOutlined,
  RobotOutlined
} from '@ant-design/icons';
import '../App.css';
import { getCurrentUser, logout } from '../utils/http';
import { appCards } from '../routes/config';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function AppHome() {
  const [user, setUser] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
      'linear-gradient(135deg, #5B9BFF, #3E77E9)',
      'linear-gradient(135deg, #5AFDF0, #4CCFB0)',
      'linear-gradient(135deg, #FF6B6B, #E95D5D)',
      'linear-gradient(135deg, #A084FF, #8A6FDC)',
      'linear-gradient(135deg, #FF9F7D, #E97D5E)',
      'linear-gradient(135deg, #5EE998, #40C87B)',
      'linear-gradient(135deg, #FF7BA3, #E25E81)',
      'linear-gradient(135deg, #70D2FF, #4CB0DF)'
    ];
    
    return gradients[id % gradients.length];
  };

  const filteredApps = filterApps();
  const categories = getCategories();

  return (
    <Layout style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <Header className="header" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ 
            margin: 0,
            color: '#1D1D1F',
            fontWeight: '600',
            letterSpacing: '-0.5px',
            fontSize: '20px'
          }}>
            AI 智能应用平台
          </Title>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                style={{ 
                  background: '#f0f0f0',
                  marginRight: '12px',
                  border: '2px solid rgba(0, 0, 0, 0.05)'
                }} 
                icon={<UserOutlined style={{ color: '#666' }} />} 
              />
              <span style={{ 
                marginRight: '15px', 
                color: '#1D1D1F',
                fontWeight: 500,
                fontSize: '14px'
              }}>
                {user.name}
              </span>
              <Button
                type="text"
                style={{ 
                  color: '#666',
                  fontSize: '14px'
                }}
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                退出
              </Button>
            </div>
          )}
        </div>
      </Header>

      <Content style={{ padding: '40px 64px' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '60px', 
          paddingTop: '60px',
          position: 'relative'
        }}>
          <Title style={{ 
            marginBottom: '16px', 
            fontSize: '46px', 
            fontWeight: '700',
            color: '#1D1D1F',
            letterSpacing: '-0.5px',
            position: 'relative',
            zIndex: 1,
            lineHeight: 1.2
          }} className="hero-title">
            探索 AI 创新应用
          </Title>
          
          <Text style={{ 
            color: '#86868B', 
            fontSize: '1.125rem', 
            display: 'block', 
            maxWidth: '600px', 
            margin: '0 auto 20px',
            position: 'relative',
            zIndex: 1,
            lineHeight: 1.5
          }}>
            高效能、简洁优雅的AI工具集，助您提升工作效率
          </Text>
        </div>
        
        {/* 搜索框 */}
        <div style={{ 
          maxWidth: '700px', 
          margin: '0 auto 48px', 
          position: 'relative' 
        }}>
          <Input
            placeholder="搜索应用..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{ 
              padding: '15px 20px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'white',
              border: isSearchFocused ? '1px solid rgba(0, 0, 0, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: isSearchFocused ? '0 4px 20px rgba(0, 0, 0, 0.05)' : '0 2px 10px rgba(0, 0, 0, 0.03)',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              color: '#1D1D1F'
            }}
            suffix={
              <SearchOutlined 
                style={{ 
                  color: isSearchFocused ? '#1D1D1F' : '#86868B',
                  fontSize: '18px'
                }} 
              />
            }
          />
        </div>
        
        {/* 分类选择 */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap', 
          marginBottom: '48px', 
          justifyContent: 'center' 
        }}>
          {categories.map(category => (
            <div 
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{ 
                padding: '10px 20px',
                backgroundColor: activeCategory === category ? '#5B9BFF' : 'white',
                color: activeCategory === category ? 'white' : '#1D1D1F',
                borderRadius: '14px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: activeCategory === category ? '600' : '500',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
              }}
              className="category-pill"
              onMouseEnter={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.backgroundColor = '#F8F8F8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                }
              }}
            >
              {category}
            </div>
          ))}
        </div>
        
        {/* 卡片网格 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px', 
          maxWidth: '1400px', 
          margin: '0 auto' 
        }}>
          {filteredApps.map((app) => (
            <Link to={app.path} key={app.id} style={{ textDecoration: 'none' }}>
              <div className="app-card" style={{ 
                backgroundColor: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                height: '100%',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                transform: 'translateY(0)',
                backfaceVisibility: 'hidden'
              }}>
                <div style={{ 
                  height: '140px',
                  background: getGradientStyle(app.id),
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* 装饰性背景图案 */}
                  <div className="card-graphic-element" style={{
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '40%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    top: '-100px',
                    right: '-30px',
                    transform: 'rotate(10deg)'
                  }}></div>
                  <div className="card-graphic-element" style={{
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                    borderRadius: '30%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    bottom: '-20px',
                    left: '30px',
                    transform: 'rotate(-15deg)'
                  }}></div>
                  
                  <div style={{ 
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    position: 'absolute',
                    bottom: '-32px',
                    left: '24px',
                    zIndex: 1
                  }}>
                    {app.icon}
                  </div>
                </div>
                
                {app.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    color: '#5B9BFF',
                    fontSize: '12px',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                  }}>
                    {app.badge}
                  </div>
                )}
                
                <div style={{ padding: '40px 24px 24px' }}>
                  <h3 style={{ 
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: '10px',
                    color: '#1D1D1F',
                    letterSpacing: '-0.3px'
                  }}>
                    {app.title}
                  </h3>
                  <p style={{ 
                    color: '#86868B',
                    fontSize: '15px',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    margin: '0 0 24px 0',
                    height: '72px'
                  }}>
                    {app.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      color: '#86868B',
                      letterSpacing: '0.3px'
                    }}>
                      {app.category}
                    </div>
                    
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#5B9BFF',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span className="app-link">前往应用</span>
                      <ArrowRightOutlined style={{ marginLeft: '6px', fontSize: '12px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0', 
            color: '#86868B' 
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>无匹配结果</div>
            <p>未找到匹配的应用，请尝试其他搜索词或分类</p>
          </div>
        )}
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        background: 'transparent', 
        color: '#86868B',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        padding: '24px',
        fontSize: '13px'
      }}>
        AI应用中心 © {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default AppHome;