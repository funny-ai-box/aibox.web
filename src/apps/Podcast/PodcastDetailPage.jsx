import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Tabs,
  List,
  Avatar,
  Tag,
  Progress,
  Divider,
  Collapse,
  Descriptions,
  Alert,
  message,
  Skeleton,
  Empty,
  Modal,
  Tooltip,
  Badge,
  Spin,
  Switch
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  UserOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  HourglassOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  CaretRightOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import podcastAPI from '../../api/podcastAPI';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { confirm } = Modal;

/**
 * 播客详情页面 - 增强版本
 */
const PodcastDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [taskDetail, setTaskDetail] = useState(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [sortedScripts, setSortedScripts] = useState([]);
  const [activeTabKey, setActiveTabKey] = useState('script');
  
  // 音频播放器引用
  const audioRef = useRef(new Audio());
  
  // 初始化加载
  useEffect(() => {
    if (taskId) {
      fetchTaskDetail();
    }
    
    // 清理函数
    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
    };
  }, [taskId]);
  
  // 处理音频事件
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      if (autoPlay && currentPlayingIndex !== null && sortedScripts.length > currentPlayingIndex + 1) {
        // 如果开启了自动播放并且有下一条音频，播放下一条
        playNext();
      } else {
        setIsPlaying(false);
        setCurrentPlayingIndex(null);
      }
    };
    
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [autoPlay, currentPlayingIndex, sortedScripts]);
  
  // 当排序的脚本变化或当前播放索引变化时，滚动到当前播放项
  useEffect(() => {
    if (currentPlayingIndex !== null && isPlaying) {
      const scriptItem = document.getElementById(`script-item-${currentPlayingIndex}`);
      if (scriptItem) {
        scriptItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentPlayingIndex, isPlaying]);
  
  // 获取播客任务详情
  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      const response = await podcastAPI.getTaskDetail(taskId);
      
      if (response.code === 200) {
        setTaskDetail(response.data);
        
        // 按顺序排序脚本
        if (response.data.scriptItems && response.data.scriptItems.length > 0) {
          const sorted = [...response.data.scriptItems].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
          setSortedScripts(sorted);
        }
      } else {
        message.error(response.message || '获取播客详情失败');
      }
    } catch (error) {
      console.error('获取播客详情失败:', error);
      message.error('获取播客详情失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 播放音频
  const playAudio = (audioUrl, index) => {
    // 如果已经在播放这个音频，就暂停
    if (currentPlayingIndex === index && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    // 如果播放的是新的音频，则更新源并播放
    if (currentPlayingIndex !== index) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setCurrentPlayingIndex(index);
    }
    
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(error => {
        console.error('播放音频失败:', error);
        message.error('播放音频失败');
      });
  };
  
  // 播放下一个音频
  const playNext = () => {
    if (currentPlayingIndex === null || sortedScripts.length === 0) return;
    
    const nextIndex = currentPlayingIndex + 1;
    if (nextIndex < sortedScripts.length) {
      const nextScript = sortedScripts[nextIndex];
      if (nextScript.audioStatus === 2) { // 只播放已生成的音频
        playAudio(nextScript.audioUrl, nextIndex);
      }
    }
  };
  
  // 播放上一个音频
  const playPrevious = () => {
    if (currentPlayingIndex === null || sortedScripts.length === 0) return;
    
    const prevIndex = currentPlayingIndex - 1;
    if (prevIndex >= 0) {
      const prevScript = sortedScripts[prevIndex];
      if (prevScript.audioStatus === 2) { // 只播放已生成的音频
        playAudio(prevScript.audioUrl, prevIndex);
      }
    }
  };
  
  // 播放/暂停所有
  const togglePlayAll = () => {
    if (isPlaying) {
      // 如果正在播放，则暂停
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // 如果没有播放，则从头开始播放
      if (sortedScripts.length > 0) {
        // 找到第一个可播放的脚本
        const firstPlayableIndex = sortedScripts.findIndex(script => script.audioStatus === 2);
        if (firstPlayableIndex !== -1) {
          playAudio(sortedScripts[firstPlayableIndex].audioUrl, firstPlayableIndex);
        }
      }
    }
  };
  
  // 开始生成播客
  const startGenerate = async () => {
    try {
      const response = await podcastAPI.generatePodcast(taskId);
      
      if (response.code === 200) {
        message.success('播客生成任务已提交，请稍后刷新查看结果');
        setTimeout(() => {
          fetchTaskDetail(); // 过一会儿刷新数据
        }, 2000);
      } else {
        message.error(response.message || '提交生成任务失败');
      }
    } catch (error) {
      console.error('提交生成任务失败:', error);
      message.error('提交生成任务失败');
    }
  };
  
  // 删除播客任务
  const confirmDeleteTask = () => {
    confirm({
      title: '确认删除播客任务',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复，确定要删除该播客任务吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteTask();
      }
    });
  };
  
  // 执行删除任务
  const deleteTask = async () => {
    try {
      const response = await podcastAPI.deleteTask(taskId);
      
      if (response.code === 200) {
        message.success('播客任务已删除');
        navigate('/podcast');
      } else {
        message.error(response.message || '删除播客任务失败');
      }
    } catch (error) {
      console.error('删除播客任务失败:', error);
      message.error('删除播客任务失败');
    }
  };
  
  // 渲染状态标签
  const renderStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag icon={<HourglassOutlined />} color="default">初始化</Tag>;
      case 1:
        return <Tag icon={<HourglassOutlined />} color="blue">待处理</Tag>;
      case 2:
        return <Tag icon={<SyncOutlined spin />} color="processing">处理中</Tag>;
      case 3:
        return <Tag icon={<CheckCircleOutlined />} color="success">已完成</Tag>;
      case 4:
        return <Tag icon={<CloseCircleOutlined />} color="error">处理失败</Tag>;
      default:
        return <Tag color="default">未知状态</Tag>;
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 渲染播客基本信息
  const renderTaskInfo = () => {
    if (!taskDetail) return null;
    
    return (
      <Card 
        title={
          <Space>
            <span className="gradient-text">播客详情</span>
            {renderStatusTag(taskDetail.status)}
          </Space>
        }
        className="task-info-card"
        style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}
        extra={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/podcast')}
            >
              返回列表
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchTaskDetail}
            >
              刷新
            </Button>
            {(taskDetail.status === 0 || taskDetail.status === 1) && (
              <Button 
                type="primary"
                icon={<PlayCircleOutlined />} 
                onClick={startGenerate}
              >
                生成播客
              </Button>
            )}
            <Button 
              danger
              icon={<DeleteOutlined />} 
              onClick={confirmDeleteTask}
            >
              删除
            </Button>
          </Space>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="任务标题" span={2}>
            {taskDetail.title}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDate(taskDetail.createDate)}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {renderStatusTag(taskDetail.status)}
            {taskDetail.errorMessage && (
              <Tooltip title={taskDetail.errorMessage}>
                <InfoCircleOutlined style={{ marginLeft: '8px', color: '#ff4d4f' }} />
              </Tooltip>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="主题/场景">
            {taskDetail.scene}
          </Descriptions.Item>
          <Descriptions.Item label="播客氛围">
            {taskDetail.atmosphere}
          </Descriptions.Item>
          <Descriptions.Item label="嘉宾数量">
            {taskDetail.guestCount}
          </Descriptions.Item>
          <Descriptions.Item label="生成次数">
            {taskDetail.generateCount || 0}
          </Descriptions.Item>
          <Descriptions.Item label="处理进度" span={2}>
            <Progress 
              percent={taskDetail.progressStep} 
              status={
                taskDetail.status === 3 ? 'success' : 
                taskDetail.status === 4 ? 'exception' : 
                taskDetail.status === 2 ? 'active' : 'normal'
              }
              style={{ width: '100%' }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {taskDetail.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };
  
  // 渲染播客内容
  const renderContentList = () => {
    if (!taskDetail || !taskDetail.contentItems || taskDetail.contentItems.length === 0) {
      return (
        <Empty 
          description="暂无内容" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }
    
    return (
      <Collapse defaultActiveKey={['1']} className="content-collapse">
        {taskDetail.contentItems.map((content, index) => (
          <Panel 
            header={
              <Space>
                {content.contentType === 1 ? (
                  <Badge status="success" text="文本内容" />
                ) : (
                  <Badge status="processing" text={content.sourceDocumentTitle || '文档内容'} />
                )}
              </Space>
            } 
            key={content.id}
          >
            {content.sourceDocumentStatus === 1 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin tip="内容处理中..." />
              </div>
            ) : content.sourceDocumentStatus === 3 ? (
              <Alert
                message="处理失败"
                description={content.sourceDocumentProcessMessage || '文档处理失败'}
                type="error"
                showIcon
              />
            ) : (
              <Paragraph
                style={{ 
                  maxHeight: '300px', 
                  overflow: 'auto',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px'
                }}
              >
                {content.sourceContent || '没有内容'}
              </Paragraph>
            )}
          </Panel>
        ))}
      </Collapse>
    );
  };
  
  // 渲染脚本列表
  const renderScriptList = () => {
    if (!taskDetail || !taskDetail.scriptItems || taskDetail.scriptItems.length === 0) {
      if (taskDetail && (taskDetail.status === 2 || taskDetail.status === 3)) {
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="脚本生成中..." />
          </div>
        );
      }
      
      return (
        <Empty 
          description="暂无脚本" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }
    
    // 播放控制区域
    const renderPlayControls = () => (
      <Card className="play-controls-card" style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Space>
              <Button 
                type="primary" 
                shape="circle" 
                icon={<StepBackwardOutlined />} 
                onClick={playPrevious}
                disabled={currentPlayingIndex === null || currentPlayingIndex === 0}
              />
              <Button 
                type="primary" 
                shape="circle" 
                size="large"
                icon={isPlaying ? <PauseCircleOutlined /> : <CaretRightOutlined />} 
                onClick={togglePlayAll}
                disabled={sortedScripts.length === 0}
              />
              <Button 
                type="primary" 
                shape="circle" 
                icon={<StepForwardOutlined />} 
                onClick={playNext}
                disabled={currentPlayingIndex === null || currentPlayingIndex === sortedScripts.length - 1}
              />
            </Space>
          </div>
          
          <div>
            <Space>
              <Text>连续播放</Text>
              <Switch 
                checked={autoPlay} 
                onChange={setAutoPlay} 
                checkedChildren="开启" 
                unCheckedChildren="关闭"
              />
            </Space>
          </div>
          
          {currentPlayingIndex !== null && (
            <div>
              <Tag color="blue">
                正在播放: {sortedScripts[currentPlayingIndex]?.roleName} - 
                脚本 #{currentPlayingIndex + 1}/{sortedScripts.length}
              </Tag>
            </div>
          )}
        </div>
      </Card>
    );
    
    return (
      <div>
        {renderPlayControls()}
        
        <List
          itemLayout="vertical"
          dataSource={sortedScripts}
          renderItem={(script, index) => (
            <List.Item
              key={script.id}
              id={`script-item-${index}`}
              className={`script-item ${currentPlayingIndex === index && isPlaying ? 'playing' : ''}`}
              style={{ 
                borderRadius: '8px',
                marginBottom: '12px',
                background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                padding: '16px',
                transition: 'all 0.3s ease',
                border: currentPlayingIndex === index ? '2px solid #1890ff' : '2px solid transparent',
                position: 'relative'
              }}
              actions={[
                <Space>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={currentPlayingIndex === index && isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={() => playAudio(script.audioUrl, index)}
                    disabled={script.audioStatus !== 2}
                  />
                  <Text>{script.audioDuration}</Text>
                  {script.audioStatus === 2 && (
                    <a href={script.audioUrl} download target="_blank" rel="noopener noreferrer">
                      <Button 
                        type="text" 
                        icon={<DownloadOutlined />} 
                        size="small"
                      >
                        下载
                      </Button>
                    </a>
                  )}
                </Space>
              ]}
            >
              {currentPlayingIndex === index && isPlaying && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '-8px', 
                    right: '16px',
                    background: '#1890ff',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  正在播放
                </div>
              )}
              
              <List.Item.Meta
                avatar={
                  <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    style={{ 
                      background: script.roleType === 1 ? 'linear-gradient(135deg, #1890ff, #096dd9)' : 'linear-gradient(135deg, #52c41a, #389e0d)',
                      marginTop: '4px'
                    }}
                  />
                }
                title={
                  <Space>
                    <Text strong style={{ fontSize: '16px' }}>{script.roleName}</Text>
                    <Tag color={script.roleType === 1 ? 'blue' : 'green'}>
                      {script.roleTypeDescription}
                    </Tag>
                    <Tag color="purple">
                      {script.voiceName} - {script.voiceDescription}
                    </Tag>
                  </Space>
                }
                description={
                  <Text type="secondary">
                    <SoundOutlined style={{ marginRight: '8px' }} />
                    {script.audioStatus === 0 ? "待生成" : 
                     script.audioStatus === 1 ? "生成中" : 
                     script.audioStatus === 2 ? "已生成" : "生成失败"}
                  </Text>
                }
              />
              <Paragraph
                style={{ 
                  marginTop: '12px', 
                  padding: '16px', 
                  background: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '8px',
                  borderLeft: currentPlayingIndex === index && isPlaying ? '4px solid #1890ff' : '4px solid transparent'
                }}
              >
                {script.content}
              </Paragraph>
            </List.Item>
          )}
        />
      </div>
    );
  };
  
  // 标签页切换
  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };
  
  if (loading && !taskDetail) {
    return (
      <Card className="loading-card" style={{ borderRadius: '12px' }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }
  
  if (!taskDetail) {
    return (
      <Card className="not-found-card" style={{ borderRadius: '12px' }}>
        <Empty 
          description="未找到播客任务" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/podcast')}>
            返回列表
          </Button>
        </Empty>
      </Card>
    );
  }
  
  return (
    <div className="podcast-detail-container">
      {renderTaskInfo()}
      
      <Card 
        className="content-card"
        style={{ 
          borderRadius: '12px', 
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, rgba(240, 242, 245, 0.8), rgba(240, 242, 245, 0.3))'
        }}
      >
        <Tabs 
          activeKey={activeTabKey} 
          onChange={handleTabChange}
          items={[
            {
              key: 'script',
              label: (
                <span>
                  <SoundOutlined />
                  播客脚本
                  <Badge 
                    count={taskDetail.scriptItems ? taskDetail.scriptItems.length : 0} 
                    style={{ marginLeft: '8px', backgroundColor: '#1890ff' }}
                  />
                </span>
              ),
              children: renderScriptList()
            },
            {
              key: 'content',
              label: (
                <span>
                  <FileTextOutlined />
                  内容素材
                  <Badge 
                    count={taskDetail.contentItems ? taskDetail.contentItems.length : 0} 
                    style={{ marginLeft: '8px', backgroundColor: '#52c41a' }}
                  />
                </span>
              ),
              children: renderContentList()
            }
          ]}
        />
      </Card>
      
      {/* 添加动态视觉效果 */}
      <style jsx="true">{`
        .podcast-detail-container {
          position: relative;
        }
        
        .gradient-text {
          background: linear-gradient(45deg, #1890ff, #096dd9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: bold;
        }
        
        .task-info-card,
        .content-card,
        .loading-card,
        .not-found-card,
        .play-controls-card {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .task-info-card:hover,
        .content-card:hover,
        .play-controls-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        
        .script-item {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }
        
        .script-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
        
        .script-item.playing {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
          }
        }
        
        .content-collapse .ant-collapse-header {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px 8px 0 0 !important;
        }
      `}</style>
    </div>
  );
};

export default PodcastDetailPage;