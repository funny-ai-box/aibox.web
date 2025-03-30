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
  Divider,
  Empty,
  Spin,
  message
} from 'antd';
import {
  PlusOutlined,
  FormOutlined,
  BarChartOutlined,
  RobotOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import surveyAPI from '../../api/surveyAPI';

const { Title, Text, Paragraph } = Typography;

/**
 * 问卷调查首页
 */
const SurveyHomePage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [surveyList, setSurveyList] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0
  });
  
  // 初始化加载
  useEffect(() => {
    fetchSurveys();
  }, []);
  
  // 获取问卷列表
  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getTaskList(1, 5);
      
      if (response.code === 200) {
        setSurveyList(response.data.items || []);
        
        // 计算统计数据
        const surveys = response.data.items || [];
        const totalSurveys = response.data.totalCount || 0;
        const activeSurveys = surveys.filter(survey => survey.status === 1).length;
        const totalResponses = surveys.reduce((sum, survey) => sum + (survey.responseCount || 0), 0);
        
        setStatistics({
          totalSurveys,
          activeSurveys,
          totalResponses
        });
      } else {
        message.error(response.message || '获取问卷列表失败');
      }
    } catch (error) {
      message.error('获取问卷列表失败');
      console.error('获取问卷列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 创建新问卷
  const createNewSurvey = () => {
    navigate('/survey/create');
  };
  
  // 查看问卷列表
  const viewSurveyList = () => {
    navigate('/survey');
  };
  
  // 渲染状态标签
  const renderStatus = (status) => {
    let icon = null;
    let color = '';
    let text = '';
    
    switch (status) {
      case 0:
        icon = <ClockCircleOutlined />;
        color = 'default';
        text = '草稿';
        break;
      case 1:
        icon = <CheckCircleOutlined />;
        color = 'success';
        text = '已发布';
        break;
      case 2:
        icon = <StopOutlined />;
        color = 'error';
        text = '已关闭';
        break;
      default:
        icon = <ClockCircleOutlined />;
        color = 'default';
        text = '草稿';
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
  const renderStatistics = () => {
    return (
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="问卷总数"
              value={statistics.totalSurveys}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="开放中的问卷"
              value={statistics.activeSurveys}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="收集的回答"
              value={statistics.totalResponses}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };
  
  // 渲染功能特点
  const renderFeatures = () => {
    const features = [
      {
        icon: <RobotOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
        title: 'AI智能设计',
        description: '通过自然语言描述需求，AI自动设计符合需求的问卷结构和问题',
      },
      {
        icon: <FormOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
        title: '多种题型支持',
        description: '支持单选、多选、填空、评分、日期等多种题型，满足各种调研场景',
      },
      {
        icon: <BarChartOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
        title: '数据分析报表',
        description: '自动汇总分析回答数据，提供可视化图表和导出功能',
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
              AI问卷调查系统
            </Title>
            <Paragraph>
              智能设计问卷、收集数据、分析结果，让调研更高效、更便捷
            </Paragraph>
          </div>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />}
            onClick={createNewSurvey}
          >
            创建问卷
          </Button>
        </div>
      </Card>
      
      {renderStatistics()}
      
      <Row gutter={24}>
        <Col span={16}>
          <Card 
            title={
              <Space>
                <FormOutlined style={{ color: '#1890ff' }} />
                <span>最近的问卷</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={viewSurveyList}>
                查看全部
              </Button>
            }
            style={{ marginBottom: '24px' }}
          >
            <Spin spinning={loading}>
              {surveyList.length === 0 ? (
                <Empty description="暂无问卷" />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={surveyList}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          onClick={() => navigate(`/survey/edit/${item.id}`)}
                          disabled={item.status !== 0}
                        >
                          编辑
                        </Button>,
                        <Button 
                          type="link" 
                          onClick={() => navigate(`/survey/stats/${item.id}`)}
                          disabled={item.responseCount === 0}
                        >
                          统计
                        </Button>,
                        <Button 
                          type="link" 
                          onClick={() => navigate(`/survey/preview/${item.id}`)}
                        >
                          预览
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar icon={<FormOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        }
                        title={
                          <Space>
                            <span>{item.name}</span>
                            {renderStatus(item.status)}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary" ellipsis>
                              {item.description || '无描述'}
                            </Text>
                            <div>
                              <Space split={<Divider type="vertical" />}>
                                <Text type="secondary">创建时间: {formatDate(item.createDate)}</Text>
                                <Text type="secondary">回答: {item.responseCount}</Text>
                              </Space>
                            </div>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card 
            title={
              <Space>
                <RobotOutlined style={{ color: '#722ed1' }} />
                <span>快速开始</span>
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<PlusOutlined />} onClick={createNewSurvey}>
                创建新问卷
              </Button>
              <Button block icon={<FormOutlined />} onClick={viewSurveyList}>
                管理问卷
              </Button>
              
              <Divider />
              
              <Paragraph>
                <Text strong>使用提示：</Text>
              </Paragraph>
              <ul style={{ paddingLeft: '20px' }}>
                <li>创建问卷后，使用AI设计功能快速构建问卷结构</li>
                <li>发布问卷后，通过分享链接收集回答</li>
                <li>在统计页面查看和导出问卷数据</li>
              </ul>
            </Space>
          </Card>
          
          <Card 
            title={
              <Space>
                <BarChartOutlined style={{ color: '#52c41a' }} />
                <span>功能特点</span>
              </Space>
            }
          >
            {renderFeatures()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SurveyHomePage;