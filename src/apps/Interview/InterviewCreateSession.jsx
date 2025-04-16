import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Breadcrumb,
  Descriptions,
  Steps,
  Space,
  Tag,
  List,
  Avatar,
  Spin,
  Empty,
  Alert,
  Result,
  message
} from 'antd';
import {
  LeftOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  RightCircleOutlined,
  UserOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import interviewAPI from '../../api/interviewAPI';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

/**
 * 创建面试会话页面
 */
const InterviewCreateSession = () => {
  const { scenarioId, jobPositionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [scenarioInfo, setScenarioInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  
  // 初始化加载
  useEffect(() => {
    if (scenarioId) {
      fetchScenarioDetail();
    }
  }, [scenarioId]);
  
  // 加载场景详情
  const fetchScenarioDetail = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getScenarioDetail(scenarioId);
      
      if (response.code === 200) {
        setScenarioInfo(response.data);
        
        // 查找选中的职位
        if (jobPositionId) {
          const position = response.data.jobPositions.find(p => p.id.toString() === jobPositionId.toString());
          if (position) {
            setSelectedPosition(position);
          }
        }
      } else {
        message.error(response.message || '获取面试场景详情失败');
      }
    } catch (error) {
      console.error('获取面试场景详情失败:', error);
      message.error('获取面试场景详情失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取题目列表
  const fetchQuestions = async () => {
    try {
      const response = await interviewAPI.getQuestionsList(scenarioId, jobPositionId);
      
      if (response.code === 200) {
        setQuestions(response.data.items || []);
      } else {
        message.error(response.message || '获取面试题目列表失败');
      }
    } catch (error) {
      console.error('获取面试题目列表失败:', error);
      message.error('获取面试题目列表失败');
    }
  };
  
  // 创建面试会话
  const handleCreateSession = async () => {
    try {
      setCreatingSession(true);
      
      const response = await interviewAPI.createSession({
        ScenarioId: scenarioId,
        JobPositionId: jobPositionId
      });
      
      if (response.code === 200) {
        setSessionInfo(response.data);
        setSessionCreated(true);
        setCurrentStep(1);
        
        // 加载题目
        fetchQuestions();
        
        message.success('面试会话创建成功');
      } else {
        message.error(response.message || '创建面试会话失败');
      }
    } catch (error) {
      console.error('创建面试会话失败:', error);
      message.error('创建面试会话失败');
    } finally {
      setCreatingSession(false);
    }
  };
  
  // 开始面试
  const handleStartInterview = async () => {
    if (!sessionInfo) {
      message.error('面试会话信息不完整');
      return;
    }
    
    try {
      setStartingSession(true);
      
      const response = await interviewAPI.startSession(sessionInfo.id);
      
      if (response.code === 200) {
        // 获取RTC token
        const sessionToken = response.data.sessionToken;
        
        // 跳转到面试会话页面
        navigate(`/interview/session/${sessionInfo.id}`, {
          state: {
            scenarioInfo,
            sessionInfo: {
              ...sessionInfo,
              token: sessionToken
            },
            questions: response.data.questions || []
          }
        });
        
        message.success('面试会话已开始');
      } else {
        message.error(response.message || '开始面试会话失败');
      }
    } catch (error) {
      console.error('开始面试会话失败:', error);
      message.error('开始面试会话失败');
    } finally {
      setStartingSession(false);
    }
  };
  
  // 返回场景详情
  const goBack = () => {
    navigate(`/interview/scenario/${scenarioId}`);
  };
  
  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPrepareStep();
      case 1:
        return renderReviewStep();
      case 2:
        return renderCompleteStep();
      default:
        return null;
    }
  };
  
  // 渲染准备步骤
  const renderPrepareStep = () => (
    <Card>
      <Alert
        message="准备开始面试"
        description="请确认以下信息，准备好后点击<创建面试会话>按钮开始面试。"
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />
      
      <Descriptions title="面试信息" bordered column={1}>
        <Descriptions.Item label="面试场景">{scenarioInfo?.name}</Descriptions.Item>
        <Descriptions.Item label="面试官">
          {scenarioInfo?.interviewerName} ({scenarioInfo?.interviewerGender === 1 ? '男' : '女'})
        </Descriptions.Item>
        <Descriptions.Item label="面试职位">
          {selectedPosition ? (
            <Tag color="blue">
              {selectedPosition.name} ({renderLevelText(selectedPosition.level)})
            </Tag>
          ) : '未选择职位'}
        </Descriptions.Item>
        <Descriptions.Item label="面试题目数量">
          {selectedPosition?.questionStatus === 3 ? 
            <Tag color="success">已准备好</Tag> : 
            <Tag color="warning">尚未准备</Tag>
          }
        </Descriptions.Item>
      </Descriptions>
      
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Space>
          <Button onClick={goBack}>
            返回
          </Button>
          <Button 
            type="primary" 
            icon={<TeamOutlined />}
            onClick={handleCreateSession}
            loading={creatingSession}
            disabled={!selectedPosition || selectedPosition.questionStatus !== 3}
          >
            创建面试会话
          </Button>
        </Space>
      </div>
    </Card>
  );
  
  // 渲染复习步骤
  const renderReviewStep = () => (
    <Card>
      <Alert
        message="面试会话已创建"
        description="请查看面试题目，准备好后点击<开始面试>按钮。"
        type="success"
        showIcon
        style={{ marginBottom: '24px' }}
      />
      
      <Descriptions title="会话信息" bordered>
        <Descriptions.Item label="会话ID">{sessionInfo?.id}</Descriptions.Item>
        <Descriptions.Item label="面试场景">{sessionInfo?.scenarioName}</Descriptions.Item>
        <Descriptions.Item label="面试官">{sessionInfo?.interviewerName}</Descriptions.Item>
        <Descriptions.Item label="面试职位">{sessionInfo?.jobPositionName}</Descriptions.Item>
      </Descriptions>
      
      <Title level={4} style={{ margin: '24px 0 16px' }}>面试题目</Title>
      
      <List
        itemLayout="vertical"
        dataSource={questions}
        renderItem={(question, index) => (
          <Card 
            style={{ marginBottom: '16px' }}
            title={
              <Space>
                <Tag color="blue">#{index + 1}</Tag>
                <Tag color="purple">{question.questionType}</Tag>
                <Tag color="orange">难度: {question.difficulty}</Tag>
              </Space>
            }
          >
            <div>
              <Title level={5}>问题:</Title>
              <Paragraph style={{ fontSize: '16px' }}>
                {question.content}
              </Paragraph>
              
              <Title level={5} style={{ marginTop: '16px' }}>参考答案:</Title>
              <Paragraph style={{ 
                background: '#f8f8f8', 
                padding: '12px', 
                borderRadius: '4px',
                fontSize: '15px'
              }}>
                {question.shortAnswer}
              </Paragraph>
            </div>
          </Card>
        )}
        locale={{
          emptyText: (
            <Empty description="暂无面试题目" />
          )
        }}
      />
      
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Space>
          <Button onClick={goBack}>
            取消
          </Button>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={handleStartInterview}
            loading={startingSession}
          >
            开始面试
          </Button>
        </Space>
      </div>
    </Card>
  );
  
  // 渲染完成步骤（此步骤实际在面试页面完成）
  const renderCompleteStep = () => (
    <Result
      status="success"
      title="面试已开始！"
      subTitle="面试会话已创建并开始，请点击下方按钮进入面试页面。"
      extra={[
        <Button type="primary" key="console" onClick={() => navigate(`/interview/session/${sessionInfo.id}`)}>
          进入面试
        </Button>,
        <Button key="back" onClick={goBack}>返回面试场景</Button>,
      ]}
    />
  );
  
  // 渲染级别文本
  const renderLevelText = (level) => {
    const levelMap = {
      1: '初级',
      2: '中级',
      3: '高级',
      4: '专家'
    };
    
    return levelMap[level] || '未知';
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
          { title: <Link to={`/interview/scenario/${scenarioId}`}>{scenarioInfo?.name}</Link> },
          { title: '创建面试会话' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Button 
            icon={<LeftOutlined />} 
            onClick={goBack}
            style={{ marginRight: '16px' }}
          >
            返回场景
          </Button>
          <Title level={4} style={{ margin: 0 }}>创建面试会话</Title>
        </div>
        
        <Steps
          current={currentStep}
          items={[
            {
              title: '准备',
              description: '确认信息',
              icon: <InfoCircleOutlined />,
            },
            {
              title: '复习',
              description: '查看面试题目',
              icon: <QuestionCircleOutlined />,
            },
            {
              title: '面试',
              description: '开始面试',
              icon: <PlayCircleOutlined />,
            },
          ]}
          style={{ marginBottom: '32px' }}
        />
        
        {renderStepContent()}
      </Card>
    </div>
  );
};

export default InterviewCreateSession;