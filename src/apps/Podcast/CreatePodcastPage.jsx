import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Upload,
  Typography,
  InputNumber,
  Select,
  message,
  Divider,
  Alert,
  Steps,
  Result
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FileAddOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import podcastAPI from '../../api/podcastAPI';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { Option } = Select;

/**
 * 创建播客页面
 */
const CreatePodcastPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [taskId, setTaskId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [textContent, setTextContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  
  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      const taskData = {
        Title: values.title,
        Description: values.description,
        Scene: values.scene,
        Atmosphere: values.atmosphere,
        GuestCount: values.guestCount
      };
      
      const response = await podcastAPI.createTask(taskData);
      
      if (response.code === 200) {
        message.success('播客任务创建成功');
        setTaskId(response.data.id);
        setCurrentStep(1);
      } else {
        message.error(response.message || '创建播客任务失败');
      }
    } catch (error) {
      console.error('创建播客任务失败:', error);
      message.error('创建播客任务失败');
    }
  };
  
  // 文件上传前检查
  const beforeUpload = (file) => {
    const isText = file.type === 'text/plain';
    const isPDF = file.type === 'application/pdf';
    const isWord = 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      file.type === 'application/msword';
    
    if (!isText && !isPDF && !isWord) {
      message.error('只能上传TXT、PDF或Word文件!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('文件必须小于10MB!');
      return Upload.LIST_IGNORE;
    }
    
    return false; // 阻止自动上传，改为手动控制
  };
  
  // 处理文件状态变更
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  
  // 上传文件
  const uploadFile = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择要上传的文件');
      return;
    }
    
    if (!taskId) {
      message.error('任务ID无效，无法上传文件');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      formData.append('id', taskId);
      
      const response = await podcastAPI.uploadDocument(formData);
      
      if (response.code === 200) {
        message.success('文件上传成功');
        
        // 添加到内容列表
        const contentId = response.data;
        
        // 获取文档详情
        fetchContentDetail(contentId);
        
        // 清空文件列表
        setFileList([]);
      } else {
        message.error(response.message || '上传文件失败');
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      message.error('上传文件失败');
    } finally {
      setUploading(false);
    }
  };
  
  // 获取内容详情
  const fetchContentDetail = async (contentId) => {
    try {
      setLoadingContent(true);
      const response = await podcastAPI.getContentDetail(contentId);
      
      if (response.code === 200) {
        // 添加到内容列表
        setContentList(prev => [...prev, response.data]);
      } else {
        message.error(response.message || '获取内容详情失败');
      }
    } catch (error) {
      console.error('获取内容详情失败:', error);
      message.error('获取内容详情失败');
    } finally {
      setLoadingContent(false);
    }
  };
  
  // 提交文本内容
  const handleTextSubmit = async () => {
    if (!textContent.trim()) {
      message.warning('请输入文本内容');
      return;
    }
    
    if (!taskId) {
      message.error('任务ID无效，无法导入文本');
      return;
    }
    
    try {
      setLoadingContent(true);
      const response = await podcastAPI.importText({
        Id: taskId,
        Text: textContent
      });
      
      if (response.code === 200) {
        message.success('文本导入成功');
        
        // 获取文档详情
        const contentId = response.data;
        fetchContentDetail(contentId);
        
        // 清空文本框
        setTextContent('');
      } else {
        message.error(response.message || '导入文本失败');
      }
    } catch (error) {
      console.error('导入文本失败:', error);
      message.error('导入文本失败');
    } finally {
      setLoadingContent(false);
    }
  };
  
  // 删除内容
  const handleDeleteContent = async (contentId) => {
    try {
      const response = await podcastAPI.deleteContent(contentId);
      
      if (response.code === 200) {
        message.success('内容已删除');
        setContentList(prev => prev.filter(item => item.id !== contentId));
      } else {
        message.error(response.message || '删除内容失败');
      }
    } catch (error) {
      console.error('删除内容失败:', error);
      message.error('删除内容失败');
    }
  };
  
  // 开始生成播客
  const startGenerate = async () => {
    if (contentList.length === 0) {
      message.warning('请至少添加一项内容再开始生成');
      return;
    }
    
    try {
      const response = await podcastAPI.generatePodcast(taskId);
      
      if (response.code === 200) {
        message.success('播客生成任务已提交，请稍后查看结果');
        setCurrentStep(2);
      } else {
        message.error(response.message || '提交生成任务失败');
      }
    } catch (error) {
      console.error('提交生成任务失败:', error);
      message.error('提交生成任务失败');
    }
  };
  
  // 返回上一步
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // 返回首页
  const goToList = () => {
    navigate('/podcast');
  };
  
  // 查看任务详情
  const viewTaskDetail = () => {
    navigate(`/podcast/task/${taskId}`);
  };
  
  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderContentUpload();
      case 2:
        return renderResult();
      default:
        return renderBasicInfo();
    }
  };
  
  // 渲染步骤一：基本信息
  const renderBasicInfo = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          guestCount: 1,
          atmosphere: '轻松'
        }}
      >
        <Form.Item
          name="title"
          label="播客标题"
          rules={[{ required: true, message: '请输入播客标题' }]}
        >
          <Input placeholder="请输入播客标题" maxLength={100} />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="播客描述"
          rules={[{ required: true, message: '请输入播客描述' }]}
        >
          <TextArea
            placeholder="请输入播客描述"
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <Form.Item
          name="scene"
          label="播客场景/主题"
          rules={[{ required: true, message: '请输入播客场景/主题' }]}
        >
          <Input placeholder="例如：科技、教育、娱乐、商业等" maxLength={100} />
        </Form.Item>
        
        <Form.Item
          name="atmosphere"
          label="播客氛围"
          rules={[{ required: true, message: '请选择播客氛围' }]}
        >
          <Select placeholder="请选择播客氛围">
            <Option value="轻松">轻松</Option>
            <Option value="严肃">严肃</Option>
            <Option value="活跃">活跃</Option>
            <Option value="专业">专业</Option>
            <Option value="幽默">幽默</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="guestCount"
          label="嘉宾数量"
          rules={[{ required: true, message: '请选择嘉宾数量' }]}
        >
          <InputNumber min={0} max={3} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              下一步
            </Button>
            <Button onClick={goToList}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };
  
  // 渲染步骤二：内容上传
  const renderContentUpload = () => {
    return (
      <div>
        <Alert
          message="播客内容"
          description="请上传文档或输入文本作为播客的内容素材，AI将基于这些内容自动生成播客脚本并合成音频。"
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
        
        <Card title="上传文档" style={{ marginBottom: '24px' }}>
          <Upload
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            maxCount={1}
            onRemove={() => setFileList([])}
          >
            <Button icon={<UploadOutlined />} disabled={uploading}>
              选择文件
            </Button>
            <Text type="secondary" style={{ marginLeft: '12px' }}>
              支持TXT、PDF、Word格式，文件大小不超过10MB
            </Text>
          </Upload>
          
          <div style={{ marginTop: '16px' }}>
            <Button 
              type="primary" 
              onClick={uploadFile} 
              loading={uploading}
              disabled={fileList.length === 0}
            >
              上传文档
            </Button>
          </div>
        </Card>
        
        <Card title="输入文本" style={{ marginBottom: '24px' }}>
          <TextArea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="请输入文本内容，作为生成播客的素材"
            autoSize={{ minRows: 4, maxRows: 8 }}
            maxLength={10000}
            showCount
            style={{ marginBottom: '16px' }}
          />
          
          <Button 
            type="primary" 
            onClick={handleTextSubmit} 
            loading={loadingContent}
            disabled={!textContent.trim()}
          >
            提交文本
          </Button>
        </Card>
        
        <Card title="内容列表" style={{ marginBottom: '24px' }}>
          {contentList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text type="secondary">暂无内容，请上传文档或提交文本</Text>
            </div>
          ) : (
            <div>
              {contentList.map((content, index) => (
                <Card 
                  key={content.id} 
                  type="inner" 
                  title={
                    <Space>
                      {content.contentType === 1 ? (
                        <FileTextOutlined />
                      ) : (
                        <FileAddOutlined />
                      )}
                      <span>
                        {content.contentType === 1 ? '文本内容' : (content.sourceDocumentTitle || '文档内容')}
                      </span>
                    </Space>
                  }
                  extra={
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeleteContent(content.id)}
                    >
                      删除
                    </Button>
                  }
                  style={{ marginBottom: '12px' }}
                >
                  <Paragraph 
                    ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
                  >
                    {content.sourceContent || '加载中...'}
                  </Paragraph>
                </Card>
              ))}
            </div>
          )}
        </Card>
        
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Space size="large">
            <Button onClick={prevStep}>
              上一步
            </Button>
            <Button 
              type="primary" 
              onClick={startGenerate}
              disabled={contentList.length === 0}
            >
              开始生成播客
            </Button>
          </Space>
        </div>
      </div>
    );
  };
  
  // 渲染步骤三：生成结果
  const renderResult = () => {
    return (
      <Result
        status="success"
        title="播客生成任务已成功提交！"
        subTitle="系统正在为您生成播客内容，请稍后查看结果。"
        extra={[
          <Button 
            type="primary" 
            key="detail" 
            onClick={viewTaskDetail}
          >
            查看详情
          </Button>,
          <Button 
            key="list" 
            onClick={goToList}
          >
            返回列表
          </Button>,
        ]}
      />
    );
  };
  
  return (
    <Card title="创建播客">
      <Steps
        current={currentStep}
        style={{ marginBottom: '24px' }}
        items={[
          {
            title: '基本信息',
            description: '设置播客信息'
          },
          {
            title: '内容管理',
            description: '上传或输入内容'
          },
          {
            title: '生成结果',
            description: '生成播客'
          }
        ]}
      />
      
      {renderStepContent()}
    </Card>
  );
};

export default CreatePodcastPage;