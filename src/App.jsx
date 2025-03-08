import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Card, Row, Col, Layout, Typography } from 'antd'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Import all application components
import PersonalKnowledgeBase from './apps/PersonalKnowledgeBase'
import App1 from './apps/App1/App1'
import App2 from './apps/App2/App2'
import App3 from './apps/App3/App3'
import App4 from './apps/App4/App4'
import App5 from './apps/App5/App5'
import App6 from './apps/App6/App6'
import App7 from './apps/App7/App7'
import App8 from './apps/App8/App8'
import App9 from './apps/App9/App9'
import App10 from './apps/App10/App10'
import App11 from './apps/App11/App11'
import App12 from './apps/App12/App12'
import App13 from './apps/App13/App13'
import App14 from './apps/App14/App14'
import App15 from './apps/App15/App15'
import App16 from './apps/App16/App16'
import App17 from './apps/App17/App17'
import App18 from './apps/App18/App18'
import App19 from './apps/App19/App19'
import App20 from './apps/App20/App20'
import App21 from './apps/App21/App21'
import App22 from './apps/App22/App22'
import App23 from './apps/App23/App23'
import App24 from './apps/App24/App24'

const { Header, Content, Footer } = Layout
const { Title } = Typography

function AppHome() {
  // Create array of 25 apps with titles
  const apps = [
    { id: 1, title: "个人知识库", route: "/knowledge-base", component: PersonalKnowledgeBase },
    { id: 2, title: "待开发1", route: "/app1", component: App1 },
    { id: 3, title: "待开发2", route: "/app2", component: App2 },
    { id: 4, title: "待开发3", route: "/app3", component: App3 },
    { id: 5, title: "待开发4", route: "/app4", component: App4 },
    { id: 6, title: "待开发5", route: "/app5", component: App5 },
    { id: 7, title: "待开发6", route: "/app6", component: App6 },
    { id: 8, title: "待开发7", route: "/app7", component: App7 },
    { id: 9, title: "待开发8", route: "/app8", component: App8 },
    { id: 10, title: "待开发9", route: "/app9", component: App9 },
    { id: 11, title: "待开发10", route: "/app10", component: App10 },
    { id: 12, title: "待开发11", route: "/app11", component: App11 },
    { id: 13, title: "待开发12", route: "/app12", component: App12 },
    { id: 14, title: "待开发13", route: "/app13", component: App13 },
    { id: 15, title: "待开发14", route: "/app14", component: App14 },
    { id: 16, title: "待开发15", route: "/app15", component: App15 },
    { id: 17, title: "待开发16", route: "/app16", component: App16 },
    { id: 18, title: "待开发17", route: "/app17", component: App17 },
    { id: 19, title: "待开发18", route: "/app18", component: App18 },
    { id: 20, title: "待开发19", route: "/app19", component: App19 },
    { id: 21, title: "待开发20", route: "/app20", component: App20 },
    { id: 22, title: "待开发21", route: "/app21", component: App21 },
    { id: 23, title: "待开发22", route: "/app22", component: App22 },
    { id: 24, title: "待开发23", route: "/app23", component: App23 },
    { id: 25, title: "待开发24", route: "/app24", component: App24 },
  ]

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo-container">
          <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <Title level={3} style={{ color: 'white', margin: 0 }}>应用中心</Title>
      </Header>
      
      <Content style={{ padding: '24px 50px' }}>
        <div className="site-layout-content">
          <Row gutter={[16, 16]}>
            {apps.map((app) => (
              <Col xs={24} sm={12} md={8} lg={6} key={app.id}>
                <Link to={app.route}>
                  <Card 
                    hoverable 
                    title={app.title}
                    style={{ height: 160 }}
                  >
                    <p>{app.id === 1 ? "个人知识管理系统" : "功能正在开发中"}</p>
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppHome />} />
        <Route path="/knowledge-base" element={<PersonalKnowledgeBase />} />
        <Route path="/app1" element={<App1 />} />
        <Route path="/app2" element={<App2 />} />
        <Route path="/app3" element={<App3 />} />
        <Route path="/app4" element={<App4 />} />
        <Route path="/app5" element={<App5 />} />
        <Route path="/app6" element={<App6 />} />
        <Route path="/app7" element={<App7 />} />
        <Route path="/app8" element={<App8 />} />
        <Route path="/app9" element={<App9 />} />
        <Route path="/app10" element={<App10 />} />
        <Route path="/app11" element={<App11 />} />
        <Route path="/app12" element={<App12 />} />
        <Route path="/app13" element={<App13 />} />
        <Route path="/app14" element={<App14 />} />
        <Route path="/app15" element={<App15 />} />
        <Route path="/app16" element={<App16 />} />
        <Route path="/app17" element={<App17 />} />
        <Route path="/app18" element={<App18 />} />
        <Route path="/app19" element={<App19 />} />
        <Route path="/app20" element={<App20 />} />
        <Route path="/app21" element={<App21 />} />
        <Route path="/app22" element={<App22 />} />
        <Route path="/app23" element={<App23 />} />
        <Route path="/app24" element={<App24 />} />
      </Routes>
    </Router>
  )
}

export default App