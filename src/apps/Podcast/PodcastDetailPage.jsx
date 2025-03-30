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
  Spin
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
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import podcastAPI from '../../api/podcastAPI';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { confirm } = Modal;

/**
 * 播客详情页面
 */
const PodcastDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [taskDetail, setTaskDetail] = useState(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
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
  
  // 播放音频时的事件监听
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
    };
    
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  // 获取播客任务详情
  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      const response = await podcastAPI.getTaskDetail(taskId);
      
      if (response.code === 200) {
        setTaskDetail(response.data);
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
        title="播客基本信息" 
        style={{ marginBottom: '24px' }}
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
      <Collapse defaultActiveKey={['1']}>
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
                  background: '#f9f9f9',
                  borderRadius: '4px'
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
    
    // 按顺序排序脚本
    const sortedScripts = [...taskDetail.scriptItems].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    
    return (
      <List
        itemLayout="vertical"
        dataSource={sortedScripts}
        renderItem={(script, index) => (
          <List.Item
            key={script.id}
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
              </Space>
            ]}
            style={{ background: index % 2 === 0 ? 'transparent' : '#f9f9f9', padding: '16px' }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<UserOutlined />}
                  style={{ 
                    background: script.roleType === 1 ? '#1890ff' : '#52c41a',
                    marginTop: '4px'
                  }}
                />
              }
              title={
                <Space>
                  <Text strong>{script.roleName}</Text>
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
                padding: '12px', 
                background: '#f5f5f5', 
                borderRadius: '4px',
                border: currentPlayingIndex === index && isPlaying ? '1px solid #1890ff' : '1px solid transparent'
              }}
            >
              {script.content}
            </Paragraph>
          </List.Item>
        )}
      />
    );
  };
  
  if (loading && !taskDetail) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }
  
  if (!taskDetail) {
    return (
      <Card>
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
    <div>
      {renderTaskInfo()}
      
      <Tabs defaultActiveKey="script" style={{ marginBottom: '24px' }}>
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              内容素材
              <Badge 
                count={taskDetail.contentItems ? taskDetail.contentItems.length : 0} 
                style={{ marginLeft: '8px', backgroundColor: '#52c41a' }}
              />
            </span>
          }
          key="content"
        >
          {renderContentList()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <SoundOutlined />
              播客脚本
              <Badge 
                count={taskDetail.scriptItems ? taskDetail.scriptItems.length : 0} 
                style={{ marginLeft: '8px', backgroundColor: '#1890ff' }}
              />
            </span>
          }
          key="script"
        >
          {renderScriptList()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PodcastDetailPage;