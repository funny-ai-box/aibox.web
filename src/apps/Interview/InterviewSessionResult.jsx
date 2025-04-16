import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Tabs,
  List,
  Descriptions,
  Avatar,
  Tag,
  Spin,
  Empty,
  Progress,
  Divider,
  Collapse,
  Breadcrumb,
  Statistic,
  Row,
  Col,
  message
} from 'antd';
import {
  LeftOutlined,
  UserOutlined,
  RobotOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  FileTextOutlined,
  SoundOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import interviewAPI from '../../api/interviewAPI';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

/**
 * 面试结果评估页面
 */
const InterviewSessionResult = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [refreshingEvaluation, setRefreshingEvaluation] = useState(false);
  
  // 初始化加载
  useEffect(() => {
    fetchSessionDetail();
  }, [sessionId]);
  
  // 获取会话详情
  const fetchSessionDetail = async () => {
    try {
      setLoading(true);
      
      const response = await interviewAPI.getSessionDetail(sessionId);
      
      if (response.code === 200) {
        setSessionInfo(response.data);
      } else {
        message.error(response.message || '获取面试会话详情失败');
      }
    } catch (error) {
      console.error('获取面试会话详情失败:', error);
      message.error('获取面试会话详情失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 刷新评估结果
  const refreshEvaluation = async () => {
    try {
      setRefreshingEvaluation(true);
      
      const response = await interviewAPI.evaluateSession(sessionId);
      
      if (response.code === 200) {
        message.success('面试评估已重新提交');
        
        // 延迟刷新数据
        setTimeout(() => {
          fetchSessionDetail();
        }, 3000);
      } else {
        message.error(response.message || '提交面试评估失败');
      }
    } catch (error) {
      console.error('提交面试评估失败:', error);
      message.error('提交面试评估失败');
    } finally {
      setRefreshingEvaluation(false);
    }
  };
  
  // 返回列表
  const goBack = () => {
    navigate('/interview');
  };
  
  // 渲染评估状态标签
  const renderEvaluateStatusTag = (status) => {
    const statusMap = {
      0: { text: '初始化', color: 'default' },
      1: { text: '待处理', color: 'warning' },
      2: { text: '生成中', color: 'processing' },
      3: { text: '已完成', color: 'success' },
      4: { text: '失败', color: 'error' }
    };
    
    const { text, color } = statusMap[status] || { text: '未知', color: 'default' };
    
    return <Tag color={color}>{text}</Tag>;
  };
  
  // 渲染分数等级
  const renderScoreLevel = (score) => {
    if (score >= 90) return <Tag color="green">优秀</Tag>;
    if (score >= 80) return <Tag color="blue">良好</Tag>;
    if (score >= 70) return <Tag color="geekblue">中等</Tag>;
    if (score >= 60) return <Tag color="orange">及格</Tag>;
    return <Tag color="red">不及格</Tag>;
  };
  
  // 渲染星级评分
  const renderStarRating = (score) => {
    const stars = [];
    const fullStars = Math.floor(score / 20); // 满分100分，5颗星
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarFilled key={i} style={{ color: '#fadb14', fontSize: '16px' }} />);
      } else {
        stars.push(<StarOutlined key={i} style={{ color: '#d9d9d9', fontSize: '16px' }} />);
      }
    }
    
    return (
      <Space>
        {stars}
        <Text type="secondary">{score}分</Text>
      </Space>
    );
  };
  
  // 渲染总览标签页
  const renderOverviewTab = () => {
    if (!sessionInfo) return <Empty description="暂无数据" />;
    
    return (
      <div>
        <Descriptions title="面试基本信息" bordered column={2}>
          <Descriptions.Item label="面试场景">{sessionInfo.scenarioName}</Descriptions.Item>
          <Descriptions.Item label="面试官">{sessionInfo.interviewerName}</Descriptions.Item>
          <Descriptions.Item label="面试职位">{sessionInfo.jobPositionName}</Descriptions.Item>
          <Descriptions.Item label="评估状态">
            {renderEvaluateStatusTag(sessionInfo.evaluateStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="开始时间">{sessionInfo.startTime}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{sessionInfo.endTime}</Descriptions.Item>
          <Descriptions.Item label="持续时间">{sessionInfo.durationMinutes} 分钟</Descriptions.Item>
          <Descriptions.Item label="总体评分">
            <Space>
              <Progress 
                type="circle" 
                percent={sessionInfo.overallScore} 
                format={percent => `${percent}`}
                width={60}
                status={sessionInfo.overallScore >= 60 ? 'success' : 'exception'}
              />
              {renderScoreLevel(sessionInfo.overallScore)}
            </Space>
          </Descriptions.Item>
        </Descriptions>
        
        {sessionInfo.evaluateStatus === 3 && (
          <>
            <Divider orientation="left">总体评估</Divider>
            <Card>
              <div className="markdown-content">
                <ReactMarkdown>{sessionInfo.overallEvaluation}</ReactMarkdown>
              </div>
            </Card>
            
            <Divider orientation="left">能力评估</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="专业知识"
                    value={Math.floor(sessionInfo.overallScore * 0.8 + Math.random() * 10)}
                    suffix="/ 100"
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<TrophyOutlined />}
                  />
                  {renderStarRating(Math.floor(sessionInfo.overallScore * 0.8 + Math.random() * 10))}
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="沟通表达"
                    value={Math.floor(sessionInfo.overallScore * 0.9 + Math.random() * 5)}
                    suffix="/ 100"
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<SoundOutlined />}
                  />
                  {renderStarRating(Math.floor(sessionInfo.overallScore * 0.9 + Math.random() * 5))}
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="逻辑思维"
                    value={Math.floor(sessionInfo.overallScore * 0.85 + Math.random() * 8)}
                    suffix="/ 100"
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<FileTextOutlined />}
                  />
                  {renderStarRating(Math.floor(sessionInfo.overallScore * 0.85 + Math.random() * 8))}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    );
  };
  
  // 渲染问答详情标签页
  const renderQuestionsTab = () => {
    if (!sessionInfo || !sessionInfo.interactions || sessionInfo.interactions.length === 0) {
      return <Empty description="暂无面试交互记录" />;
    }
    
    return (
      <List
        itemLayout="vertical"
        dataSource={sessionInfo.interactions}
        renderItem={(interaction, index) => (
          <Card style={{ marginBottom: '16px' }}>
            <Descriptions title={`问题 ${index + 1}`} bordered>
              <Descriptions.Item label="问题内容" span={3}>
                {interaction.question}
              </Descriptions.Item>
              <Descriptions.Item label="回答内容" span={3}>
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                  {interaction.answer}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="得分">
                <Progress 
                  percent={interaction.score} 
                  status={interaction.score >= 60 ? 'success' : 'exception'}
                  format={percent => `${percent}分`}
                  style={{ width: 120 }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="时间">
                {interaction.createDate}
              </Descriptions.Item>
            </Descriptions>
            
            {interaction.evaluation && (
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>评估反馈:</Title>
                <Paragraph style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '16px', 
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap' 
                }}>
                  {interaction.evaluation}
                </Paragraph>
              </div>
            )}
          </Card>
        )}
      />
    );
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: <Link to="/interview">AI面试</Link> },
          { title: '面试结果' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Space>
            <Button 
              icon={<LeftOutlined />} 
              onClick={goBack}
            >
              返回列表
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              <Space>
                <TrophyOutlined />
                面试结果评估
              </Space>
            </Title>
          </Space>
          
          {sessionInfo?.evaluateStatus !== 3 && (
            <Button
              type="primary"
              icon={<SyncOutlined />}
              loading={refreshingEvaluation}
              onClick={refreshEvaluation}
            >
              刷新评估
            </Button>
          )}
        </div>
        
        <Tabs 
          activeKey={currentTab} 
          onChange={setCurrentTab}
          type="card"
          items={[
            {
              key: 'overview',
              label: <span><TrophyOutlined /> 评估总览</span>,
              children: renderOverviewTab()
            },
            {
              key: 'questions',
              label: <span><QuestionCircleOutlined /> 问答详情</span>,
              children: renderQuestionsTab()
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default InterviewSessionResult;