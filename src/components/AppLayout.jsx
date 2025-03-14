import React from 'react';
import { Layout, Button, Typography } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * 应用布局组件
 * 为每个应用提供统一的布局结构，包括顶部导航和内容区域
 * 
 * @param {Object} props 
 * @param {string} props.title - 应用标题
 */
const AppLayout = ({ title }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">
            <Button type="primary" shape="circle" icon={<HomeOutlined />} style={{ marginRight: '16px' }} />
          </Link>
          <Title level={3} style={{ margin: 0 }}>{title}</Title>
        </div>
      </Header>
      
      <Content style={{ padding: '20px', background: '#f0f2f5' }}>
        {/* 子路由内容将在这里渲染 */}
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AppLayout;