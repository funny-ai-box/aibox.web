import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Layout, Typography, message } from 'antd'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import '../App.css'
import { getCurrentUser, logout } from '../utils/http'
import { appRoutes } from '../routes/config'

const { Header, Content, Footer } = Layout
const { Title } = Typography

function AppHome() {
  const [user, setUser] = useState(null);

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

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo-container">
          <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ color: 'white', margin: 0, marginRight: '20px' }}>应用中心</Title>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'white', marginRight: '15px' }}>
                欢迎，{user.name}
              </span>
              <a 
                onClick={handleLogout} 
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                退出登录
              </a>
            </div>
          )}
        </div>
      </Header>
      
      <Content style={{ padding: '24px 50px' }}>
        <div className="site-layout-content">
          <Row gutter={[16, 16]}>
            {appRoutes.map((app) => (
              <Col xs={24} sm={12} md={8} lg={6} key={app.id}>
                <Link to={app.path}>
                  <Card 
                    hoverable 
                    title={app.title}
                    style={{ height: 160 }}
                  >
                    <p>{app.description}</p>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        应用中心 ©{new Date().getFullYear()} Created with Ant Design
      </Footer>
    </Layout>
  )
}

export default AppHome