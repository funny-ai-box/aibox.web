import React from 'react';
import { Layout, Button, Typography } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * AI面试工具布局组件
 * 为应用提供统一的布局结构
 */
const InterviewLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">
            <Button type="primary" shape="circle" icon={<LeftOutlined />} style={{ marginRight: '16px' }} />
          </Link>
          <Title level={3} style={{ margin: 0 }}>AI面试助手</Title>
        </div>
      </Header>
      
      <Content style={{ padding: '20px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
        {/* 子路由内容将在这里渲染 */}
        <Outlet />
      </Content>
    </Layout>
  );
};

export default InterviewLayout;