import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Statistic,
  List,
  Avatar,
  Tag,
  Space,
  Divider,
  Empty,
  Spin,
  message
} from 'antd';
import {
  CustomerServiceOutlined,
  ShoppingOutlined,
  MessageOutlined,
  UserOutlined,
  PlusOutlined,
  RightOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  TeamOutlined,
  SettingOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import customerServiceAPI from '../../api/customerServiceAPI';

const { Title, Text, Paragraph } = Typography;

/**
 * 智能客服首页组件 - 优化版
 */
const CustomerServiceHome = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSessions: 0,
    activeSessions: 0,
    products: 0
  });
  const [products, setProducts] = useState([]);

  // 初始化加载
  useEffect(() => {
    Promise.all([
      fetchChatSessions(),
      fetchProducts()
    ]).finally(() => setLoading(false));
  }, []);

  // 获取聊天会话列表
  const fetchChatSessions = async () => {
    try {
      const response = await customerServiceAPI.getChatSessionList(1, 5);
      
      if (response.code === 200) {
        const sessionList = response.data.items || [];
        setSessions(sessionList);
        
        // 计算统计数据
        const totalSessions = response.data.totalCount || 0;
        const activeSessions = sessionList.filter(session => session.status === 1).length;
        
        setStatistics(prev => ({
          ...prev,
          totalSessions,
          activeSessions
        }));
      }
    } catch (error) {
      console.error('获取聊天会话列表失败:', error);
      message.error('获取聊天会话列表失败');
    }
  };

  // 获取商品列表
  const fetchProducts = async () => {
    try {
      const response = await customerServiceAPI.getProductList(1, 3);
      
      if (response.code === 200) {
        setProducts(response.data.items || []);
        
        // 更新商品统计
        setStatistics(prev => ({
          ...prev,
          products: response.data.totalCount || 0
        }));
      }
    } catch (error) {
      console.error('获取商品列表失败:', error);
      message.error('获取商品列表失败');
    }
  };

  // 创建新聊天会话
  const createNewSession = async () => {
    try {
      const defaultSessionName = `会话 ${new Date().toLocaleString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric', 
        minute: 'numeric' 
      })}`;
      
      const response = await customerServiceAPI.createChatSession({
            userName: '用户'+new Date().getTime(),
        SessionName: defaultSessionName
      });
      
      if (response.code === 200) {
        message.success('创建聊天会话成功');
        navigate(`/customer-service/chat/${response.data}`);
      } else {
        message.error(response.message || '创建聊天会话失败');
      }
    } catch (error) {
      console.error('创建聊天会话失败:', error);
      message.error('创建聊天会话失败');
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 渲染聊天窗口预览
  const renderChatPreview = () => {
    return (
      <Card 
        bordered={false}
        className="chat-preview-card"
        style={{ 
          height: '420px', 
          backgroundImage: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ padding: '24px' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
            智能客服系统
          </Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '16px' }}>
            基于AI大模型的智能客服，提供实时对话、智能意图识别、精准商品推荐
          </Paragraph>
          
          <Space direction="vertical" size="large" style={{ marginTop: '32px' }}>
            <div>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px', display: 'block' }}>
                <CheckCircleOutlined style={{ marginRight: '8px' }} />
                智能回答用户问题，提升服务效率
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px', display: 'block' }}>
                <CheckCircleOutlined style={{ marginRight: '8px' }} />
                精准查询商品信息，提供商品推荐
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: '8px', display: 'block' }}>
                <CheckCircleOutlined style={{ marginRight: '8px' }} />
                历史会话记录追溯，持续优化服务
              </Text>
            </div>
          </Space>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<CustomerServiceOutlined />}
            onClick={createNewSession}
            style={{ 
              backgroundColor: 'white', 
              color: '#1890ff', 
              borderColor: 'white',
              height: '48px',
              fontSize: '16px',
              width: '80%',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            开始智能客服对话
          </Button>
        </div>
        
        <div 
          style={{ 
            position: 'absolute', 
            right: '-80px', 
            bottom: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            zIndex: 1
          }} 
        />
        <div 
          style={{ 
            position: 'absolute', 
            left: '-40px', 
            top: '-40px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            zIndex: 1
          }} 
        />
      </Card>
    );
  };

  // 渲染数据统计
  const renderStatistics = () => {
    return (
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <Statistic
              title={<Text strong>会话总数</Text>}
              value={statistics.totalSessions}
              prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <Statistic
              title={<Text strong>进行中会话</Text>}
              value={statistics.activeSessions}
              prefix={<SyncOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <Statistic
              title={<Text strong>商品数量</Text>}
              value={statistics.products}
              prefix={<ShoppingOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '28px' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染快捷导航
  const renderQuickNav = () => {
    const navItems = [
      {
        icon: <MessageOutlined />,
        title: '会话管理',
        description: '查看和管理所有客服会话',
        path: '/customer-service/sessions'
      },
      {
        icon: <ShoppingOutlined />,
        title: '商品管理',
        description: '添加、修改、删除商品',
        path: '/customer-service/products'
      },
      {
        icon: <DashboardOutlined />,
        title: '数据统计',
        description: '查看客服数据和统计分析',
        path: '/customer-service/analytics'
      },
      {
        icon: <SettingOutlined />,
        title: '系统设置',
        description: '配置系统参数和权限',
        path: '/customer-service/settings'
      }
    ];

    return (
      <Card
        title={
          <Space>
            <Text style={{ color: '#1890ff' }}><TeamOutlined /></Text>
            <Text strong>快捷导航</Text>
          </Space>
        }
        style={{ 
          marginBottom: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Row gutter={[16, 16]}>
          {navItems.map((item, index) => (
            <Col span={6} key={index}>
              <Card 
                hoverable 
                onClick={() => navigate(item.path)}
                style={{ 
                  textAlign: 'center',
                  height: '100%',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid #f0f0f0'
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ 
                  fontSize: '24px', 
                  color: '#1890ff',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '24px',
                  background: '#f0f7ff'
                }}>
                  {item.icon}
                </div>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '4px' }}>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{item.description}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  // 渲染最近会话
  const renderRecentSessions = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      );
    }

    if (sessions.length === 0) {
      return (
        <Empty 
          description="暂无会话记录" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={createNewSession}
          >
            创建会话
          </Button>
        </Empty>
      );
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={sessions}
        renderItem={session => (
          <List.Item
            actions={[
              <Button 
                type="primary" 
                ghost
                key="view"
                onClick={() => navigate(`/customer-service/chat/${session.id}`)}
              >
                <Space>
                  <span>进入会话</span>
                  <RightOutlined />
                </Space>
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: session.status === 1 ? '#1890ff' : '#d9d9d9',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }} 
                  size="large"
                />
              }
              title={
                <Space>
                  <Text strong>{session.sessionName}</Text>
                  {session.status === 1 ? (
                    <Tag color="processing" icon={<SyncOutlined spin />}>进行中</Tag>
                  ) : (
                    <Tag color="default" icon={<CheckCircleOutlined />}>已结束</Tag>
                  )}
                </Space>
              }
              description={
                <Space>
                  <Text type="secondary">用户: {session.userName || '未知用户'}</Text>
                  <Text type="secondary">创建时间: {formatDate(session.createDate)}</Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div style={{ padding: '0 16px', background: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
      <Row gutter={24} style={{ marginTop: '24px' }}>
        {/* 左侧 - 聊天预览和快捷导航 */}
        <Col span={10}>
          {renderChatPreview()}
          
          <Card
            title={
              <Space>
                <Text style={{ color: '#1890ff' }}><TeamOutlined /></Text>
                <Text strong>智能客服功能</Text>
              </Space>
            }
            style={{ 
              marginTop: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '12px' }}>支持实时对话，及时响应用户需求</li>
              <li style={{ marginBottom: '12px' }}>智能意图识别，精准把握用户问题</li>
              <li style={{ marginBottom: '12px' }}>查询商品数据库，提供准确商品信息</li>
              <li style={{ marginBottom: '12px' }}>支持图片消息，增强交互体验</li>
              <li>聊天历史记录保存，方便追溯问题</li>
            </ul>
          </Card>
        </Col>
        
        {/* 右侧 - 数据统计和会话列表 */}
        <Col span={14}>
          {renderStatistics()}
          {renderQuickNav()}
          
          <Card
            title={
              <Space>
                <Text style={{ color: '#1890ff' }}><MessageOutlined /></Text>
                <Text strong>最近会话</Text>
              </Space>
            }
            extra={
              <Space>
                <Button type="primary" ghost onClick={createNewSession}>
                  <PlusOutlined /> 新建会话
                </Button>
                <Button type="link" onClick={() => navigate('/customer-service/sessions')}>
                  查看全部
                </Button>
              </Space>
            }
            style={{ 
              marginBottom: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            {renderRecentSessions()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerServiceHome;