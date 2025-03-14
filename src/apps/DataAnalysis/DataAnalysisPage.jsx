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
  Divider,
  Select,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  Tag,
  Row,
  Col,
  Tabs
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
  DashboardOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import { useLocation, useNavigate } from 'react-router-dom';
import dtaAPI from '../../api/dtaAPI';

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * 数据分析助手 - 数据分析页面
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
  const [activeTab, setActiveTab] = useState('chat');
  const [fileColumns, setFileColumns] = useState([]);
  
  const [createSessionForm] = Form.useForm();
  const [saveToDashboardForm] = Form.useForm();
  const [createDashboardForm] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchFilesList();
    if (fileIdFromUrl) {
      fetchSessions(fileIdFromUrl);
      fetchFileDetails(fileIdFromUrl);
    }
  }, []);
  
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
        setFileColumns(response.data.columns || []);
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
        const files = response.data.items.filter(file => file.status === 2);
        setFilesList(files);
        
        // 如果没有从URL传入fileId，且有文件，选择第一个
        if (!fileIdFromUrl && files.length > 0) {
          setSelectedFileId(files[0].id);
          fetchSessions(files[0].id);
          fetchFileDetails(files[0].id);
        }
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
  
  // 获取会话列表
  const fetchSessions = async (fileId) => {
    if (!fileId) return;
    
    try {
      setLoading(true);
      const response = await dtaAPI.getChatSessionsList();
      
      if (response.code === 200) {
        // 过滤出与当前文件相关的会话
        const fileSessions = response.data.items?.filter(
          session => session.fileId === parseInt(fileId)
        ) || [];
        
        setSessions(fileSessions);
        
        // 如果有会话，选择第一个并加载历史
        if (fileSessions.length > 0) {
          setSelectedSession(fileSessions[0]);
          fetchChatHistory(fileSessions[0].id);
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
        const history = response.data.conversations || [];
        const formattedMessages = [];
        
        history.forEach(conv => {
          // 用户消息
          formattedMessages.push({
            id: `user-${conv.id}`,
            role: 'user',
            content: conv.userMessage,
            timestamp: new Date(conv.createTime).toLocaleString()
          });
          
          // AI回复
          if (conv.aiMessage) {
            formattedMessages.push({
              id: `ai-${conv.id}`,
              role: 'assistant',
              content: conv.aiMessage,
              timestamp: new Date(conv.createTime).toLocaleString(),
              sqlExecutions: conv.sqlExecutions || [] // 包含SQL执行结果
            });
          }
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
  
  // 发送消息
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
          content: aiResponse.aiMessage || '对不起，我无法分析您的请求。',
          timestamp: new Date().toLocaleString(),
          sqlExecutions: aiResponse.sqlExecutions || []
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
        selectedFileId
      );
      
      if (response.code === 200) {
        message.success('创建会话成功');
        
        // 重新加载会话列表
        fetchSessions(selectedFileId);
        setCreateSessionModalVisible(false);
        createSessionForm.resetFields();
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
  
  // 处理文件选择变更
  const handleFileChange = (fileId) => {
    setSelectedFileId(fileId);
    setSelectedSession(null);
    setChatMessages([]);
    fetchSessions(fileId);
    fetchFileDetails(fileId);
    
    // 更新URL参数，但不刷新页面
    const newFileName = filesList.find(f => f.id === fileId)?.originalFileName || '';
    navigate(
      `/data-analysis/analysis?fileId=${fileId}&fileName=${encodeURIComponent(newFileName)}`,
      { replace: true }
    );
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
    
    const { dataJson, visualization, sqlStatement } = sqlExecution;
    
    // 如果没有数据，显示空状态
    if (!dataJson) {
      return (
        <Empty description="无数据可显示" />
      );
    }
    
    // 解析JSON数据
    let parsedData;
    try {
      parsedData = JSON.parse(dataJson);
    } catch (error) {
      console.error('解析数据失败:', error);
      return (
        <Empty description="数据解析失败" />
      );
    }
    
    // 如果有可视化配置，渲染图表
    if (visualization) {
      return (
        <div>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={() => refreshChartData(sqlExecution.id)}
              >
                刷新数据
              </Button>
              
              <Tooltip title="查看SQL">
                <Button
                  size="small"
                  icon={<QuestionCircleOutlined />}
                  onClick={() => message.info(`SQL: ${sqlStatement}`)}
                >
                  查看SQL
                </Button>
              </Tooltip>
            </Space>
            
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={() => openSaveToDashboardModal(sqlExecution)}
            >
              保存到仪表板
            </Button>
          </div>
          
          {/* 渲染HTML可视化（使用iFrame保证安全） */}
          <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
            <iframe
              srcDoc={visualization}
              style={{ width: '100%', height: '400px', border: 'none' }}
              title="Visualization"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      );
    }
    
    // 如果没有可视化，显示表格数据
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      // 构建表格列
      const firstRow = parsedData[0];
      const columns = Object.keys(firstRow).map(key => ({
        title: key,
        dataIndex: key,
        key,
        render: (text) => {
          if (text === null || text === undefined) return '-';
          return text.toString();
        }
      }));
      
      return (
        <div>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={() => refreshChartData(sqlExecution.id)}
              >
                刷新数据
              </Button>
              
              <Tooltip title="查看SQL">
                <Button
                  size="small"
                  icon={<QuestionCircleOutlined />}
                  onClick={() => message.info(`SQL: ${sqlStatement}`)}
                >
                  查看SQL
                </Button>
              </Tooltip>
            </Space>
          </div>
          
          <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th 
                      key={col.key} 
                      style={{ 
                        padding: '8px', 
                        borderBottom: '1px solid #f0f0f0',
                        background: '#fafafa',
                        position: 'sticky',
                        top: 0
                      }}
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map(col => (
                      <td 
                        key={`${rowIndex}-${col.key}`} 
                        style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}
                      >
                        {col.render(row[col.dataIndex])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    return (
      <Empty description="无数据可显示" />
    );
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
  
  // 渲染文件信息卡片
  const renderFileInfoCard = () => {
    if (!selectedFile) return null;
    
    return (
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Avatar size={40} icon={<FileExcelOutlined />} style={{ backgroundColor: '#52c41a' }} />
            <div>
              <Title level={5} style={{ margin: 0 }}>{selectedFile.originalFileName}</Title>
              <div>
                <Tag color="success">{selectedFile.rowCount} 行数据</Tag>
                <Tag color="blue">{selectedFile.columns?.length || 0} 列</Tag>
              </div>
            </div>
          </Space>
          
          <Space>
            <Button 
              icon={<DatabaseOutlined />}
              onClick={() => navigate(`/data-analysis/file/${selectedFileId}`)}
            >
              查看数据
            </Button>
          </Space>
        </div>
      </Card>
    );
  };
  
  // 渲染分析引导卡片
  const renderAnalysisGuide = () => {
    if (!selectedFile || !fileColumns || fileColumns.length === 0) return null;
    
    // 将列按类型分组
    const numericColumns = fileColumns.filter(col => 
      col.dataType === 'integer' || col.dataType === 'decimal' || col.dataType === 'number'
    );
    
    const textColumns = fileColumns.filter(col => 
      col.dataType === 'string' || col.dataType === 'text'
    );
    
    const dateColumns = fileColumns.filter(col => 
      col.dataType === 'datetime' || col.dataType === 'date'
    );
    
    const promptTemplates = [
      { 
        title: "数据概述", 
        icon: <DatabaseOutlined />,
        prompt: `分析这份数据的基本情况，包括总体数量、关键字段的分布等，给出数据概述。` 
      },
      { 
        title: "趋势分析", 
        icon: <LineChartOutlined />,
        prompt: numericColumns.length > 0 && dateColumns.length > 0 ? 
          `分析${dateColumns[0].originalName}上${numericColumns[0].originalName}的变化趋势，并用线图可视化。` : 
          `分析数据中的时间趋势，选择合适的指标进行可视化。`
      },
      { 
        title: "分组对比", 
        icon: <BarChartOutlined />,
        prompt: numericColumns.length > 0 && textColumns.length > 0 ? 
          `按${textColumns[0].originalName}分组，对比各组的${numericColumns[0].originalName}，用柱状图展示。` : 
          `将数据按合适的分类字段分组，比较各组的数值差异。`
      },
      { 
        title: "占比分析", 
        icon: <PieChartOutlined />,
        prompt: textColumns.length > 0 ? 
          `分析${textColumns[0].originalName}的占比分布，用饼图展示。` : 
          `分析数据中某个分类字段的分布占比情况。`
      }
    ];
    
    return (
      <Card title="分析引导" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          {promptTemplates.map((template, index) => (
            <Col span={12} key={index}>
              <Card
                hoverable
                size="small"
                onClick={() => {
                  if (selectedSession) {
                    setInputValue(template.prompt);
                  } else {
                    message.info('请先创建或选择一个分析会话');
                    setCreateSessionModalVisible(true);
                  }
                }}
              >
                <Space>
                  {template.icon}
                  <Text strong>{template.title}</Text>
                </Space>
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}
                >
                  {template.prompt}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
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
        initialValues={{ sessionName: `${fileNameFromUrl || '数据'} 分析会话` }}
      >
        <Form.Item
          name="sessionName"
          label="会话名称"
          rules={[{ required: true, message: '请输入会话名称' }]}
        >
          <Input placeholder="请输入会话名称" />
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
        
        {/* SQL执行结果和可视化 */}
        {isAI && message.sqlExecutions && message.sqlExecutions.length > 0 && (
          <div style={{ marginTop: '12px', marginLeft: '40px', width: 'calc(100% - 40px)' }}>
            {message.sqlExecutions.map((sqlExecution, index) => (
              <Card 
                key={`sql-${index}`}
                style={{ marginBottom: '12px' }}
                title={
                  <Space>
                    {sqlExecution.visualization ? (
                      <BarChartOutlined style={{ color: '#1890ff' }} />
                    ) : (
                      <TableOutlined style={{ color: '#52c41a' }} />
                    )}
                    <span>
                      {sqlExecution.visualization ? '数据可视化' : '查询结果'}
                    </span>
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
  
  // 渲染主界面内容
  const renderMainContent = () => {
    if (!selectedFileId) {
      return (
        <Card>
          <Empty 
            description="请选择一个数据文件开始分析" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }
    
    return (
      <Layout style={{ background: '#fff' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: '16px' }}
        >
          <TabPane 
            tab={<span><MessageOutlined />智能对话</span>} 
            key="chat"
          >
            {renderFileInfoCard()}
            {renderAnalysisGuide()}
            
            <Layout style={{ background: '#fff', borderRadius: '8px', border: '1px solid #f0f0f0', height: 'calc(100vh - 350px)' }}>
              <Sider
                width={250}
                theme="light"
                style={{ 
                  background: '#fafafa', 
                  borderRight: '1px solid #f0f0f0',
                  height: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
                  分析会话
                </div>
                
                <div style={{ flex: 1, overflow: 'auto' }}>
                  {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                      <Spin size="small" />
                      <div style={{ marginTop: '8px' }}>加载中...</div>
                    </div>
                  ) : sessions.length === 0 ? (
                    <Empty 
                      description="暂无分析会话" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ margin: '24px 0' }}
                    />
                  ) : (
                    <List
                      dataSource={sessions}
                      renderItem={session => (
                        <List.Item
                          style={{ 
                            cursor: 'pointer',
                            padding: '12px 16px',
                            backgroundColor: selectedSession?.id === session.id ? '#e6f7ff' : 'transparent',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onClick={() => handleSessionChange(session)}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<MessageOutlined />} size="small" style={{ backgroundColor: selectedSession?.id === session.id ? '#1890ff' : '#d9d9d9' }} />}
                            title={<Text style={{ fontSize: '14px' }}>{session.sessionName || '未命名会话'}</Text>}
                            description={<Text style={{ fontSize: '12px' }}>{new Date(session.createTime).toLocaleDateString()}</Text>}
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
                
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => setCreateSessionModalVisible(true)}
                  >
                    新建分析会话
                  </Button>
                </div>
              </Sider>
              
              <Content style={{ 
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative'
              }}>
                {!selectedSession ? (
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px 20px'
                  }}>
                    <DashboardOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <Title level={4} style={{ marginBottom: '8px' }}>开始数据分析对话</Title>
                    <Paragraph style={{ textAlign: 'center', maxWidth: '400px' }}>
                      创建一个分析会话，告诉AI你想了解什么数据洞察，它将帮你分析数据并生成可视化图表
                    </Paragraph>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      style={{ marginTop: '16px' }}
                      onClick={() => setCreateSessionModalVisible(true)}
                    >
                      创建分析会话
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* 聊天头部 */}
                    <div style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Text strong>{selectedSession.sessionName || '数据分析会话'}</Text>
                      <Space>
                        <Button
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => fetchChatHistory(selectedSession.id)}
                          loading={loadingHistory}
                        >
                          刷新
                        </Button>
                        <Button
                          size="small"
                          icon={<DashboardOutlined />}
                          onClick={() => navigate('/data-analysis/dashboards')}
                        >
                          我的仪表板
                        </Button>
                      </Space>
                    </div>
                    
                    {/* 聊天内容区 */}
                    <div
                      ref={chatContainerRef}
                      style={{
                        flex: 1,
                        padding: '16px',
                        overflowY: 'auto'
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
                        chatMessages.map(message => renderChatMessage(message))
                      )}
                    </div>
                    
                    {/* 输入区域 */}
                    <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
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
                  </>
                )}
              </Content>
            </Layout>
          </TabPane>
          
          <TabPane 
            tab={<span><DashboardOutlined />可视化面板</span>} 
            key="dashboards"
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <DashboardOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4}>可视化面板</Title>
              <Paragraph style={{ maxWidth: '500px', margin: '0 auto 20px' }}>
                创建和管理您的数据可视化面板，将分析结果保存为可视化图表组件。在这里您可以组织和查看所有保存的分析结果。
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/data-analysis/dashboards')}
              >
                前往可视化面板
              </Button>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><FileExcelOutlined />数据详情</span>} 
            key="data"
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FileExcelOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>数据详情</Title>
              <Paragraph style={{ maxWidth: '500px', margin: '0 auto 20px' }}>
                查看当前选择的数据文件详细信息，包括所有数据表、字段结构和数据预览。
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate(`/data-analysis/file/${selectedFileId}`)}
              >
                查看数据详情
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </Layout>
    );
  };
  
  return (
    <Layout style={{ background: '#fff' }}>
      <Content style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space align="center">
              <Text strong>选择数据文件:</Text>
              <Select
                style={{ width: 300 }}
                placeholder="请选择数据文件"
                value={selectedFileId}
                onChange={handleFileChange}
                loading={loading}
                disabled={loading}
              >
                {filesList.map(file => (
                  <Option key={file.id} value={file.id}>
                    <Space>
                      <FileExcelOutlined style={{ color: '#52c41a' }} />
                      {file.originalFileName}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Space>
            
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchFilesList}
                loading={loading}
              >
                刷新文件
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateSessionModalVisible(true)}
                disabled={!selectedFileId}
              >
                创建分析会话
              </Button>
            </Space>
          </div>
        </Card>
        
        {renderMainContent()}
      </Content>
      
      {/* 模态框 */}
      {renderCreateSessionModal()}
      {renderSaveToDashboardModal()}
      {renderCreateDashboardModal()}
    </Layout>
  );
};

export default DataAnalysisPage;