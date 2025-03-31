import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Divider,
  Spin,
  Empty,
  Steps,
  Progress,
  Alert,
  List,
  Tag,
  Collapse,
  message,
  Row,
  Col
} from 'antd';
import {
  VideoCameraOutlined,
  CustomerServiceOutlined,
  PlayCircleOutlined,
  RollbackOutlined,
  PlaySquareOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import videoMixerAPI from '../../api/videoMixerAPI';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // 状态
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [progressPolling, setProgressPolling] = useState(false);
  const [pollingTimer, setPollingTimer] = useState(null);
  
  // 初始加载
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
    
    // 组件卸载时清除定时器
    return () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
    };
  }, [projectId]);
  
  // 获取项目详情
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await videoMixerAPI.getProjectDetail(projectId);
      
      if (response.code === 200) {
        setProject(response.data);
        
        // 如果项目状态不是6（完成）且没有错误，启动进度轮询
   
      } else {
        message.error(response.message || '获取项目详情失败');
      }
    } catch (error) {
      message.error('获取项目详情失败');
      console.error('获取项目详情失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 启动进度轮询
  const startProgressPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
    }
    
    setProgressPolling(true);
    const timer = setInterval(async () => {
      try {
        const response = await videoMixerAPI.getProjectDetail(projectId);
        
        if (response.code === 200) {
          setProject(response.data);
          
          // 如果处理已完成，停止轮询
          if (response.data.status === 6) {
            stopProgressPolling();
            message.success('视频处理已完成！');
          }
          
          // 如果处理失败，停止轮询
          if (response.data.errorMessage) {
            stopProgressPolling();
            message.error(`处理失败: ${response.data.errorMessage}`);
          }
        }
      } catch (error) {
        console.error('轮询项目状态出错:', error);
      }
    }, 5000); // 每5秒轮询一次
    
    setPollingTimer(timer);
  };
  
  // 停止进度轮询
  const stopProgressPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      setPollingTimer(null);
    }
    setProgressPolling(false);
  };
  
  // 获取项目状态步骤
  const getProjectSteps = () => {
    const steps = [
      { title: '创建项目', description: '项目已创建' },
      { title: '视频上传', description: '视频上传完成' },
      { title: '视频分析', description: '视频内容分析' },
      { title: '场景检测', description: '场景自动检测' },
      { title: 'AI分析', description: 'AI内容理解与精选' },
      { title: '音频生成', description: '音频合成' },
      { title: '视频合成', description: '最终视频生成' }
    ];
    
    return steps;
  };
  
  // 格式化项目状态
  const formatProjectStatus = (status) => {
    const statusMap = {
      0: { text: '创建', color: 'default' },
      1: { text: '视频上传完成', color: 'processing' },
      2: { text: '视频分析完成', color: 'processing' },
      3: { text: '场景检测完成', color: 'processing' },
      4: { text: 'AI分析完成', color: 'processing' },
      5: { text: '音频生成完成', color: 'processing' },
      6: { text: '视频合成完成', color: 'success' }
    };
    
    const statusInfo = statusMap[status] || { text: '未知状态', color: 'default' };
    
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 获取当前进度百分比
  const getProgressPercent = (status) => {
    const progressMap = {
      0: 0,
      1: 20,
      2: 40,
      3: 60,
      4: 70,
      5: 85,
      6: 100
    };
    
    return progressMap[status] || 0;
  };
  
  // 渲染合并的项目信息与详情卡片
  const renderProjectInfoCard = () => {
    if (!project) return null;
    
    return (
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <Title level={4}>{project.name}</Title>
            <Space size={[0, 8]} wrap style={{ marginBottom: '8px' }}>
              {formatProjectStatus(project.status)}
              <Text type="secondary">创建时间: {formatDate(project.createDate)}</Text>
            </Space>
            <Paragraph>{project.description}</Paragraph>
          </div>
          
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchProjectDetails}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              icon={<RollbackOutlined />} 
              onClick={() => navigate('/video-mixer')}
            >
              返回列表
            </Button>
          </Space>
        </div>
        
        <Divider style={{ margin: '0 0 16px 0' }} />
        
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12} md={8}>
            <List.Item>
              <Text strong style={{ marginRight: '8px' }}>目标时长:</Text>
              <Text>{project.targetDuration}秒</Text>
            </List.Item>
          </Col>
          
          {project.sceneKeywords && (
            <Col xs={24} sm={12} md={8}>
              <List.Item>
                <Text strong style={{ marginRight: '8px' }}>场景关键词:</Text>
                <Text>{project.sceneKeywords}</Text>
              </List.Item>
            </Col>
          )}
          
          <Col xs={24} sm={12} md={8}>
            <List.Item>
              <Text strong style={{ marginRight: '8px' }}>相关性阈值:</Text>
              <Text>{project.minRelevanceThreshold}</Text>
            </List.Item>
          </Col>
          
          {project.narrationStyle && (
            <Col xs={24} sm={12} md={8}>
              <List.Item>
                <Text strong style={{ marginRight: '8px' }}>解说词风格:</Text>
                <Text>{project.narrationStyle}</Text>
              </List.Item>
            </Col>
          )}
          
          <Col xs={24} sm={12} md={8}>
            <List.Item>
              <Text strong style={{ marginRight: '8px' }}>背景音乐类型:</Text>
              <Text>
                {project.backgroundMusicType === 1 ? 'AI生成' : 
                 project.backgroundMusicType === 2 ? '系统随机内置' : 
                 project.backgroundMusicType === 3 ? '上传音乐文件' : '未知'}
              </Text>
            </List.Item>
          </Col>
        </Row>
      </Card>
    );
  };
  
  // 渲染视频生成进度
  const renderProcessingProgress = () => {
    if (!project) return null;
    
    const percent = getProgressPercent(project.status);
    const stepText = getProjectSteps()[project.status]?.title || '处理中';
    const currentStep = project.status;
    
    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>处理进度</span>
            <div>
              <Progress 
                type="circle" 
                percent={percent} 
                width={40} 
                status={project.status === 6 ? 'success' : 'active'} 
                format={() => `${percent}%`}
              />
            </div>
          </div>
        } 
        style={{ height: '100%' }}
      >
        {progressPolling && (
          <Alert
            message={
              <span>
                <Spin size="small" style={{ marginRight: '8px' }} />
                正在自动更新处理进度...
              </span>
            }
            type="info"
            showIcon={false}
            style={{ marginBottom: '16px' }}
          />
        )}
          {project.errorMessage && (
          <Alert
            message="处理失败"
            description={project.errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        
        <Steps 
          direction="vertical"
          current={currentStep} 
          size="small"
          items={getProjectSteps().map((step, index) => ({
            title: (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{step.title}</span>
                
              </div>
            ),
            description: (
              <div style={{ fontSize: '12px', color: '#888' }}>
                {step.description}
              </div>
            ),
            status: 
              index < currentStep ? 'finish' : 
              index === currentStep ? 'process' : 
              'wait'
          }))}
        />
        
      
      </Card>
    );
  };
  
  // 渲染最终视频
  const renderFinalVideo = () => {
    if (!project) return null;
    
    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>最终生成视频</span>
            {project.status === 6 && project.finalVideoUrl && (
              <Space>
                <Button 
                  type="primary"
                  size="small"
                  icon={<PlaySquareOutlined />}
                  onClick={() => window.open(project.finalVideoUrl, '_blank')}
                >
                  新窗口播放
                </Button>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = project.finalVideoUrl;
                    a.download = `${project.name}.mp4`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  下载视频
                </Button>
              </Space>
            )}
          </div>
        } 
        style={{ height: '100%' }}
      >
        <div style={{ textAlign: 'center' }}>
          {project.status === 6 && project.finalVideoUrl ? (
            <>
              <video 
                controls 
                style={{ width: '100%', borderRadius: '4px', maxHeight: '600px' }}
                src={project.finalVideoUrl}
                poster={`https://picsum.photos/800/450?random=${projectId}`} // 使用随机占位图作为封面
              />
            </>
          ) : (
            <Empty
              image={<ClockCircleOutlined style={{ fontSize: '64px', color: '#1890ff' }} />}
              imageStyle={{ height: 120 }}
              description={
                <div>
                  <Text>视频处理中，请稍后刷新页面查看结果</Text>
                  <div style={{ marginTop: '16px' }}>
                    <Progress 
                      percent={getProgressPercent(project.status)} 
                      status="active" 
                      style={{ maxWidth: '300px', margin: '0 auto' }}
                    />
                  </div>
                </div>
              }
            />
          )}
        </div>
      </Card>
    );
  };
  
  if (loading && !project) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载项目信息...</div>
      </div>
    );
  }
  
  if (!loading && !project) {
    return (
      <Empty 
        description="未找到项目信息" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button 
          type="primary" 
          onClick={() => navigate('/video-mixer')}
        >
          返回项目列表
        </Button>
      </Empty>
    );
  }
  
  return (
    <div>
      {renderProjectInfoCard()}
      
      <Row gutter={[16, 16]}>
        {/* 左侧布局 */}
        <Col xs={24} sm={24} md={10} lg={8} xl={7}>
          {renderProcessingProgress()}
        </Col>
        
        {/* 右侧布局 */}
        <Col xs={24} sm={24} md={14} lg={16} xl={17}>
          {renderFinalVideo()}
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDetailPage;