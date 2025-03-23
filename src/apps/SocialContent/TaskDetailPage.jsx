import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Tag,
  Space,
  Descriptions,
  Tabs,
  List,
  Image,
  Divider,
  Progress,
  Empty,
  Spin,
  Alert,
  message,
  Modal,
  Collapse,
  Tooltip,
  Row,
  Col,
  Breadcrumb,
  Badge
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileImageOutlined,
  EyeOutlined,
  CopyOutlined,
  ReloadOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import socialContentAPI from '../../api/socialContentAPI';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [taskDetail, setTaskDetail] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  
  // 初始化加载
  useEffect(() => {
    if (taskId) {
      fetchTaskDetail();
    }
  }, [taskId]);
  
  // 获取任务详情
  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      const response = await socialContentAPI.getTaskDetail(taskId);
      
      if (response.code === 200) {
        setTaskDetail(response.data);
      } else {
        message.error(response.message || '获取任务详情失败');
      }
    } catch (error) {
      message.error('获取任务详情失败');
      console.error('获取任务详情失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 返回任务列表
  const goBack = () => {
    navigate('/social-content');
  };
  
  // 复制内容到剪贴板
  const copyContent = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        message.success('内容已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
  };
  
  // 查看内容详情
  const viewContentDetail = (content) => {
    setPreviewContent(content);
    setPreviewVisible(true);
  };
  
  // 预览图片
  const previewImg = (url) => {
    setPreviewImage(url);
    setImagePreviewVisible(true);
  };
  
  // 渲染任务状态标签
  const renderStatusTag = (status) => {
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
  
  // 渲染平台卡片
  const renderPlatformCard = (platform) => {
    return (
      <Card 
        key={platform.id}
        title={
          <Space>
            <img 
              src={getPlatformIcon(platform.platformCode)} 
              alt={platform.platformName}
              style={{ width: '24px', height: '24px' }}
            />
            <span>{platform.platformName}</span>
            {renderStatusTag(platform.status)}
          </Space>
        }
        style={{ marginBottom: '16px' }}
        type="inner"
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label="提示词模板">
            {platform.promptTemplateName}
          </Descriptions.Item>
          <Descriptions.Item label="模板类型">
            {platform.promptType === 1 ? '系统预设' : '用户自定义'}
          </Descriptions.Item>
          <Descriptions.Item label="生成数量">
            {platform.contentCount}
          </Descriptions.Item>
        </Descriptions>
        
        <Collapse 
          bordered={false} 
          style={{ marginTop: '16px', background: '#f9f9f9' }}
        >
          <Panel header="提示词模板内容" key="template">
            <Paragraph 
              style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '12px',
                padding: '8px',
                background: '#f5f5f5',
                borderRadius: '4px'
              }}
            >
              {platform.templateContent}
            </Paragraph>
          </Panel>
          <Panel header="系统提示词" key="system">
            <Paragraph 
              style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '12px',
                padding: '8px',
                background: '#f5f5f5',
                borderRadius: '4px'
              }}
            >
              {platform.systemPrompt}
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>
    );
  };
  
  // 获取平台图标
  const getPlatformIcon = (code) => {
    // 这里可以根据平台代码返回对应的图标URL
    // 如果没有图标，可以返回一个默认图标
    const iconMap = {
      'xiaohongshu': 'https://localhost:57460/images/platforms/xiaohongshu.png',
      'douyin': 'https://localhost:57460/images/platforms/douyin.png',
      'wechat_moments': 'https://localhost:57460/images/platforms/wechat.png'
    };
    
    return iconMap[code] || 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png';
  };
  
  // 渲染图片列表
  const renderImageList = () => {
    if (!taskDetail || !taskDetail.images || taskDetail.images.length === 0) {
      return <Empty description="暂无上传图片" />;
    }
    
    return (
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={taskDetail.images}
        renderItem={image => (
          <List.Item>
            <Card
              hoverable
              cover={
                <img 
                  alt="商品图片" 
                  src={image.imagePath}
                  style={{ height: '150px', objectFit: 'cover' }}
                  onClick={() => previewImg(image.imagePath)}
                />
              }
              actions={[
                <Tooltip title="查看大图">
                  <EyeOutlined key="view" onClick={() => previewImg(image.imagePath)} />
                </Tooltip>
              ]}
            >
              <Card.Meta 
                title="AI解析描述"
                description={
                  <Paragraph 
                    ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
                    style={{ fontSize: '12px' }}
                  >
                    {image.imageDescription || '暂无图片描述'}
                  </Paragraph>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    );
  };
  
  // 渲染内容列表
  const renderContentList = () => {
    if (!taskDetail || !taskDetail.contents || taskDetail.contents.length === 0) {
      return <Empty description="暂无生成内容" />;
    }
    
    const groupedContents = {};
    
    // 按平台分组内容
    taskDetail.contents.forEach(content => {
      const platformId = content.platformId;
      if (!groupedContents[platformId]) {
        groupedContents[platformId] = [];
      }
      groupedContents[platformId].push(content);
    });
    
    return (
      <div>
        {Object.entries(groupedContents).map(([platformId, contents]) => {
          // 获取平台信息
          const platform = taskDetail.platforms.find(p => p.platformId.toString() === platformId);
          const platformName = platform ? platform.platformName : '未知平台';
          const platformCode = platform ? platform.platformCode : '';
          
          return (
            <Card 
              key={platformId}
              title={
                <Space>
       
                  <span>{platformName}</span>
                </Space>
              }
              style={{ marginBottom: '16px' }}
              type="inner"
            >
              <List
                itemLayout="vertical"
                dataSource={contents}
                renderItem={(content, index) => (
                  <List.Item
                    key={content.id}
                    actions={[
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
                        onClick={() => viewContentDetail(content.content)}
                      >
                        查看完整内容
                      </Button>,
                      <Button 
                        icon={<CopyOutlined />}
                        onClick={() => copyContent(content.content)}
                      >
                        复制内容
                      </Button>
                    ]}
                    style={{ 
                      background: '#f9f9f9', 
                      padding: '16px', 
                      marginBottom: '16px',
                      borderRadius: '4px'
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color="blue">内容 #{index + 1}</Tag>
                          <Text type="secondary">创建时间: {formatDate(content.createDate)}</Text>
                        </Space>
                      }
                    />
                    <Paragraph 
                      ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
                      style={{ marginBottom: 0 }}
                    >
                      {content.content}
                    </Paragraph>
                  </List.Item>
                )}
              />
            </Card>
          );
        })}
      </div>
    );
  };
  
  // 渲染任务信息
  const renderTaskInfo = () => {
    if (!taskDetail) return null;
    
    return (
      <Card 
        title={
          <Breadcrumb items={[
            { title: <Link to="/social-content">任务列表</Link> },
            { title: taskDetail.taskName || '任务详情' }
          ]} />
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchTaskDetail}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={goBack}
            >
              返回列表
            </Button>
          </Space>
        }
        style={{ marginBottom: '16px' }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="任务名称" span={2}>
            {taskDetail.taskName}
          </Descriptions.Item>
          <Descriptions.Item label="任务状态">
            {renderStatusTag(taskDetail.status)}
            {taskDetail.processMessage && (
              <Text type="secondary" style={{ marginLeft: '8px' }}>
                {taskDetail.processMessage}
              </Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="完成进度">
            <Progress 
              percent={taskDetail.completionRate} 
              status={taskDetail.status === 2 ? 'success' : 'active'} 
              style={{ width: '200px' }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>
            {formatDate(taskDetail.createDate)}
          </Descriptions.Item>
          <Descriptions.Item label="商品信息" span={2}>
            <Paragraph 
              ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
              style={{ marginBottom: 0 }}
            >
              {taskDetail.productInfo}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="关键词" span={2}>
            <Space wrap>
              {taskDetail.keywords.split(',').map((keyword, index) => (
                <Tag key={index} color="blue">{keyword.trim()}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };
  
  // 渲染内容预览模态框
  const renderContentPreviewModal = () => {
    return (
      <Modal
        title="内容预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={() => copyContent(previewContent)}>
            复制内容
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <div 
          style={{ 
            maxHeight: '60vh', 
            overflowY: 'auto',
            padding: '16px',
            background: '#f9f9f9',
            borderRadius: '4px'
          }}
        >
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {previewContent}
          </Paragraph>
        </div>
      </Modal>
    );
  };
  
  if (loading && !taskDetail) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin tip="加载任务详情..." />
      </div>
    );
  }
  
  return (
    <div>
      {renderTaskInfo()}
      
      <Tabs defaultActiveKey="content">
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              生成内容
              <Badge 
                count={taskDetail?.contents?.length || 0} 
                style={{ marginLeft: '8px', backgroundColor: '#722ed1' }} 
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
              <PictureOutlined />
              商品图片
              <Badge 
                count={taskDetail?.images?.length || 0} 
                style={{ marginLeft: '8px', backgroundColor: '#52c41a' }} 
              />
            </span>
          } 
          key="images"
        >
          {renderImageList()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <FileDoneOutlined />
              平台模板
              <Badge 
                count={taskDetail?.platforms?.length || 0} 
                style={{ marginLeft: '8px', backgroundColor: '#1890ff' }} 
              />
            </span>
          } 
          key="platforms"
        >
          {taskDetail?.platforms?.map(renderPlatformCard)}
        </TabPane>
      </Tabs>
      
      {renderContentPreviewModal()}
      
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: imagePreviewVisible,
          src: previewImage,
          onVisibleChange: (vis) => setImagePreviewVisible(vis),
        }}
      />
    </div>
  );
};

export default TaskDetailPage;