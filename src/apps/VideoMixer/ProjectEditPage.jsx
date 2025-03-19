import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Tabs,
  Upload,
  List,
  Spin,
  Empty,
  Steps,
  Progress,
  Alert,
  Tag,
  Divider,
  message,
  Modal,
  Tooltip,
  Breadcrumb
} from 'antd';
import {
  UploadOutlined,
  VideoCameraOutlined,
  CustomerServiceOutlined,
  PlayCircleOutlined,
  RollbackOutlined,
  PlaySquareOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  FileOutlined,
  ReloadOutlined,
  DownloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import videoMixerAPI from '../../api/videoMixerAPI';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { TabPane } = Tabs;

// 视频/音频文件类型列表
const VIDEO_FORMATS = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
const AUDIO_FORMATS = ['.mp3', '.wav', '.aac', '.ogg', '.flac'];

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // 状态
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [startProcessing, setStartProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [progressPolling, setProgressPolling] = useState(false);
  const [pollingTimer, setPollingTimer] = useState(null);
  
  // 计算项目是否可编辑 (status为0或1且isGenerateLock为0时可编辑)
  const isEditable = project && 
    (project.status === 0 || project.status === 1) && 
    project.isGenerateLock === 0;
  
  // 是否处理失败
  const isProcessingFailed = project && 
    (project.status === 7 || (project.errorMessage && project.errorMessage.length > 0));
  
  // 是否处理完成
  const isProcessingComplete = project && project.status === 6 && project.finalVideoUrl;
  
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
        
        // 更新已上传视频列表
        if (response.data.sourceVideos && response.data.sourceVideos.length > 0) {
          setUploadedVideos(response.data.sourceVideos.map(video => ({
            id: video.id,
            name: video.fileName,
            size: video.fileSize,
            duration: video.duration
          })));
        }
        
        // 如果项目已经开始生成，自动切换到进度标签页
        if (response.data.isGenerateLock === 1) {
          setActiveTab("2");
        }
        
        // 如果处理中但未完成，启动轮询
        if (response.data.isGenerateLock === 1 && 
            response.data.status !== 6 && 
            response.data.status !== 7 &&
            !response.data.errorMessage) {
          startProgressPolling();
        }
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
          
          // 如果处理已完成或处理失败，停止轮询
          if (response.data.status === 6 || 
              response.data.status === 7 || 
              response.data.errorMessage) {
            stopProgressPolling();
            
            if (response.data.status === 6) {
              message.success('视频处理已完成！');
            } else if (response.data.status === 7 || response.data.errorMessage) {
              message.error(`处理失败: ${response.data.errorMessage || '未知错误'}`);
            }
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
  
  // 上传视频前检查
  const beforeUploadVideo = (file) => {
    // 检查项目是否可编辑
    if (!isEditable) {
      message.error('项目已开始生成，无法上传视频');
      return Upload.LIST_IGNORE;
    }
    
    const isValidFormat = VIDEO_FORMATS.some(format => 
      file.name.toLowerCase().endsWith(format)
    );
    
    if (!isValidFormat) {
      message.error('只支持上传视频文件!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt2GB = file.size / 1024 / 1024 / 1024 < 2;
    if (!isLt2GB) {
      message.error('视频文件大小不能超过2GB!');
      return Upload.LIST_IGNORE;
    }
    
    // 手动上传
    handleUploadVideo(file);
    return false;
  };
  
  // 上传音乐前检查
  const beforeUploadMusic = (file) => {
    // 检查项目是否可编辑
    if (!isEditable) {
      message.error('项目已开始生成，无法上传音乐');
      return Upload.LIST_IGNORE;
    }
    
    // 检查项目音乐类型
    if (project?.backgroundMusicType !== 3) {
      message.error('当前项目不支持上传背景音乐');
      return Upload.LIST_IGNORE;
    }
    
    const isValidFormat = AUDIO_FORMATS.some(format => 
      file.name.toLowerCase().endsWith(format)
    );
    
    if (!isValidFormat) {
      message.error('只支持上传音频文件!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt50MB = file.size / 1024 / 1024 < 50;
    if (!isLt50MB) {
      message.error('音频文件大小不能超过50MB!');
      return Upload.LIST_IGNORE;
    }
    
    // 手动上传
    handleUploadMusic(file);
    return false;
  };
  
  // 处理视频上传
  const handleUploadVideo = async (file) => {
    setUploadingVideo(true);
    try {
      const response = await videoMixerAPI.uploadVideo(projectId, file);
      
      if (response.code === 200) {
        message.success(`视频${file.name}上传成功`);
        // 添加到上传列表
        setUploadedVideos(prev => [...prev, { 
          id: Date.now(), 
          name: file.name, 
          size: file.size 
        }]);
        // 刷新项目状态
        fetchProjectDetails();
      } else {
        message.error(response.message || '上传视频失败');
      }
    } catch (error) {
      message.error('上传视频失败');
      console.error('上传视频失败:', error);
    } finally {
      setUploadingVideo(false);
    }
  };
  
  // 处理音乐上传
  const handleUploadMusic = async (file) => {
    setUploadingMusic(true);
    try {
      const response = await videoMixerAPI.uploadMusic(projectId, file);
      
      if (response.code === 200) {
        message.success(`音乐${file.name}上传成功`);
        // 刷新项目状态
        fetchProjectDetails();
      } else {
        message.error(response.message || '上传音乐失败');
      }
    } catch (error) {
      message.error('上传音乐失败');
      console.error('上传音乐失败:', error);
    } finally {
      setUploadingMusic(false);
    }
  };
  
  // 处理开始生成视频
  const handleStartGeneration = async () => {
    Modal.confirm({
      title: '开始生成视频',
      icon: <ExclamationCircleOutlined />,
      content: '开始生成后，将无法继续上传视频和音乐。确定要开始生成视频吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          setStartProcessing(true);
          const response = await videoMixerAPI.generateVideo(projectId);
          
          if (response.code === 200) {
            message.success('视频开始生成，请耐心等待');
            // 刷新项目状态
            fetchProjectDetails();
            // 切换到进度标签页
            setActiveTab("2");
            // 启动进度轮询
            startProgressPolling();
          } else {
            message.error(response.message || '开始生成视频失败');
          }
        } catch (error) {
          message.error('开始生成视频失败');
          console.error('开始生成视频失败:', error);
        } finally {
          setStartProcessing(false);
        }
      }
    });
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
  
  // 获取当前进度百分比
  const getProgressPercent = (status) => {
    const progressMap = {
      0: 0,
      1: 20,
      2: 40,
      3: 60,
      4: 70,
      5: 85,
      6: 100,
      7: 0 // 处理失败
    };
    
    return progressMap[status] || 0;
  };
  
  // 格式化项目状态
  const formatProjectStatus = (status, errorMessage) => {
    // 如果有错误信息，显示处理失败状态
    if (errorMessage && errorMessage.length > 0) {
      return <Tag color="error">处理失败</Tag>;
    }
    
    const statusMap = {
      0: { text: '创建', color: 'default' },
      1: { text: '视频上传完成', color: 'processing' },
      2: { text: '视频分析完成', color: 'processing' },
      3: { text: '场景检测完成', color: 'processing' },
      4: { text: 'AI分析完成', color: 'processing' },
      5: { text: '音频生成完成', color: 'processing' },
      6: { text: '视频合成完成', color: 'success' },
      7: { text: '处理失败', color: 'error' }
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
  
  // 格式化文件大小
  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };
  
  // 渲染项目信息卡片
  const renderProjectInfoCard = () => {
    if (!project) return null;
    
    return (
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Breadcrumb style={{ marginBottom: '8px' }} items={[
              { title: <Link to="/">应用中心</Link> },
              { title: <Link to="/video-mixer">视频智能混剪</Link> },
              { title: project.name }
            ]} />
            <Title level={4}>{project.name}</Title>
            <Space size={[0, 8]} wrap style={{ marginBottom: '8px' }}>
              {formatProjectStatus(project.status, project.errorMessage)}
              <Text type="secondary">创建时间: {formatDate(project.createDate)}</Text>
            </Space>
            {project.description && <Paragraph>{project.description}</Paragraph>}
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
      </Card>
    );
  };
  
  // 渲染上传视频区域
  const renderVideoUploadSection = () => {
    if (!project) return null;
    
    return (
      <div>
        <Card 
          title={
            <Space>
              <VideoCameraOutlined />
              <span>上传源视频</span>
            </Space>
          }
          style={{ marginBottom: '16px' }}
        >
          {!isEditable ? (
            <Alert 
              message="项目已开始生成，无法继续上传视频" 
              type="info" 
              showIcon 
            />
          ) : (
            <>
              <Dragger
                name="videoFile"
                multiple={false}
                showUploadList={false}
                beforeUpload={beforeUploadVideo}
                disabled={uploadingVideo}
                style={{ marginBottom: '16px' }}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined style={{ color: '#1890ff', fontSize: '48px' }} />
                </p>
                <p className="ant-upload-text">
                  点击或拖拽视频文件到此区域上传
                </p>
                <p className="ant-upload-hint">
                  支持MP4, MOV, AVI等格式，文件大小不超过2GB
                </p>
                {uploadingVideo && <Spin style={{ marginTop: '8px' }} />}
              </Dragger>
            </>
          )}
        </Card>
        
        <Card title="已上传视频" style={{ marginBottom: '16px' }}>
          {uploadedVideos.length === 0 ? (
            <Empty description="暂无已上传视频" />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {/* 已上传的视频列表 */}
              {uploadedVideos.map(item => (
                <div 
                  key={item.id}
                  style={{ 
                    width: '140px', 
                    height: '140px', 
                    border: '1px solid #d9d9d9', 
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <VideoCameraOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', textAlign: 'center', wordBreak: 'break-word' }}>
                    {item.name}
                  </div>
                  {item.duration && (
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                      {Math.floor(item.duration / 60)}:{Math.floor(item.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                  {item.size && (
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      {formatFileSize(item.size)}
                    </div>
                  )}
                </div>
              ))}
              
              {/* 添加更多视频的上传框 - 只在可上传状态时显示 */}
              {isEditable && (
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={beforeUploadVideo}
                  disabled={uploadingVideo}
                >
                  <div style={{ padding: '24px' }}>
                    {uploadingVideo ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: '8px' }}>上传更多</div>
                  </div>
                </Upload>
              )}
            </div>
          )}
        </Card>
        
        {/* 背景音乐上传区域 - 如果是音乐类型3才显示 */}
        {project.backgroundMusicType === 3 && (
          <Card 
            title={
              <Space>
                <CustomerServiceOutlined />
                <span>上传背景音乐</span>
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            {!isEditable ? (
              <Alert 
                message="项目已开始生成，无法继续上传音乐" 
                type="info" 
                showIcon 
              />
            ) : (
              <>
                <Dragger
                  name="musicFile"
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={beforeUploadMusic}
                  disabled={uploadingMusic}
                >
                  <p className="ant-upload-drag-icon">
                    <CustomerServiceOutlined style={{ color: '#1890ff', fontSize: '48px' }} />
                  </p>
                  <p className="ant-upload-text">
                    点击或拖拽音乐文件到此区域上传
                  </p>
                  <p className="ant-upload-hint">
                    支持MP3, WAV, AAC等格式，文件大小不超过50MB
                  </p>
                  {uploadingMusic && <Spin style={{ marginTop: '8px' }} />}
                </Dragger>
                
                {project.backgroundMusicPath && (
                  <div style={{ marginTop: '16px' }}>
                    <Alert 
                      message={
                        <Space>
                          <CheckCircleOutlined />
                          <span>已上传背景音乐</span>
                        </Space>
                      } 
                      type="success" 
                      showIcon 
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        )}
        
        <Card title="项目详情">
          <List split={false} size="small">
            <List.Item>
              <Text strong style={{ marginRight: '8px' }}>目标时长:</Text>
              <Text>{project.targetDuration}秒</Text>
            </List.Item>
            
            {project.sceneKeywords && (
              <List.Item>
                <Text strong style={{ marginRight: '8px' }}>场景关键词:</Text>
                <Text>{project.sceneKeywords}</Text>
              </List.Item>
            )}
            
            <List.Item>
              <Text strong style={{ marginRight: '8px' }}>相关性阈值:</Text>
              <Text>{project.minRelevanceThreshold}</Text>
            </List.Item>
            
            {project.narrationStyle && (
              <List.Item>
                <Text strong style={{ marginRight: '8px' }}>解说词风格:</Text>
                <Text>{project.narrationStyle}</Text>
              </List.Item>
            )}
            
            <List.Item>
              <Text strong style={{ marginRight: '8px' }}>背景音乐类型:</Text>
              <Text>
                {project.backgroundMusicType === 1 ? 'AI生成' : 
                 project.backgroundMusicType === 2 ? '系统随机内置' : 
                 project.backgroundMusicType === 3 ? '上传音乐文件' : '未知'}
              </Text>
            </List.Item>
          </List>
        </Card>
        
        <Divider />
        
        {/* 开始生成按钮 - 仅在可编辑且有上传视频时显示 */}
        {isEditable && uploadedVideos.length > 0 && (
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleStartGeneration}
                loading={startProcessing}
              >
                开始生成视频
              </Button>
              <div style={{ marginTop: '10px' }}>
                <Text type="secondary">
                  点击后将开始AI分析与视频生成，请耐心等待处理完成
                </Text>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };
  
  // 渲染主要内容
  const renderContent = () => {
    return (
      <>
        {renderProjectInfoCard()}
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab="上传素材" 
            key="1"
            disabled={!isEditable && project && (project.status !== 0 && project.status !== 1)}
          >
            {renderVideoUploadSection()}
          </TabPane>
          <TabPane 
            tab={
              <span>
                {progressPolling ? <LoadingOutlined style={{ marginRight: '5px' }} /> : null}
                生成进度
              </span>
            } 
            key="2"
          >
            {renderProcessingProgress()}
          </TabPane>
        </Tabs>
      </>
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
      {renderContent()}
    </div>
  );
};

export default ProjectPage;
