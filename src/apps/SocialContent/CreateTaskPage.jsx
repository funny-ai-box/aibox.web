import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  InputNumber,
  Upload,
  Typography,
  Space,
  Divider,
  message,
  Tooltip,
  Alert,
  Steps,
  Result,
  Modal
} from 'antd';
import {
  InfoCircleOutlined,
  UploadOutlined,
  PlusOutlined,
  LoadingOutlined,
  DeleteOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PlatformSelector from './components/PlatformSelector';
import PromptTemplateSelector from './components/PromptTemplateSelector';
import socialContentAPI from '../../api/socialContentAPI';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState({ id: null, type: 1 });
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // 流式生成状态
  const [streamResponse, setStreamResponse] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  
  // 上传图片前检查
  const beforeUpload = (file) => {
    const isImage = file.type.indexOf('image/') === 0;
    if (!isImage) {
      message.error('只能上传图片文件!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('图片必须小于10MB!');
      return Upload.LIST_IGNORE;
    }
    
    return false; // 阻止自动上传，改为手动控制
  };
  
  // 处理文件变更
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  
  // 处理删除文件
  const handleRemoveFile = (file) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
  };
  
  // 处理平台变更
  const handlePlatformChange = (platformId) => {
    setSelectedPlatform(platformId);
    setSelectedPrompt({ id: null, type: 1 }); // 重置选择的提示词模板
  };
  
  // 处理提示词模板变更
  const handlePromptChange = (prompt) => {
    setSelectedPrompt(prompt);
  };
  
  // 处理表单提交
  const handleSubmit = async (values) => {
    if (!selectedPlatform) {
      message.error('请选择社交平台');
      return;
    }
    
    if (!selectedPrompt.id) {
      message.error('请选择提示词模板');
      return;
    }
    
    const taskData = {
      TaskName: values.taskName,
      Keywords: values.keywords,
      ProductInfo: values.productInfo,
      PlatformId: selectedPlatform,
      PromptId: selectedPrompt.id,
      PromptType: selectedPrompt.type,
      ContentCount: values.contentCount
    };
    
    try {
      setGenerating(true);
      setGenerationError(null);
      setStreamResponse('');
      setGeneratedResult(null);
      setCurrentStep(1); // 进入生成步骤
      
      if (fileList.length > 0) {
        // 有图片，使用表单上传
        await handleFormSubmission(taskData, values);
      } else {
        // 无图片，使用流式接口
        await handleStreamSubmission(taskData);
      }
      
    } catch (error) {
      console.error('任务创建失败:', error);
      setGenerationError('任务创建失败，请重试');
      message.error('任务创建失败');
    } finally {
      setGenerating(false);
    }
  };
  
  // 处理表单提交（带图片上传）
  const handleFormSubmission = async (taskData, values) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // 添加文本字段
      Object.keys(taskData).forEach(key => {
        formData.append(key, taskData[key]);
      });
      
      // 添加图片
      fileList.forEach(file => {
        formData.append('images', file.originFileObj);
      });
      
      const response = await socialContentAPI.createTaskWithImages(formData);
      
      if (response.code === 200) {
        message.success('任务创建成功');
        setGeneratedResult(response.data);
        setCurrentStep(2); // 完成步骤
      } else {
        setGenerationError(response.message || '创建任务失败');
        message.error(response.message || '创建任务失败');
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      setGenerationError('上传文件或创建任务失败');
      message.error('上传文件或创建任务失败');
    } finally {
      setUploading(false);
    }
  };
  
  // 处理流式提交（无图片）
  const handleStreamSubmission = async (taskData) => {
    try {
      const response = await socialContentAPI.createTaskStream(taskData);
      
      // 解析流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // 标记是否已经收到了完整响应
      let isDone = false;
      let taskResult = null;
      
      while (!isDone) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // 解码数据
        const chunk = decoder.decode(value, { stream: true });
        
        // 处理事件流数据
        const lines = chunk.split('\n\n').filter(line => line.trim());
        
        for (const line of lines) {
          // 解析事件类型和数据
          const eventMatch = line.match(/event: (\w+)/);
          const dataMatch = line.match(/data: (.*)/);
          
          if (!eventMatch || !dataMatch) continue;
          
          const eventType = eventMatch[1];
          const data = dataMatch[1];
          
          switch (eventType) {
            case 'start':
              // 开始生成
              break;
              
            case 'chunk':
              // 更新流式响应内容
              setStreamResponse(prev => prev + data);
              break;
              
            case 'done':
              // 生成完成，解析完整结果
              try {
                const resultData = JSON.parse(data);
                taskResult = resultData;
                isDone = true;
              } catch (e) {
                console.error('解析结果数据失败:', e);
              }
              break;
              
            case 'error':
              // 生成出错
              setGenerationError(data || '内容生成失败');
              isDone = true;
              break;
              
            case 'end':
              // 流式响应结束
              isDone = true;
              break;
              
            default:
              break;
          }
        }
      }
      
      if (taskResult) {
        setGeneratedResult(taskResult);
        setCurrentStep(2); // 完成步骤
      }
      
    } catch (error) {
      console.error('流式接口调用失败:', error);
      setGenerationError('内容生成失败，请重试');
      message.error('内容生成失败');
    }
  };
  
  // 处理查看生成内容预览
  const handlePreviewContent = (content) => {
    setPreviewContent(content);
    setPreviewVisible(true);
  };
  
  // 返回首页
  const goToHomePage = () => {
    navigate('/social-content');
  };
  
  // 创建新任务
  const createNewTask = () => {
    // 重置所有状态
    form.resetFields();
    setFileList([]);
    setStreamResponse('');
    setGeneratedResult(null);
    setGenerationError(null);
    setCurrentStep(0);
  };
  
  // 查看任务详情
  const viewTaskDetail = () => {
    if (generatedResult && generatedResult.Id) {
      navigate(`/social-content/task/${generatedResult.Id}`);
    }
  };
  
  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // 配置页面
        return renderConfigForm();
        
      case 1:
        // 生成中页面
        return renderGeneratingContent();
        
      case 2:
        // 结果页面
        return renderResultContent();
        
      default:
        return renderConfigForm();
    }
  };
  
  // 渲染配置表单
  const renderConfigForm = () => {
    return (
      <>
        <Card 
          title="创建社交媒体内容" 
          style={{ marginBottom: '16px' }}
          extra={
            <Button 
              type="primary" 
              onClick={() => form.submit()}
            >
              开始生成
            </Button>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              taskName: `内容创作 ${new Date().toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}`,
              contentCount: 2,
            }}
          >
            <Form.Item
              name="taskName"
              label="任务名称"
              rules={[{ required: true, message: '请输入任务名称' }]}
            >
              <Input placeholder="请输入任务名称" maxLength={100} />
            </Form.Item>
            
            <Form.Item
              name="productInfo"
              label={
                <Space>
                  <span>商品信息</span>
                  <Tooltip title="输入需要推广的商品或服务的详细信息，这些信息会替换模板中的{{商品信息}}占位符">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[{ required: true, message: '请输入商品信息' }]}
            >
              <TextArea 
                placeholder="请输入商品或服务的详细信息，如品牌、特点、价格等" 
                autoSize={{ minRows: 3, maxRows: 6 }}
                maxLength={5000}
                showCount
              />
            </Form.Item>
            
            <Form.Item
              name="keywords"
              label={
                <Space>
                  <span>关键词</span>
                  <Tooltip title="输入与商品相关的关键词，多个关键词用逗号分隔，这些信息会替换模板中的{{关键词}}占位符">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[{ required: true, message: '请输入关键词' }]}
            >
              <TextArea 
                placeholder="请输入关键词，多个关键词用逗号分隔" 
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={5000}
                showCount
              />
            </Form.Item>
            
            <Form.Item
              name="contentCount"
              label="生成数量"
              rules={[{ required: true, message: '请选择生成数量' }]}
            >
              <InputNumber min={1} max={5} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              label={
                <Space>
                  <span>上传图片（可选）</span>
                  <Tooltip title="上传图片将帮助AI更好地理解和描述您的商品，图片描述会替换模板中的{{图片描述}}占位符">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={handleFileChange}
                onRemove={handleRemoveFile}
                multiple
              >
                {fileList.length >= 8 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传</div>
                  </div>
                )}
              </Upload>
              <Text type="secondary">
                支持JPG、PNG等格式，单张图片不超过10MB，最多上传8张
              </Text>
            </Form.Item>
          </Form>
        </Card>
        
        <PlatformSelector
          value={selectedPlatform}
          onChange={handlePlatformChange}
        />
        
        <PromptTemplateSelector
          platformId={selectedPlatform}
          value={selectedPrompt}
          onChange={handlePromptChange}
        />
      </>
    );
  };
  
  // 渲染生成中内容
  const renderGeneratingContent = () => {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '24px' }} />
          <Title level={4}>正在生成内容，请稍候...</Title>
          
          {fileList.length > 0 && (
            <Text type="secondary">
              图片上传并分析中，这可能需要一些时间
            </Text>
          )}
          
          {generationError && (
            <Alert
              message="生成失败"
              description={generationError}
              type="error"
              style={{ marginTop: '16px', textAlign: 'left' }}
            />
          )}
          
          {streamResponse && (
            <div 
              style={{ 
                marginTop: '24px',
                textAlign: 'left',
                padding: '16px',
                background: '#f5f5f5',
                borderRadius: '4px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {streamResponse}
              </Paragraph>
            </div>
          )}
        </div>
      </Card>
    );
  };
  
  // 渲染结果内容
  const renderResultContent = () => {
    return (
      <Card>
        <Result
          status="success"
          title="内容生成成功！"
          subTitle={`任务名称: ${generatedResult?.TaskName || '内容创作任务'}`}
          extra={[
            <Button type="primary" key="detail" onClick={viewTaskDetail}>
              查看详情
            </Button>,
            <Button key="new" onClick={createNewTask}>
              创建新任务
            </Button>,
            <Button key="home" onClick={goToHomePage}>
              返回首页
            </Button>,
          ]}
        />
        
        {generatedResult && generatedResult.Contents && (
          <div style={{ marginTop: '24px' }}>
            <Divider>生成的内容预览</Divider>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {generatedResult.Contents.map((content, index) => (
                <Card 
                  key={content.Id || index}
                  style={{ width: 300, height: 200 }}
                  hoverable
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreviewContent(content.Content)}
                    >
                      查看完整内容
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={`${content.PlatformName} 内容 #${index + 1}`}
                    description={
                      <Paragraph 
                        ellipsis={{ rows: 4 }} 
                        style={{ height: '80px', overflow: 'hidden' }}
                      >
                        {content.Content}
                      </Paragraph>
                    }
                  />
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };
  
  // 内容预览模态框
  const renderPreviewModal = () => {
    return (
      <Modal
        title="内容预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
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
  
  return (
    <div>
      <Steps
        current={currentStep}
        style={{ marginBottom: '24px' }}
        items={[
          {
            title: '配置内容',
            description: '设置任务信息',
          },
          {
            title: '生成内容',
            description: '创作过程',
          },
          {
            title: '完成',
            description: '查看结果',
          },
        ]}
      />
      
      {renderStepContent()}
      {renderPreviewModal()}
    </div>
  );
};

export default CreateTaskPage;