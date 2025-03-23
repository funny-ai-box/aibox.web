import React from 'react';
import { Layout, Button, Typography } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * 智能客服布局组件
 * 为应用提供统一的布局结构
 */
const CustomerServiceLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">
            <Button type="primary" shape="circle" icon={<LeftOutlined />} style={{ marginRight: '16px' }} />
          </Link>
          <Title level={3} style={{ margin: 0 }}>智能客服系统</Title>
        </div>
      </Header>
      
      <Content style={{ padding: '20px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
        {/* 子路由内容将在这里渲染 */}
        <Outlet />
      </Content>
    </Layout>
  );
};

export default CustomerServiceLayout;