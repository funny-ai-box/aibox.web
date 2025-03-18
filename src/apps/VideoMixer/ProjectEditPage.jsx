import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Upload,
  List,
  Spin,
  Empty,
  Steps,
  Progress,
  Alert,
  message,
  Modal,
  Tabs,
  Tag,
  Divider
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
  FileOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import videoMixerAPI from '../../api/videoMixerAPI';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Step } = Steps;
const { TabPane } = Tabs;

// 视频/音频文件类型列表
const VIDEO_FORMATS = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
const AUDIO_FORMATS = ['.mp3', '.wav', '.aac', '.ogg', '.flac'];

const ProjectEditPage = () => {
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
  
  // 初始加载
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);
  
  // 获取项目详情
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await videoMixerAPI.getProjectDetail(projectId);
      
      if (response.code === 200) {
        setProject(response.data);
        // 如果项目已经开始生成，自动切换到进度标签页
        if (response.data.isGenerateLock === 1) {
          setActiveTab("2");
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
  
  // 上传视频前检查
  const beforeUploadVideo = (file) => {
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
    // 检查项目是否已锁定
    if (project?.isGenerateLock === 1) {
      message.error('项目已开始生成，无法上传视频');
      return;
    }
    
    setUploadingVideo(true);
    try {
      const response = await videoMixerAPI.uploadVideo(projectId, file);
      
      if (response.code === 200) {
        message.success(`视频${file.name}上传成功`);
        setUploadedVideos(prev => [...prev, { name: file.name, id: Date.now() }]);
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
    // 检查项目是否已锁定
    if (project?.isGenerateLock === 1) {
      message.error('项目已开始生成，无法上传音乐');
      return;
    }
    
    if (project?.backgroundMusicType !== 3) {
      message.error('当前项目不支持上传背景音乐');
      return;
    }
    
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
  
  // 渲染项目信息卡片
  const renderProjectInfoCard = () => {
    if (!project) return null;
    
    return (
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={4}>{project.name}</Title>
            <Paragraph>{project.description}</Paragraph>
            <Space wrap>
              <Text strong>目标时长:</Text>
              <Text>{project.targetDuration}秒</Text>
              
              {project.sceneKeywords && (
                <>
                  <Text strong>场景关键词:</Text>
                  <Text>{project.sceneKeywords}</Text>
                </>
              )}
              
              <Text strong>相关性阈值:</Text>
              <Text>{project.minRelevanceThreshold}</Text>
              
              {project.narrationStyle && (
                <>
                  <Text strong>解说词风格:</Text>
                  <Text>{project.narrationStyle}</Text>
                </>
              )}
              
              <Text strong>背景音乐类型:</Text>
              <Text>
                {project.backgroundMusicType === 1 ? 'AI生成' : 
                 project.backgroundMusicType === 2 ? '系统随机内置' : 
                 project.backgroundMusicType === 3 ? '上传音乐文件' : '未知'}
              </Text>
            </Space>
            
            {project.isGenerateLock === 1 && (
              <div style={{ marginTop: '8px' }}>
                <Tag color="processing">正在处理中</Tag>
              </div>
            )}
          </div>
          
          <Button 
            icon={<RollbackOutlined />} 
            onClick={() => navigate('/video-mixer')}
          >
            返回列表
          </Button>
        </div>
      </Card>
    );
  };
  
  // 渲染上传视频区域
  const renderVideoUploadSection = () => {
    if (!project) return null;
    
    // 根据isGenerateLock判断是否可以上传视频
    const canUploadVideo = project.isGenerateLock === 0;
    
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
          {!canUploadVideo ? (
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
                </div>
              ))}
              
              {/* 添加更多视频的上传框 - 只在可上传状态时显示 */}
              {canUploadVideo && (
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
            {!canUploadVideo ? (
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
        
        <Divider />
        
        {/* 开始生成按钮 - 仅在未锁定且有上传视频时显示 */}
        {canUploadVideo && uploadedVideos.length > 0 && (
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
  
  // 渲染视频生成进度
  const renderProcessingProgress = () => {
    if (!project) return null;
    
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
    
    const percent = getProgressPercent(project.status);
    const stepText = getProjectSteps()[project.status]?.title || '处理中';
    
    return (
      <div>
        <Card style={{ marginBottom: '16px' }}>
          <div>
            <Title level={4}>视频生成进度</Title>
            <Steps 
              current={project.status} 
              size="small"
              style={{ marginTop: '20px', marginBottom: '40px' }}
              items={getProjectSteps().map((step, index) => ({
                title: step.title,
                description: step.description,
                status: 
                  index < project.status ? 'finish' : 
                  index === project.status ? 'process' : 
                  'wait'
              }))}
            />
            
            <div style={{ padding: '0 50px' }}>
              <Progress 
                percent={percent} 
                status={project.status === 6 ? 'success' : 'active'} 
                format={() => `${stepText} ${percent}%`} 
              />
            </div>
          </div>
        </Card>
        
        {project.status === 6 && project.finalVideoUrl && (
          <Card title="生成结果">
            <div style={{ textAlign: 'center' }}>
              <Alert
                message="视频生成完成！"
                description="您的视频已经成功生成，可以点击下方按钮查看或下载。"
                type="success"
                showIcon
                style={{ marginBottom: '24px' }}
              />
              
              {/* 显示视频预览 */}
              <div style={{ marginBottom: '24px' }}>
                <video 
                  controls 
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                  src={project.finalVideoUrl}
                />
              </div>
              
              <Space size="large">
                <Button 
                  type="primary"
                  icon={<PlaySquareOutlined />}
                  onClick={() => window.open(project.finalVideoUrl, '_blank')}
                >
                  在新窗口播放
                </Button>
                <Button
                  icon={<UploadOutlined />}
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
            </div>
          </Card>
        )}
        
        {project.errorMessage && (
          <Card>
            <Alert
              message="处理失败"
              description={project.errorMessage}
              type="error"
              showIcon
            />
          </Card>
        )}
      </div>
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
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="上传素材" key="1">
          {renderVideoUploadSection()}
        </TabPane>
        <TabPane tab="生成进度" key="2">
          {renderProcessingProgress()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProjectEditPage;