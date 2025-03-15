import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Card,
  Button,
  Typography,
  Space,
  List,
  Avatar,
  Spin,
  Empty,
  Select,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  Tag,
  Row,
  Col,
  Divider,
  Table
} from 'antd';
import {
  MessageOutlined,
  UserOutlined,
  RobotOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  BarChartOutlined,
  FileExcelOutlined,
  TableOutlined,
  QuestionCircleOutlined,
  DeleteOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  SearchOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import { useLocation, useNavigate } from 'react-router-dom';
import SqlExecutionResultComponent from "./components/SqlExecutionResultComponent";
import { buildVisualization } from './utils/visualizationUtils';

import dtaAPI from '../../api/dtaAPI';

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * 数据分析助手 - 数据分析页面（类ChatGPT界面）
 * 用于创建分析会话，提问AI进行数据分析
 */
const DataAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  
  // 获取URL参数
  const queryParams = new URLSearchParams(location.search);
  const fileIdFromUrl = queryParams.get('fileId');
  const fileNameFromUrl = queryParams.get('fileName');
  
  // 状态
  const [loading, setLoading] = useState(true);
  const [filesList, setFilesList] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(fileIdFromUrl || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [createSessionModalVisible, setCreateSessionModalVisible] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [saveToDashboardModalVisible, setSaveToDashboardModalVisible] = useState(false);
  const [savingToDashboard, setSavingToDashboard] = useState(false);
  const [dashboardList, setDashboardList] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);
  const [createDashboardModalVisible, setCreateDashboardModalVisible] = useState(false);
  const [creatingDashboard, setCreatingDashboard] = useState(false);
  const [sessionSearchText, setSessionSearchText] = useState('');
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  
  const [createSessionForm] = Form.useForm();
  const [saveToDashboardForm] = Form.useForm();
  const [createDashboardForm] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchFilesList();
    fetchSessions();
  }, []);
  
  // 当URL中的文件ID变化时，加载文件详情
  useEffect(() => {
    if (fileIdFromUrl) {
      fetchFileDetails(fileIdFromUrl);
    }
  }, [fileIdFromUrl]);
  
  // 滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // 获取文件详情
  const fetchFileDetails = async (fileId) => {
    try {
      const response = await dtaAPI.getFileDetail(fileId);
      
      if (response.code === 200) {
        setSelectedFile(response.data);
      } else {
        message.error(response.message || '获取文件详情失败');
      }
    } catch (error) {
      message.error('获取文件详情失败');
      console.error('获取文件详情失败:', error);
    }
  };
  
  // 获取文件列表
  const fetchFilesList = async () => {
    try {
      setLoading(true);
      const response = await dtaAPI.getFilesList();
      
      if (response.code === 200) {
        // 只过滤出已处理完成的文件
        const files = response.data.items.filter(file => file.status === 2);
        setFilesList(files);
      } else {
        message.error(response.message || '获取文件列表失败');
      }
    } catch (error) {
      message.error('获取文件列表失败');
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取所有会话列表（不关联特定文件）
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await dtaAPI.getChatSessionsList();
      
      if (response.code === 200) {
        const allSessions = response.data.items || [];
        setSessions(allSessions);
        
        // 如果有会话，选择第一个并加载历史
        if (allSessions.length > 0) {
          // 如果URL中传递了文件ID，尝试找到关联该文件的第一个会话
          if (fileIdFromUrl) {
            const relatedSession = allSessions.find(
              session => session.fileId === parseInt(fileIdFromUrl)
            );
            
            if (relatedSession) {
              setSelectedSession(relatedSession);
              fetchChatHistory(relatedSession.id);
              return;
            }
          }
          
          // 否则选择第一个会话
          setSelectedSession(allSessions[0]);
          fetchChatHistory(allSessions[0].id);
        } else {
          setSelectedSession(null);
          setChatMessages([]);
        }
      } else {
        message.error(response.message || '获取会话列表失败');
      }
    } catch (error) {
      message.error('获取会话列表失败');
      console.error('获取会话列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取聊天历史
  const fetchChatHistory = async (sessionId) => {
    try {
      setLoadingHistory(true);
      const response = await dtaAPI.getChatHistory(sessionId);
      
      if (response.code === 200) {
        // 构建聊天消息格式
        const history = response.data.items || [];
        const formattedMessages = [];
        
        history.forEach(conv => {
          // 用户消息
          formattedMessages.push({
            id: `user-${conv.id}`,
            role: 'user',
            content: conv.userQuery,
            timestamp: new Date(conv.createTime).toLocaleString()
          });
          
          // AI回复
          if (conv.aiResponse) {
            formattedMessages.push({
              id: `ai-${conv.id}`,
              role: 'assistant',
              content: conv.aiResponse,
              timestamp: new Date(conv.createTime).toLocaleString(),
              sqlExecutions: conv.sqlExecutions || [] // 包含SQL执行结果
            });
          }
        });
        
        // 按时间顺序排列消息
        formattedMessages.sort((a, b) => {
          const timeA = new Date(a.timestamp);
          const timeB = new Date(b.timestamp);
          return timeA - timeB;
        });
        
        setChatMessages(formattedMessages);
      } else {
        message.error(response.message || '获取聊天历史失败');
      }
    } catch (error) {
      message.error('获取聊天历史失败');
      console.error('获取聊天历史失败:', error);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  // 发送消息 - 更新为非流式API
  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedSession) return;
    
    // 添加用户消息
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSendingMessage(true);
    
    try {
      // 发送请求到API
      const response = await dtaAPI.sendChatMessage(
        selectedSession.id,
        inputValue
      );
      
      if (response.code === 200) {
        // 构建AI回复消息
        const aiResponse = response.data;
        
        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiResponse.response || '对不起，我无法分析您的请求。',
          timestamp: new Date().toLocaleString(),
          sqlExecutions: aiResponse.sqlExecutions || [],
          conversationId: aiResponse.conversationId
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        message.error(response.message || '发送消息失败');
      }
    } catch (error) {
      message.error('发送消息失败');
      console.error('发送消息失败:', error);
    } finally {
      setSendingMessage(false);
    }
  };
  
  // 创建新会话
  const createNewSession = async () => {
    try {
      await createSessionForm.validateFields();
      const values = createSessionForm.getFieldsValue();
      
      setCreatingSession(true);
      const response = await dtaAPI.createChatSession(
        values.sessionName,
        values.fileId === 'none' ? null : values.fileId
      );
      
      if (response.code === 200) {
        message.success('创建会话成功');
        
        // 重新加载会话列表
        await fetchSessions();
        setCreateSessionModalVisible(false);
        createSessionForm.resetFields();
        
        // 选中新创建的会话
        const newSessionId = response.data;
        const updatedSessions = await dtaAPI.getChatSessionsList();
        
        if (updatedSessions.code === 200) {
          const newSession = updatedSessions.data.items.find(s => s.id === newSessionId);
          if (newSession) {
            setSelectedSession(newSession);
            setChatMessages([]);
          }
        }
      } else {
        message.error(response.message || '创建会话失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('创建会话失败');
      console.error('创建会话失败:', error);
    } finally {
      setCreatingSession(false);
    }
  };
  
  // 刷新图表数据
  const refreshChartData = async (sqlExecutionId) => {
    try {
      const response = await dtaAPI.refreshChartData(sqlExecutionId);
      
      if (response.code === 200) {
        message.success('数据已刷新');
        
        // 更新聊天消息中的相应SQL执行结果
        setChatMessages(prev => {
          const updated = [...prev];
          for (let i = 0; i < updated.length; i++) {
            if (updated[i].sqlExecutions) {
              const index = updated[i].sqlExecutions.findIndex(
                sql => sql.id === sqlExecutionId
              );
              
              if (index !== -1) {
                updated[i].sqlExecutions[index] = response.data;
                break;
              }
            }
          }
          return updated;
        });
      } else {
        message.error(response.message || '刷新数据失败');
      }
    } catch (error) {
      message.error('刷新数据失败');
      console.error('刷新数据失败:', error);
    }
  };
  
  // 保存到仪表板
  const openSaveToDashboardModal = (sqlExecution) => {
    setSelectedChart(sqlExecution);
    fetchDashboardsList();
    setSaveToDashboardModalVisible(true);
  };
  
  // 获取仪表板列表
  const fetchDashboardsList = async () => {
    try {
      const response = await dtaAPI.getBIPagesList();
      
      if (response.code === 200) {
        setDashboardList(response.data.items || []);
      } else {
        message.error(response.message || '获取仪表板列表失败');
      }
    } catch (error) {
      message.error('获取仪表板列表失败');
      console.error('获取仪表板列表失败:', error);
    }
  };
  
  // 创建新仪表板
  const createNewDashboard = async () => {
    try {
      await createDashboardForm.validateFields();
      const values = createDashboardForm.getFieldsValue();
      
      setCreatingDashboard(true);
      const response = await dtaAPI.createBIPage(
        values.dashboardName,
        values.description,
        false // 默认非公开
      );
      
      if (response.code === 200) {
        message.success('创建仪表板成功');
        
        // 重新加载仪表板列表
        fetchDashboardsList();
        setCreateDashboardModalVisible(false);
        createDashboardForm.resetFields();
      } else {
        message.error(response.message || '创建仪表板失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('创建仪表板失败');
      console.error('创建仪表板失败:', error);
    } finally {
      setCreatingDashboard(false);
    }
  };
  
  // 保存图表到仪表板
  const saveChartToDashboard = async () => {
    try {
      await saveToDashboardForm.validateFields();
      const values = saveToDashboardForm.getFieldsValue();
      
      if (!selectedChart) {
        message.error('未选择图表');
        return;
      }
      
      setSavingToDashboard(true);
      const response = await dtaAPI.addSqlDataToPage(
        values.dashboardId,
        selectedChart.id,
        values.title,
        values.description
      );
      
      if (response.code === 200) {
        message.success('保存到仪表板成功');
        setSaveToDashboardModalVisible(false);
        saveToDashboardForm.resetFields();
      } else {
        message.error(response.message || '保存到仪表板失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('保存到仪表板失败');
      console.error('保存到仪表板失败:', error);
    } finally {
      setSavingToDashboard(false);
    }
  };

  // 删除会话
  const deleteSession = async (sessionId) => {
    try {
      // API 尚未提供删除方法，此处为预留
      message.info('删除会话功能暂未实现');
      // 如果API支持，可以使用以下代码
      // const response = await dtaAPI.deleteChatSession(sessionId);
      // if (response.code === 200) {
      //   message.success('删除会话成功');
      //   fetchSessions();
      //   if (selectedSession && selectedSession.id === sessionId) {
      //     setSelectedSession(null);
      //     setChatMessages([]);
      //   }
      // } else {
      //   message.error(response.message || '删除会话失败');
      // }
    } catch (error) {
      message.error('删除会话失败');
      console.error('删除会话失败:', error);
    }
  };
  
  // 处理会话选择变更
  const handleSessionChange = (session) => {
    setSelectedSession(session);
    setChatMessages([]);
    fetchChatHistory(session.id);
  };
  
  // 渲染SQL执行结果
  const renderSqlExecutionResult = (sqlExecution) => {
    if (!sqlExecution) return null;
    
    return (
      <SqlExecutionResultComponent 
        sqlExecution={sqlExecution}
        onRefresh={refreshChartData}
        onSave={openSaveToDashboardModal}
        refreshing={false} // 这里您可能需要添加一个状态来追踪每个SQL执行的刷新状态
      />
    );
  };
  // 过滤会话列表
  const filteredSessions = sessions.filter(session => {
    if (!sessionSearchText) return true;
    return session.sessionName.toLowerCase().includes(sessionSearchText.toLowerCase());
  });
  
  // 获取会话关联的文件名称
  const getSessionFileName = (session) => {
    if (!session.fileId) return null;
    const file = filesList.find(f => f.id === session.fileId);
    return file ? file.originalFileName : null;
  };
  
  // 聊天角色定义
  const chatRoles = {
    user: {
      placement: 'end',
      avatar: { icon: <UserOutlined />, style: { background: '#f0f0f0' } },
    },
    assistant: {
      placement: 'start',
      avatar: { icon: <RobotOutlined />, style: { background: '#1890ff', color: '#fff' } },
    },
  };
  
  // 渲染分析引导卡片
  const renderAnalysisGuide = () => {
    const promptTemplates = [
      { 
        title: "数据概述", 
        icon: <DatabaseOutlined />,
        prompt: `分析我的数据的基本情况，包括总体数量、关键字段的分布等，给出数据概述。` 
      },
      { 
        title: "趋势分析", 
        icon: <LineChartOutlined />,
        prompt: `分析数据中的时间趋势，选择合适的指标进行可视化。`
      },
      { 
        title: "分组对比", 
        icon: <BarChartOutlined />,
        prompt: `将数据按合适的分类字段分组，比较各组的数值差异，用柱状图展示。`
      },
      { 
        title: "占比分析", 
        icon: <PieChartOutlined />,
        prompt: `分析数据中某个分类字段的分布占比情况，用饼图展示。`
      }
    ];
    
    return (
      <div style={{ padding: '20px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>
          数据分析助手
        </Title>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Paragraph style={{ fontSize: '16px' }}>
            欢迎使用数据分析助手，您可以通过对话式交互分析您的Excel数据，
            获取洞察并自动生成可视化图表。
          </Paragraph>
        </div>
        
        <Divider>分析引导</Divider>
        
        <Row gutter={[16, 16]}>
          {promptTemplates.map((template, index) => (
            <Col span={12} key={index}>
              <Card
                hoverable
                style={{ height: '100%', cursor: 'pointer' }}
                onClick={() => {
                  if (selectedSession) {
                    setInputValue(template.prompt);
                  } else {
                    setCreateSessionModalVisible(true);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ 
                    marginRight: '12px',
                    fontSize: '24px',
                    color: '#1890ff' 
                  }}>
                    {template.icon}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                      {template.title}
                    </Text>
                    <Paragraph style={{ color: '#666' }}>
                      {template.prompt}
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        
        <Divider>或者</Divider>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />}
            onClick={() => setCreateSessionModalVisible(true)}
          >
            创建新的分析会话
          </Button>
        </div>
      </div>
    );
  };
  
  // 创建会话模态框
  const renderCreateSessionModal = () => (
    <Modal
      title="创建新分析会话"
      open={createSessionModalVisible}
      onCancel={() => setCreateSessionModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setCreateSessionModalVisible(false)}>
          取消
        </Button>,
        <Button
          key="create"
          type="primary"
          loading={creatingSession}
          onClick={createNewSession}
        >
          创建
        </Button>
      ]}
    >
      <Form
        form={createSessionForm}
        layout="vertical"
        initialValues={{ 
          sessionName: fileNameFromUrl ? `${fileNameFromUrl} 分析会话` : '新建分析会话',
          fileId: fileIdFromUrl || 'none'
        }}
      >
        <Form.Item
          name="sessionName"
          label="会话名称"
          rules={[{ required: true, message: '请输入会话名称' }]}
        >
          <Input placeholder="请输入会话名称" />
        </Form.Item>
        
        <Form.Item
          name="fileId"
          label="关联数据文件"
          help="可以选择一个数据文件进行分析，或者不关联文件进行通用分析"
        >
          <Select placeholder="选择关联的数据文件">
            <Option value="none">不关联文件</Option>
            {filesList.map(file => (
              <Option key={file.id} value={file.id}>
                <Space>
                  <FileExcelOutlined style={{ color: '#52c41a' }} />
                  {file.originalFileName}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  // 保存到仪表板模态框
  const renderSaveToDashboardModal = () => (
    <Modal
      title="保存到仪表板"
      open={saveToDashboardModalVisible}
      onCancel={() => setSaveToDashboardModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setSaveToDashboardModalVisible(false)}>
          取消
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={savingToDashboard}
          onClick={saveChartToDashboard}
        >
          保存
        </Button>
      ]}
    >
      <Form
        form={saveToDashboardForm}
        layout="vertical"
      >
        <Form.Item
          name="dashboardId"
          label="选择仪表板"
          rules={[{ required: true, message: '请选择仪表板' }]}
          extra={
            <Button 
              type="link" 
              onClick={() => setCreateDashboardModalVisible(true)}
              style={{ padding: 0 }}
            >
              创建新仪表板
            </Button>
          }
        >
          <Select placeholder="请选择仪表板">
            {dashboardList.map(dashboard => (
              <Option key={dashboard.id} value={dashboard.id}>
                {dashboard.pageName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="title"
          label="图表标题"
          rules={[{ required: true, message: '请输入图表标题' }]}
        >
          <Input placeholder="请输入图表标题" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="图表描述"
        >
          <Input.TextArea placeholder="请输入图表描述（可选）" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
  
  // 创建仪表板模态框
  const renderCreateDashboardModal = () => (
    <Modal
      title="创建新仪表板"
      open={createDashboardModalVisible}
      onCancel={() => setCreateDashboardModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setCreateDashboardModalVisible(false)}>
          取消
        </Button>,
        <Button
          key="create"
          type="primary"
          loading={creatingDashboard}
          onClick={createNewDashboard}
        >
          创建
        </Button>
      ]}
    >
      <Form
        form={createDashboardForm}
        layout="vertical"
      >
        <Form.Item
          name="dashboardName"
          label="仪表板名称"
          rules={[{ required: true, message: '请输入仪表板名称' }]}
        >
          <Input placeholder="请输入仪表板名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="仪表板描述"
        >
          <Input.TextArea placeholder="请输入仪表板描述（可选）" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
  
  // 渲染聊天消息
  const renderChatMessage = (message) => {
    const isAI = message.role === 'assistant';
    
    return (
      <div 
        key={message.id} 
        style={{ 
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isAI ? 'flex-start' : 'flex-end'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          flexDirection: isAI ? 'row' : 'row-reverse'
        }}>
          <Avatar
            icon={isAI ? <RobotOutlined /> : <UserOutlined />}
            style={{
              backgroundColor: isAI ? '#1890ff' : '#f0f0f0',
              color: isAI ? '#fff' : '#666',
              marginRight: isAI ? '8px' : 0,
              marginLeft: isAI ? 0 : '8px'
            }}
          />
          
          <div
            style={{
              background: isAI ? '#f0f8ff' : '#f6ffed',
              padding: '12px 16px',
              borderRadius: '8px',
              maxWidth: '80%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <Paragraph
              style={{ margin: 0, whiteSpace: 'pre-wrap' }}
            >
              {message.content}
            </Paragraph>
            
            <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {message.timestamp}
            </Text>
          </div>
        </div>
        
        {/* SQL执行结果和可视化 - 使用新组件 */}
        {isAI && message.sqlExecutions && message.sqlExecutions.length > 0 && (
          <div style={{ marginTop: '12px', marginLeft: '40px', width: 'calc(100% - 40px)' }}>
            {message.sqlExecutions.map((sqlExecution, index) => (
              <Card 
                key={`sql-${index}`}
                style={{ marginBottom: '12px' }}
                title={
                  <Space>
                    {(() => {
                      // 获取可视化配置以确定图表类型
                      const { type } = buildVisualization(sqlExecution);
                      
                      // 根据图表类型显示对应图标
                      switch(type) {
                        case 'line': return <LineChartOutlined style={{ color: '#1890ff' }} />;
                        case 'bar': return <BarChartOutlined style={{ color: '#1890ff' }} />;
                        case 'pie': return <PieChartOutlined style={{ color: '#1890ff' }} />;
                        case 'scatter': return <DotChartOutlined style={{ color: '#1890ff' }} />;
                        case 'table':
                        default: return <TableOutlined style={{ color: '#52c41a' }} />;
                      }
                    })()}
                    <span>{sqlExecution.title || '查询结果'}</span>
                  </Space>
                }
                size="small"
              >
                {renderSqlExecutionResult(sqlExecution)}
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };
  // 渲染会话区域
  const renderChatArea = () => {
    if (!selectedSession) {
      return renderAnalysisGuide();
    }
    
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* 会话头部信息 */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Text strong style={{ fontSize: '16px', marginRight: '8px' }}>
              {selectedSession.sessionName || '数据分析会话'}
            </Text>
            {selectedSession.fileId && (
              <Tag color="blue" icon={<FileExcelOutlined />}>
                {getSessionFileName(selectedSession) || `文件ID: ${selectedSession.fileId}`}
              </Tag>
            )}
          </div>
          
          <Space>
            <Tooltip title="刷新会话">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => fetchChatHistory(selectedSession.id)}
                loading={loadingHistory}
              />
            </Tooltip>
            <Tooltip title="可视化面板">
              <Button
                size="small"
                icon={<BarChartOutlined />}
                onClick={() => navigate('/data-analysis/dashboards')}
              />
            </Tooltip>
          </Space>
        </div>
        
        {/* 聊天内容区 */}
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            padding: '16px 20px',
            overflowY: 'auto',
            background: '#f9f9f9'
          }}
        >
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin />
              <div style={{ marginTop: '16px' }}>加载聊天历史...</div>
            </div>
          ) : chatMessages.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Empty 
                description={
                  <div>
                    <p>暂无聊天记录，开始提问吧</p>
                    <p style={{ fontSize: '13px', color: '#999' }}>
                      例如：分析销售数据的趋势、按地区对比销售量、计算各产品销售占比...
                    </p>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <>
              {chatMessages.map(message => renderChatMessage(message))}
            </>
          )}
        </div>
        
        {/* 输入区域 */}
        <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <Sender
            loading={sendingMessage}
            value={inputValue}
            onChange={setInputValue}
            onSubmit={sendMessage}
            placeholder="输入分析请求，例如：分析销售数据的趋势..."
            submitText="发送"
            submitType="button"
          />
        </div>
      </div>
    );
  };
  
  // 渲染主界面
  return (
    <Layout style={{ height: 'calc(100vh - 148px)', background: '#fff' }}>
      {/* 左侧会话列表 */}
      <Sider
        width={260}
        theme="light"
        style={{ 
          borderRight: '1px solid #f0f0f0',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        collapsible
        collapsed={siderCollapsed}
        onCollapse={setSiderCollapsed}
        trigger={null}
      >
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {!siderCollapsed && (
            <>
              <Text strong>我的分析会话</Text>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => setCreateSessionModalVisible(true)}
              >
                新建
              </Button>
            </>
          )}
          {siderCollapsed && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => setCreateSessionModalVisible(true)}
              style={{ margin: '0 auto' }}
            />
          )}
        </div>
        
        {!siderCollapsed && (
          <div style={{ padding: '0 16px 16px' }}>
            <Input
              placeholder="搜索会话"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              value={sessionSearchText}
              onChange={e => setSessionSearchText(e.target.value)}
            />
          </div>
        )}
        
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin size="small" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <Empty 
              description={!siderCollapsed && "暂无会话"} 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: '20px 0' }}
            />
          ) : (
            <List
              dataSource={filteredSessions}
              renderItem={session => (
                <List.Item
                  style={{ 
                    cursor: 'pointer',
                    padding: siderCollapsed ? '16px 8px' : '12px 16px',
                    backgroundColor: selectedSession?.id === session.id ? '#e6f7ff' : 'transparent',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onClick={() => handleSessionChange(session)}
                >
                  {siderCollapsed ? (
                    <Avatar icon={<MessageOutlined />} size="small" style={{ 
                      backgroundColor: selectedSession?.id === session.id ? '#1890ff' : '#d9d9d9',
                      margin: '0 auto'
                    }} />
                  ) : (
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<MessageOutlined />} 
                          size="small" 
                          style={{ backgroundColor: selectedSession?.id === session.id ? '#1890ff' : '#d9d9d9' }} 
                        />
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text ellipsis style={{ maxWidth: '160px' }}>
                            {session.sessionName || '未命名会话'}
                          </Text>
                          <Tooltip title="删除会话">
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                              }}
                              style={{ opacity: 0.6, marginLeft: 'auto' }}
                            />
                          </Tooltip>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {new Date(session.createTime).toLocaleDateString()}
                          </div>
                          {session.fileId && (
                            <div style={{ fontSize: '12px', color: '#1890ff', display: 'flex', alignItems: 'center' }}>
                              <FileExcelOutlined style={{ marginRight: '4px' }} />
                              <Text ellipsis style={{ maxWidth: '140px' }}>
                                {getSessionFileName(session) || `文件ID: ${session.fileId}`}
                              </Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  )}
                </List.Item>
              )}
            />
          )}
        </div>
      </Sider>
      
      {/* 右侧聊天区域 */}
      <Content style={{ height: '100%', overflow: 'hidden' }}>
        {renderChatArea()}
      </Content>
      
      {/* 模态框 */}
      {renderCreateSessionModal()}
      {renderSaveToDashboardModal()}
      {renderCreateDashboardModal()}
    </Layout>
  );
};

export default DataAnalysisPage;