import React from 'react';
import { Layout, Button, Typography, Space } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { LeftOutlined, SoundOutlined, AudioOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * 播客布局组件 - 增强科技感版本
 * 为应用提供统一的布局结构
 */
const PodcastLayout = () => {
  return (
    <Layout className="podcast-layout" style={{ minHeight: '100vh' }}>
      <Header 
        className="podcast-header"
        style={{ 
          background: 'linear-gradient(90deg, #001529, #003151)', 
          padding: '0 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<LeftOutlined />} 
              style={{ 
                marginRight: '16px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'transparent',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }} 
            />
          </Link>
          <Space align="center">
            <div 
              className="logo-icon"
              style={{ 
                background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                boxShadow: '0 2px 10px rgba(24, 144, 255, 0.5)'
              }}
            >
              <AudioOutlined style={{ color: 'white', fontSize: '20px' }} />
            </div>
            <Title 
              level={3} 
              style={{ 
                margin: 0, 
                color: 'white',
                background: 'linear-gradient(90deg, #ffffff, #e6f7ff)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
              }}
            >
              AI播客生成工具
            </Title>
          </Space>
        </div>
        
        {/* 装饰性元素 */}
        <div 
          className="header-decoration circle-1" 
          style={{ 
            position: 'absolute',
            right: '10%',
            top: '-50%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            opacity: 0.6
          }}
        />
        <div 
          className="header-decoration circle-2" 
          style={{ 
            position: 'absolute',
            right: '30%',
            top: '-20%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            opacity: 0.4
          }}
        />
        <div 
          className="header-decoration wave" 
          style={{ 
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #1890ff, transparent, #1890ff, transparent)',
            opacity: 0.3
          }}
        />
      </Header>
      
      <Content 
        className="podcast-content" 
        style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, #f5f5f5, #f0f2f5)', 
          minHeight: 'calc(100vh - 64px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 背景装饰 */}
        <div 
          className="bg-decoration circle-3" 
          style={{ 
            position: 'absolute',
            right: '-5%',
            top: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(24,144,255,0.05) 0%, rgba(24,144,255,0) 70%)',
            zIndex: 0
          }}
        />
        <div 
          className="bg-decoration circle-4" 
          style={{ 
            position: 'absolute',
            left: '10%',
            bottom: '5%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(24,144,255,0.05) 0%, rgba(24,144,255,0) 70%)',
            zIndex: 0
          }}
        />
        
        {/* 音波装饰元素 */}
        <div 
          className="sound-wave"
          style={{
            position: 'absolute',
            top: '50%',
            right: '5%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: 0.2,
            zIndex: 0
          }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                height: `${20 + i * 10}px`,
                width: '4px',
                background: '#1890ff',
                borderRadius: '4px',
                animation: `soundWave ${1 + i * 0.2}s ease-in-out infinite alternate`
              }}
            />
          ))}
        </div>
        
        {/* 实际内容，确保在装饰元素上方 */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </div>
      </Content>
      
      {/* 添加动画样式 */}
      <style jsx="true">{`
        @keyframes soundWave {
          0% {
            height: 10px;
          }
          100% {
            height: 30px;
          }
        }
        
        .podcast-layout {
          background: #f0f2f5;
        }
        
        .podcast-header {
          animation: gradientFlow 10s ease infinite;
        }
        
        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .logo-icon {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
          }
        }
        
        .header-decoration.wave {
          animation: wave 3s ease-in-out infinite;
        }
        
        @keyframes wave {
          0% {
            background-position: 0px 0px;
          }
          100% {
            background-position: 200px 0px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default PodcastLayout;