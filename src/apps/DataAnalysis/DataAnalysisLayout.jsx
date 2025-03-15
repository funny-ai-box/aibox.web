import React from 'react';
import { Layout, Button, Typography, Menu } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  StepBackwardOutlined,
  LeftOutlined  ,
  DatabaseOutlined,
  LineChartOutlined,
  DashboardOutlined,
  LeftCircleFilled
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

/**
 * 数据分析助手布局组件
 * 为应用提供统一的布局结构
 */
const DataAnalysisLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 获取当前路径，用于高亮菜单项
  const currentPath = location.pathname;
  
  // 侧边栏菜单项
  const menuItems = [
    {
      key: '/data-analysis',
      icon: <DatabaseOutlined />,
      label: '我的数据',
    },
    {
      key: '/data-analysis/analysis',
      icon: <LineChartOutlined />,
      label: '数据分析',
    },
    {
      key: '/data-analysis/dashboards',
      icon: <DashboardOutlined />,
      label: '可视化面板',
    }
  ];
  
  // 根据当前路径获取默认选中的菜单项
  const getSelectedKey = () => {
    const exactMatch = menuItems.find(item => item.key === currentPath);
    if (exactMatch) return [exactMatch.key];
    
    // 如果没有精确匹配，查找前缀匹配
    for (const item of menuItems) {
      if (currentPath.startsWith(item.key) && item.key !== '/data-analysis') {
        return [item.key];
      }
    }
    
    // 默认选中第一项
    return ['/data-analysis'];
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">
            <Button type="primary" shape="circle" icon={<LeftOutlined />} style={{ marginRight: '16px' }} />
          </Link>
          <Title level={3} style={{ margin: 0 }}>数据分析助手</Title>
        </div>
      </Header>
      
      <Layout>
        <Sider
          width={200}
          theme="light"
          style={{
            boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
            background: '#fff'
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={getSelectedKey()}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onSelect={({ key }) => navigate(key)}
          />
        </Sider>
        
        <Layout style={{ padding: '20px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            {/* 子路由内容将在这里渲染 */}
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DataAnalysisLayout;