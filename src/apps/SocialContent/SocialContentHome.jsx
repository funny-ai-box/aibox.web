import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  List,
  Avatar,
  Tag,
  Progress,
  Divider,
  Empty,
  Spin,
  message
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  FormOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FireOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import socialContentAPI from '../../api/socialContentAPI';

const { Title, Text, Paragraph } = Typography;

const SocialContentHome = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [taskList, setTaskList] = useState([]);
  const [platformList, setPlatformList] = useState([]);
  const [statistics, setStatistics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalContents: 0,
    platforms: []
  });
  
  // 初始化加载
  useEffect(() => {
    Promise.all([
      fetchTaskList(),
      fetchPlatformList()
    ]).finally(() => setLoading(false));
  }, []);
  
  // 获取任务列表
  const fetchTaskList = async () => {
    try {
      const response = await socialContentAPI.getTaskList(1, 5);
      
      if (response.code === 200) {
        const tasks = response.data.items || [];
        setTaskList(tasks);
        
        // 计算统计数据
        const totalTasks = response.data.totalCount || 0;
        const completedTasks = tasks.filter(task => task.status === 2).length;
        const totalContents = tasks.reduce((sum, task) => sum + (task.contentCount || 0), 0);
        
        setStatistics(prev => ({
          ...prev,
          totalTasks,
          completedTasks,
          totalContents
        }));
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
      message.error('获取任务列表失败');
    }
  };
  
  // 获取平台列表
  const fetchPlatformList = async () => {
    try {
      const response = await socialContentAPI.getPlatformList();
      
      if (response.code === 200) {
        setPlatformList(response.data || []);
        
        // 更新平台统计
        setStatistics(prev => ({
          ...prev,
          platforms: response.data.map(p => ({ name: p.name, code: p.code, icon: p.icon }))
        }));
      }
    } catch (error) {
      console.error('获取平台列表失败:', error);
      message.error('获取平台列表失败');
    }
  };
  
  // 创建新任务
  const createNewTask = () => {
    navigate('/social-content/create');
  };
  
  // 查看任务列表
  const viewTaskList = () => {
    navigate('/social-content/tasks');
  };
  
  // 查看任务详情
  const viewTaskDetail = (taskId) => {
    navigate(`/social-content/task/${taskId}`);
  };
  
  // 渲染任务状态标签
  const renderTaskStatus = (status) => {
    let icon = null;
    let color = '';
    let text = '';
    
    switch (status) {
      case 0:
        icon = <ClockCircleOutlined />;
        color = 'default';
        text = '待处理';
        break;
      case 1:
        icon = <SyncOutlined spin />;
        color = 'processing';
        text = '处理中';
        break;
      case 2:
        icon = <CheckCircleOutlined />;
        color = 'success';
        text = '已完成';
        break;
      case 3:
        icon = <CloseCircleOutlined />;
        color = 'error';
        text = '处理失败';
        break;
      default:
        icon = <ClockCircleOutlined />;
        color = 'default';
        text = '未知状态';
    }
    
    return (
      <Tag icon={icon} color={color}>
        {text}
      </Tag>
    );
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 渲染统计卡片
  const renderStatisticsCards = () => {
    return (
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="创建的任务"
              value={statistics.totalTasks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="完成的任务"
              value={statistics.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={statistics.totalTasks > 0 ? <Text type="secondary">({Math.round((statistics.completedTasks / statistics.totalTasks) * 100)}%)</Text> : null}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="生成的内容"
              value={statistics.totalContents}
              prefix={<FormOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="支持的平台"
              value={statistics.platforms.length}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };
  
  // 渲染最近任务
  const renderRecentTasks = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      );
    }
    
    if (taskList.length === 0) {
      return (
        <Empty 
          description="暂无任务" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={createNewTask}
          >
            创建任务
          </Button>
        </Empty>
      );
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={taskList}
        renderItem={task => (
          <List.Item
            actions={[
              <Button 
                type="primary" 
                size="small" 
                icon={<EyeOutlined />}
                onClick={() => viewTaskDetail(task.id)}
              >
                查看
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{task.taskName}</Text>
                  {renderTaskStatus(task.status)}
                </Space>
              }
              description={
                <div>
                  <Space style={{ marginBottom: '8px' }}>
                    <Text type="secondary">创建时间: {formatDate(task.createDate)}</Text>
                    <Text type="secondary">平台: {task.platformCount}</Text>
                    <Text type="secondary">内容: {task.contentCount}</Text>
                  </Space>
                  <Progress 
                    percent={task.completionRate} 
                    size="small" 
                    status={task.status === 2 ? 'success' : 'active'}
                  />
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };
  
  // 渲染平台列表
  const renderPlatforms = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      );
    }
    
    if (platformList.length === 0) {
      return (
        <Empty description="暂无支持的平台" />
      );
    }
    
    return (
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={platformList}
        renderItem={platform => (
          <List.Item>
            <Card 
              hoverable
              style={{ textAlign: 'center' }}
              bodyStyle={{ padding: '16px' }}
            >
              <Avatar 
                src={platform.icon} 
                size={64}
                style={{ marginBottom: '16px' }}
              />
              <Title level={5} style={{ marginBottom: '8px' }}>
                {platform.name}
              </Title>
              <Paragraph 
                ellipsis={{ rows: 2 }}
                style={{ color: '#8c8c8c', fontSize: '12px' }}
              >
                {platform.description}
              </Paragraph>
            </Card>
          </List.Item>
        )}
      />
    );
  };
  
  // 渲染功能介绍
  const renderFeatures = () => {
    const features = [
      {
        icon: <FormOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
        title: '内容智能创作',
        description: '基于AI大模型，为各大社交平台生成高质量的内容，包括文案、标签和排版',
      },
      {
        icon: <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
        title: '多平台适配',
        description: '支持小红书、抖音、微信朋友圈等多个主流社交媒体平台，一次创作多平台使用',
      },
      {
        icon: <PictureOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
        title: '图像智能解析',
        description: 'AI自动分析产品图片，提取关键信息，增强文案与图片的相关性',
      },
    ];
    
    return (
      <Row gutter={24}>
        {features.map((feature, index) => (
          <Col span={8} key={index}>
            <Card hoverable style={{ height: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                {feature.icon}
              </div>
              <Title level={4} style={{ textAlign: 'center', marginBottom: '16px' }}>
                {feature.title}
              </Title>
              <Paragraph style={{ textAlign: 'center' }}>
                {feature.description}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };
  
  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ marginBottom: '8px' }}>
              欢迎使用社交媒体内容智能创作工具
            </Title>
            <Paragraph>
              基于AI大模型，为各大社交平台一键生成优质内容，提高创作效率和内容质量，让您的社交媒体运营更加轻松高效。
            </Paragraph>
          </div>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />}
            onClick={createNewTask}
          >
            创建内容
          </Button>
        </div>
      </Card>
      
      {renderStatisticsCards()}
      
      <Row gutter={24}>
        <Col span={14}>
          <Card 
            title={
              <Space>
                <FireOutlined style={{ color: '#fa8c16' }} />
                <span>最近创建的任务</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={viewTaskList}>
                查看全部
              </Button>
            }
            style={{ marginBottom: '24px' }}
          >
            {renderRecentTasks()}
          </Card>
          
        
        </Col>
        
        <Col span={10}>
        <Card
            title="功能特性"
            style={{ marginBottom: '24px' }}
          >
            {renderFeatures()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SocialContentHome;