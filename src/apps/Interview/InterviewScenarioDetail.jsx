import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tabs,
  Typography,
  Space,
  Row,
  Col,
  List,
  Tag,
  Empty,
  Spin,
  Breadcrumb,
  Upload,
  Input,
  Modal,
  Popconfirm,
  Descriptions,
  message,
  Tooltip,
  Divider
} from 'antd';
import {
  LeftOutlined,
  TeamOutlined,
  FileTextOutlined,
  UploadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  EditOutlined,
  InboxOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import interviewAPI from '../../api/interviewAPI';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;
const { confirm } = Modal;

/**
 * 面试场景详情页面组件
 */
const InterviewScenarioDetail = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [scenarioInfo, setScenarioInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [jobPositionId, setJobPositionId] = useState(null);
  const [questionsList, setQuestionsList] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [documentDetail, setDocumentDetail] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState(null);
  
  // 初始化加载
  useEffect(() => {
    if (scenarioId) {
      fetchScenarioDetail();
    }
  }, [scenarioId]);
  
  // 切换职位时加载题目
  useEffect(() => {
    if (jobPositionId && scenarioInfo?.status === 3) {
      fetchQuestionsList();
    }
  }, [jobPositionId]);
  
  // 获取场景详情
  const fetchScenarioDetail = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getScenarioDetail(scenarioId);
      
      if (response.code === 200) {
        setScenarioInfo(response.data);
        
        // 默认选择第一个职位
        if (response.data.jobPositions && response.data.jobPositions.length > 0) {
          setJobPositionId(response.data.jobPositions[0].id);
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
  const fetchQuestionsList = async () => {
    if (!jobPositionId) return;
    
    try {
      setQuestionsLoading(true);
      const response = await interviewAPI.getQuestionsList(scenarioId, jobPositionId);
      
      if (response.code === 200) {
        setQuestionsList(response.data.items || []);
      } else {
        message.error(response.message || '获取面试题目列表失败');
      }
    } catch (error) {
      console.error('获取面试题目列表失败:', error);
      message.error('获取面试题目列表失败');
    } finally {
      setQuestionsLoading(false);
    }
  };
  
  // 获取文档详情
  const fetchDocumentDetail = async (contentId) => {
    try {
      setDocumentLoading(true);
      setSelectedContentId(contentId);
      
      const response = await interviewAPI.getContentDetail(contentId);
      
      if (response.code === 200) {
        setDocumentDetail(response.data);
      } else {
        message.error(response.message || '获取文档详情失败');
      }
    } catch (error) {
      console.error('获取文档详情失败:', error);
      message.error('获取文档详情失败');
    } finally {
      setDocumentLoading(false);
    }
  };
  
  // 上传文件
  const handleFileUpload = async (file) => {
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('id', scenarioId);
      
      const response = await interviewAPI.uploadDocument(formData);
      
      if (response.code === 200) {
        message.success('文档上传成功');
        setUploadModalVisible(false);
        fetchScenarioDetail(); // 刷新场景数据
      } else {
        message.error(response.message || '文档上传失败');
      }
    } catch (error) {
      console.error('文档上传失败:', error);
      message.error('文档上传失败');
    } finally {
      setSubmitting(false);
    }
    
    return false; // 阻止默认上传行为
  };
  
  // 导入文本
  const handleTextImport = async () => {
    if (!textContent.trim()) {
      message.warning('请输入文本内容');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await interviewAPI.importText({
        Id: scenarioId,
        Text: textContent
      });
      
      if (response.code === 200) {
        message.success('文本导入成功');
        setTextModalVisible(false);
        setTextContent('');
        fetchScenarioDetail(); // 刷新场景数据
      } else {
        message.error(response.message || '文本导入失败');
      }
    } catch (error) {
      console.error('文本导入失败:', error);
      message.error('文本导入失败');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 删除内容
  const handleDeleteContent = async (contentId) => {
    try {
      const response = await interviewAPI.deleteContent(contentId);
      
      if (response.code === 200) {
        message.success('内容删除成功');
        
        // 如果删除的是当前查看的内容，则清空详情
        if (selectedContentId === contentId) {
          setDocumentDetail(null);
          setSelectedContentId(null);
        }
        
        fetchScenarioDetail(); // 刷新场景数据
      } else {
        message.error(response.message || '删除内容失败');
      }
    } catch (error) {
      console.error('删除内容失败:', error);
      message.error('删除内容失败');
    }
  };
  
  // 生成面试题目
  const handleGenerateQuestions = async () => {
    if (scenarioInfo?.contentItems.length === 0) {
      message.warning('请先上传文档或导入文本');
      return;
    }
    
    try {
      setGeneratingQuestions(true);
      
      const response = await interviewAPI.generateQuestions(scenarioId);
      
      if (response.code === 200) {
        message.success('面试题目生成任务已提交，请稍后刷新查看结果');
        
        // 延迟刷新数据
        setTimeout(() => {
          fetchScenarioDetail();
        }, 5000);
      } else {
        message.error(response.message || '提交面试题目生成任务失败');
      }
    } catch (error) {
      console.error('提交面试题目生成任务失败:', error);
      message.error('提交面试题目生成任务失败');
    } finally {
      setGeneratingQuestions(false);
    }
  };
  
  // 创建面试会话
  const handleCreateSession = () => {
    // 确保已选择职位
    if (!jobPositionId) {
      message.warning('请先选择面试职位');
      return;
    }
    
    navigate(`/interview/create-session/${scenarioId}/${jobPositionId}`);
  };
  
  // 刷新场景数据
  const handleRefresh = () => {
    fetchScenarioDetail();
    
    // 如果在题目标签页且有选中的职位，刷新题目
    if (activeTab === 'questions' && jobPositionId) {
      fetchQuestionsList();
    }
  };
  
  // 修改题目
  const handleEditQuestion = (question) => {
    Modal.confirm({
      title: '修改面试题',
      width: 800,
      content: (
        <div style={{ marginTop: '20px' }}>
          <Form layout="vertical">
            <Form.Item label="问题内容">
              <Input.TextArea 
                id="question-content"
                defaultValue={question.content}
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>
            <Form.Item label="参考答案">
              <Input.TextArea 
                id="question-answer"
                defaultValue={question.shortAnswer}
                autoSize={{ minRows: 4, maxRows: 8 }}
              />
            </Form.Item>
          </Form>
        </div>
      ),
      onOk: async () => {
        const content = document.getElementById('question-content').value;
        const answer = document.getElementById('question-answer').value;
        
        if (!content.trim()) {
          message.warning('问题内容不能为空');
          return Promise.reject();
        }
        
        try {
          const response = await interviewAPI.updateQuestion({
            QuestionId: question.id,
            Content: content,
            Answer: answer
          });
          
          if (response.code === 200) {
            message.success('面试题目修改成功');
            fetchQuestionsList();
          } else {
            message.error(response.message || '修改面试题目失败');
          }
        } catch (error) {
          console.error('修改面试题目失败:', error);
          message.error('修改面试题目失败');
          return Promise.reject();
        }
      }
    });
  };
  
  // 返回列表
  const goBack = () => {
    navigate('/interview');
  };
  
  // 渲染工具栏
  const renderToolbar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <Space>
        <Button 
          icon={<LeftOutlined />} 
          onClick={goBack}
        >
          返回列表
        </Button>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
        >
          刷新
        </Button>
      </Space>
      
      <Space>
        {scenarioInfo?.status === 3 ? (
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={handleCreateSession}
          >
            开始面试
          </Button>
        ) : scenarioInfo?.status === 0 ? (
          <Button 
            type="primary" 
            icon={<QuestionCircleOutlined />}
            onClick={handleGenerateQuestions}
            loading={generatingQuestions}
          >
            生成面试题目
          </Button>
        ) : null}
        
        <Button 
          icon={<UploadOutlined />}
          onClick={() => setUploadModalVisible(true)}
        >
          上传文档
        </Button>
        <Button 
          icon={<FileTextOutlined />}
          onClick={() => setTextModalVisible(true)}
        >
          导入文本
        </Button>
      </Space>
    </div>
  );
  
  // 渲染场景信息
  const renderScenarioInfo = () => (
    <Card>
      <Descriptions title="基本信息" bordered>
        <Descriptions.Item label="场景名称" span={3}>{scenarioInfo?.name}</Descriptions.Item>
        <Descriptions.Item label="场景描述" span={3}>{scenarioInfo?.description || '无'}</Descriptions.Item>
        <Descriptions.Item label="面试官">
          {scenarioInfo?.interviewerName} ({scenarioInfo?.interviewerGender === 1 ? '男' : '女'})
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          {renderStatusTag(scenarioInfo?.status)}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {formatDate(scenarioInfo?.createDate)}
        </Descriptions.Item>
        <Descriptions.Item label="职位信息" span={3}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {scenarioInfo?.jobPositions.map(position => (
              <Tag 
                color="blue" 
                key={position.id}
                style={{ padding: '4px 8px', fontSize: '14px' }}
              >
                {position.name} ({renderLevelText(position.level)})
              </Tag>
            ))}
          </div>
        </Descriptions.Item>
      </Descriptions>
      
      <Divider orientation="left">知识内容列表</Divider>
      
      {scenarioInfo?.contentItems.length > 0 ? (
        <List
          bordered
          dataSource={scenarioInfo.contentItems}
          renderItem={item => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => fetchDocumentDetail(item.id)}
                >
                  查看内容
                </Button>,
                <Popconfirm
                  title="确定要删除此内容吗？"
                  onConfirm={() => handleDeleteContent(item.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger>
                    删除
                  </Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={item.sourceDocumentTitle || '导入的文本'}
                description={
                  <Space>
                    <Tag color={item.contentType === 1 ? 'green' : 'blue'}>
                      {item.contentType === 1 ? '文本' : '文档'}
                    </Tag>
                    <Text type="secondary">上传时间: {formatDate(item.createDate)}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty 
          description="暂无知识内容" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Space>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
            >
              上传文档
            </Button>
            <Button 
              icon={<FileTextOutlined />}
              onClick={() => setTextModalVisible(true)}
            >
              导入文本
            </Button>
          </Space>
        </Empty>
      )}
      
      {documentDetail && (
        <div style={{ marginTop: '24px' }}>
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                {documentDetail.sourceDocumentTitle || '导入的文本'}
                <Tag color={documentDetail.contentType === 1 ? 'green' : 'blue'}>
                  {documentDetail.contentType === 1 ? '文本' : '文档'}
                </Tag>
              </Space>
            }
            loading={documentLoading}
          >
            <div style={{ 
              maxHeight: '500px', 
              overflow: 'auto',
              padding: '16px',
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap'
            }}>
              {documentDetail.sourceContent}
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
  
  // 渲染题目列表
  const renderQuestionsList = () => {
    if (!jobPositionId) {
      return (
        <Empty description="请先选择职位" />
      );
    }
    
    if (scenarioInfo?.status !== 3) {
      return (
        <Empty description="面试题目尚未生成，请先生成题目">
          <Button 
            type="primary" 
            icon={<QuestionCircleOutlined />}
            onClick={handleGenerateQuestions}
            loading={generatingQuestions}
            disabled={scenarioInfo?.status === 2} // 如果正在分析中，禁用按钮
          >
            生成面试题目
          </Button>
        </Empty>
      );
    }
    
    const selectedPosition = scenarioInfo?.jobPositions.find(position => position.id === jobPositionId);
    
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Text>选择职位:</Text>
            {scenarioInfo?.jobPositions.map(position => (
              <Button 
                key={position.id}
                type={position.id === jobPositionId ? 'primary' : 'default'}
                onClick={() => setJobPositionId(position.id)}
              >
                {position.name} ({renderLevelText(position.level)})
              </Button>
            ))}
          </Space>
        </div>
        
        <Spin spinning={questionsLoading}>
          {questionsList.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={questionsList}
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
                  extra={
                    <Button 
                      icon={<EditOutlined />}
                      onClick={() => handleEditQuestion(question)}
                    >
                      编辑
                    </Button>
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
            />
          ) : (
            <Empty description="暂无面试题目" />
          )}
        </Spin>
      </div>
    );
  };
  
  // 渲染面试会话列表
  const renderSessionsList = () => {
    // 这部分待实现，需要获取与此场景相关的面试会话
    return (
      <Empty 
        description="暂无面试会话记录" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />}
          onClick={handleCreateSession}
          disabled={scenarioInfo?.status !== 3}
        >
          开始新面试
        </Button>
      </Empty>
    );
  };
  
  // 渲染状态标签
  const renderStatusTag = (status) => {
    const statusMap = {
      0: { text: '初始化', color: 'default' },
      1: { text: '待处理', color: 'warning' },
      2: { text: '分析中', color: 'processing' },
      3: { text: '已就绪', color: 'success' },
      4: { text: '分析失败', color: 'error' }
    };
    
    const { text, color } = statusMap[status] || { text: '未知', color: 'default' };
    
    return <Tag color={color}>{text}</Tag>;
  };
  
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
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  if (loading && !scenarioInfo) {
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
          { title: scenarioInfo?.name || '场景详情' }
        ]} style={{ marginBottom: '16px' }} />
        
        {renderToolbar()}
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          items={[
            {
              key: 'info',
              label: <span><FileTextOutlined /> 场景信息</span>,
              children: renderScenarioInfo()
            },
            {
              key: 'questions',
              label: <span><QuestionCircleOutlined /> 面试题目</span>,
              children: renderQuestionsList()
            },
            {
              key: 'sessions',
              label: <span><TeamOutlined /> 面试记录</span>,
              children: renderSessionsList()
            }
          ]}
        />
      </Card>
      
      {/* 上传文档对话框 */}
      <Modal
        title="上传文档"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Dragger
          name="file"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          disabled={submitting}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持的文件格式: .txt, .doc, .docx, .pdf 等
          </p>
        </Dragger>
        
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Button onClick={() => setUploadModalVisible(false)}>取消</Button>
          <Button
            type="primary"
            loading={submitting}
            style={{ marginLeft: '8px' }}
            disabled={true} // 使用beforeUpload处理上传，此按钮仅作为视觉占位
          >
            上传
          </Button>
        </div>
      </Modal>
      
      {/* 导入文本对话框 */}
      <Modal
        title="导入文本内容"
        open={textModalVisible}
        onCancel={() => setTextModalVisible(false)}
        onOk={handleTextImport}
        okText="导入"
        cancelText="取消"
        confirmLoading={submitting}
      >
        <TextArea
          placeholder="请输入文本内容"
          value={textContent}
          onChange={e => setTextContent(e.target.value)}
          rows={10}
        />
      </Modal>
    </div>
  );
};

export default InterviewScenarioDetail;