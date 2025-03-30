import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Tabs,
  Typography,
  Space,
  Input,
  Row,
  Col,
  Divider,
  message,
  Spin,
  Breadcrumb,
  Empty,
  Modal,
  Tag,
  Tooltip,
  Collapse,
  List,
  Select,
  Radio,
  Descriptions,
  Table
} from 'antd';
import {
  SendOutlined,
  DatabaseOutlined,
  CodeOutlined,
  RobotOutlined,
  UserOutlined,
  LeftOutlined,
  ReloadOutlined,
  FormOutlined,
  CopyOutlined,
  EditOutlined,
  InfoCircleOutlined,
  TableOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  CodeSandboxOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import databaseDesignAPI from '../../api/databaseDesignAPI';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Option } = Select;

/**
 * 数据库设计任务详情组件
 */
const DatabaseDesignTaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('chat');
  const [taskInfo, setTaskInfo] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codeTemplates, setCodeTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedCode, setGeneratedCode] = useState([]);
  const [codeLoading, setCodeLoading] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState({
    databases: [],
    languages: []
  });
  const [selectedLanguage, setSelectedLanguage] = useState(1);
  const [selectedDatabase, setSelectedDatabase] = useState(1);
  const [ddlScript, setDdlScript] = useState('');
  const [ddlLoading, setDdlLoading] = useState(false);
  
  // 初始化数据
  useEffect(() => {
    if (taskId) {
      Promise.all([
        fetchTaskDetail(),
        fetchChatHistory(),
        fetchTableList(),
        fetchSupportedLanguages()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [taskId]);
  
  // 滚动聊天到底部
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);
  
  // 当切换到代码tab时，加载代码模板
  useEffect(() => {
    if (activeTab === 'code' && codeTemplates.length === 0) {
      fetchCodeTemplates();
    }
  }, [activeTab]);
  
  // 获取任务详情
  const fetchTaskDetail = async () => {
    try {
      const response = await databaseDesignAPI.getTaskDetail(taskId);
      
      if (response.code === 200) {
        setTaskInfo(response.data);
      } else {
        message.error(response.message || '获取任务详情失败');
      }
    } catch (error) {
      console.error('获取任务详情失败:', error);
      message.error('获取任务详情失败');
    }
  };
  
  // 获取聊天历史
  const fetchChatHistory = async () => {
    try {
      const response = await databaseDesignAPI.getChatHistory(taskId);
      
      if (response.code === 200) {
        setChatHistory(response.data || []);
      } else {
        message.error(response.message || '获取聊天历史失败');
      }
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      message.error('获取聊天历史失败');
    }
  };
  
  // 获取表列表
  const fetchTableList = async () => {
    try {
      const response = await databaseDesignAPI.getTableList(taskId);
      
      if (response.code === 200) {
        setTableList(response.data || []);
      } else {
        message.error(response.message || '获取表列表失败');
      }
    } catch (error) {
      console.error('获取表列表失败:', error);
      message.error('获取表列表失败');
    }
  };
  
  // 获取特定表的详情
  const fetchTableDetail = async (tableId) => {
    try {
      const response = await databaseDesignAPI.getTableDetail(tableId);
      
      if (response.code === 200) {
        setCurrentTable(response.data);
      } else {
        message.error(response.message || '获取表详情失败');
      }
    } catch (error) {
      console.error('获取表详情失败:', error);
      message.error('获取表详情失败');
    }
  };
  
  // 获取支持的语言和数据库
  const fetchSupportedLanguages = async () => {
    try {
      const response = await databaseDesignAPI.getSupportedLanguages();
      
      if (response.code === 200) {
        setSupportedLanguages(response.data);
      } else {
        message.error(response.message || '获取支持的语言失败');
      }
    } catch (error) {
      console.error('获取支持的语言失败:', error);
      message.error('获取支持的语言失败');
    }
  };
  
  // 获取代码模板列表
  const fetchCodeTemplates = async () => {
    try {
      const response = await databaseDesignAPI.getCodeTemplateList();
      
      if (response.code === 200) {
        setCodeTemplates(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedTemplate(response.data[0].id);
        }
      } else {
        message.error(response.message || '获取代码模板失败');
      }
    } catch (error) {
      console.error('获取代码模板失败:', error);
      message.error('获取代码模板失败');
    }
  };
  
  // 生成DDL脚本
  const generateDDLScript = async () => {
    try {
      setDdlLoading(true);
      const response = await databaseDesignAPI.generateDDL({
        TaskId: taskId,
        TableId: 0, // 0代表所有表
        DatabaseType: selectedDatabase
      });
      
      if (response.code === 200) {
        setDdlScript(response.data.script);
      } else {
        message.error(response.message || '生成DDL脚本失败');
      }
    } catch (error) {
      console.error('生成DDL脚本失败:', error);
      message.error('生成DDL脚本失败');
    } finally {
      setDdlLoading(false);
    }
  };
  
  // 生成代码
  const generateCode = async (tableId) => {
    if (!selectedTemplate) {
      message.error('请先选择代码模板');
      return;
    }
    
    try {
      setCodeLoading(true);
      const response = await databaseDesignAPI.generateCode({
        TemplateId: selectedTemplate,
        TableId: tableId
      });
      
      if (response.code === 200) {
        setGeneratedCode(response.data.files || []);
        message.success('代码生成成功');
      } else {
        message.error(response.message || '生成代码失败');
      }
    } catch (error) {
      console.error('生成代码失败:', error);
      message.error('生成代码失败');
    } finally {
      setCodeLoading(false);
    }
  };
  
  // 发送用户消息
  const sendUserMessage = async () => {
    if (!userInput.trim()) {
      return;
    }
    
    const userMessage = userInput.trim();
    setUserInput('');
    setSending(true);
    
    try {
      // 添加用户消息到聊天记录
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: 2, // 用户
        content: userMessage,
        createDate: new Date().toISOString()
      }]);
      
      let aiResponseContent = '';
      let tempAiMessage = {
        id: Date.now() + 1,
        role: 1, // AI
        content: '',
        createDate: new Date().toISOString()
      };
      
      // 添加一个空的AI消息占位
      setChatHistory(prev => [...prev, tempAiMessage]);
      
      // 调用POST流式请求
      const response = await databaseDesignAPI.sendChatMessage({
        TaskId: taskId,
        Message: userMessage
      });
      
      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // 解码数据
        const chunk = decoder.decode(value, { stream: true });
        
        // 处理SSE格式
        const events = chunk.split('\n\n').filter(line => line.trim());
        
        for (const eventText of events) {
          const eventMatch = eventText.match(/event: (\w+)/);
          const dataMatch = eventText.match(/data: (.*)/);
          
          if (!eventMatch || !dataMatch) continue;
          
          const eventType = eventMatch[1];
          const data = dataMatch[1];
          
          switch (eventType) {
            case 'start':
              // 开始流式响应
              break;
              
            case 'chunk':
              // 更新AI消息内容
              aiResponseContent += data;
              tempAiMessage.content = aiResponseContent;
              
              setChatHistory(prev => {
                const newHistory = [...prev];
                const aiMessageIndex = newHistory.findIndex(msg => msg.id === tempAiMessage.id);
                if (aiMessageIndex !== -1) {
                  newHistory[aiMessageIndex] = {...tempAiMessage};
                }
                return newHistory;
              });
              break;
              
            case 'done':
              // 生成完成，可能包含额外数据
              try {
                const resultData = JSON.parse(data);
                if (resultData) {
                  // 可以处理额外的数据
                }
              } catch (e) {
                console.error('解析结果数据失败:', e);
              }
              setSending(false);
              fetchTableList(); // 刷新表列表
              break;
              
            case 'error':
              // 生成出错
              message.error(data || '生成失败');
              setSending(false);
              break;
              
            case 'end':
              // 流式响应结束
              setSending(false);
              break;
              
            default:
              break;
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败');
      setSending(false);
    }
  };
  
  // 复制文本到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('已复制到剪贴板');
      },
      () => {
        message.error('复制失败');
      }
    );
  };
  
  // 渲染聊天消息
  const renderChatMessage = (message) => {
    const isAI = message.role === 1;
    
    return (
      <div
        key={message.id}
        style={{
          display: 'flex',
          marginBottom: '16px',
          flexDirection: isAI ? 'row' : 'row-reverse'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isAI ? 'flex-start' : 'flex-end',
            maxWidth: '70%'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isAI ? '#1890ff' : '#52c41a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: '8px',
                color: 'white'
              }}
            >
              {isAI ? <RobotOutlined /> : <UserOutlined />}
            </div>
            <Text strong>{isAI ? 'AI助手' : '你'}</Text>
          </div>
          <div
            style={{
              background: isAI ? '#f5f5f5' : '#e6f7ff',
              padding: '12px 16px',
              borderRadius: '8px',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <Paragraph
              style={{ whiteSpace: 'pre-wrap', margin: 0 }}
            >
              {message.content}
            </Paragraph>
            {isAI && (
              <Button
                type="text"
                icon={<CopyOutlined />}
                size="small"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  opacity: 0.7
                }}
                onClick={() => copyToClipboard(message.content)}
              />
            )}
          </div>
          <Text type="secondary" style={{ marginTop: '4px', fontSize: '12px' }}>
            {formatDate(message.createDate)}
          </Text>
        </div>
      </div>
    );
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 渲染表结构信息
  const renderTableStructure = () => {
    if (!tableList || tableList.length === 0) {
      return (
        <Empty
          description="暂无表结构数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <p>通过与AI对话，描述您的数据库需求，生成表结构设计</p>
          <Button type="primary" onClick={() => setActiveTab('chat')}>
            开始对话
          </Button>
        </Empty>
      );
    }
    
    return (
      <Row gutter={16}>
        <Col span={8}>
          <Card title="表列表" style={{ marginBottom: '16px' }}>
            <List
              size="small"
              dataSource={tableList}
              renderItem={table => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      onClick={() => fetchTableDetail(table.id)}
                    >
                      详情
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<TableOutlined />}
                    title={table.tableName}
                    description={
                      <Space>
                        <Text type="secondary">{table.comment}</Text>
                        <Tag>{table.businessGroup}</Tag>
                        <Tag color="blue">字段数: {table.fieldCount}</Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
          
          <Card title="生成DDL脚本" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>数据库类型</Text>
                <Select 
                  style={{ width: '100%', marginTop: '8px' }}
                  value={selectedDatabase}
                  onChange={value => setSelectedDatabase(value)}
                >
                  {supportedLanguages.databases.map(db => (
                    <Option key={db.value} value={db.value}>
                      {db.code}
                    </Option>
                  ))}
                </Select>
              </div>
              
              <Button 
                type="primary" 
                icon={<CodeOutlined />} 
                onClick={generateDDLScript}
                loading={ddlLoading}
                style={{ marginTop: '8px' }}
              >
                生成DDL脚本
              </Button>
            </Space>
          </Card>
        </Col>
        
        <Col span={16}>
          {currentTable ? (
            <Card
              title={
                <Space>
                  <TableOutlined />
                  <span>{currentTable.tableName}</span>
                  <Tag color="blue">{currentTable.comment}</Tag>
                </Space>
              }
              extra={
                <Button 
                  type="primary"
                  icon={<CodeOutlined />}
                  onClick={() => {
                    setActiveTab('code');
                    generateCode(currentTable.id);
                  }}
                >
                  生成代码
                </Button>
              }
            >
              <Descriptions bordered column={1} size="small" style={{ marginBottom: '16px' }}>
                <Descriptions.Item label="表名">{currentTable.tableName}</Descriptions.Item>
                <Descriptions.Item label="注释">{currentTable.comment}</Descriptions.Item>
                <Descriptions.Item label="业务分组">{currentTable.businessGroup}</Descriptions.Item>
                <Descriptions.Item label="业务描述">{currentTable.businessDescription}</Descriptions.Item>
              </Descriptions>
              
              <Divider orientation="left">字段列表</Divider>
              <Table
                dataSource={currentTable.fields}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  {
                    title: '字段名',
                    dataIndex: 'fieldName',
                    key: 'fieldName',
                    width: 150
                  },
                  {
                    title: '注释',
                    dataIndex: 'comment',
                    key: 'comment',
                    ellipsis: true
                  },
                  {
                    title: '数据类型',
                    dataIndex: 'dataType',
                    key: 'dataType',
                    width: 120
                  },
                  {
                    title: '长度/精度',
                    key: 'length',
                    width: 100,
                    render: (_, record) => (
                      <>
                        {record.length && <div>长度: {record.length}</div>}
                        {record.precision && <div>精度: {record.precision}</div>}
                        {record.scale && <div>小数: {record.scale}</div>}
                      </>
                    )
                  },
                  {
                    title: '属性',
                    key: 'attributes',
                    width: 120,
                    render: (_, record) => (
                      <Space direction="vertical" size={0}>
                        {record.isPrimaryKey && <Tag color="red">主键</Tag>}
                        {!record.isNullable && <Tag color="orange">非空</Tag>}
                        {record.isAutoIncrement && <Tag color="green">自增</Tag>}
                      </Space>
                    )
                  }
                ]}
              />
              
              {currentTable.indexes && currentTable.indexes.length > 0 && (
                <>
                  <Divider orientation="left">索引列表</Divider>
                  <Table
                    dataSource={currentTable.indexes}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      {
                        title: '索引名',
                        dataIndex: 'indexName',
                        key: 'indexName',
                        width: 150
                      },
                      {
                        title: '类型',
                        dataIndex: 'indexType',
                        key: 'indexType',
                        width: 100,
                        render: (text) => {
                          const typeMap = {
                            'PRIMARY': '主键',
                            'UNIQUE': '唯一',
                            'NORMAL': '普通'
                          };
                          return typeMap[text] || text;
                        }
                      },
                      {
                        title: '描述',
                        dataIndex: 'description',
                        key: 'description',
                        ellipsis: true
                      },
                      {
                        title: '包含字段',
                        key: 'fields',
                        render: (_, record) => (
                          <Space>
                            {record.fields.map(field => (
                              <Tag key={field.fieldName}>
                                {field.fieldName} {field.sortDirection === 'DESC' ? '↓' : '↑'}
                              </Tag>
                            ))}
                          </Space>
                        )
                      }
                    ]}
                  />
                </>
              )}
              
              {(currentTable.parentRelations && currentTable.parentRelations.length > 0) || 
               (currentTable.childRelations && currentTable.childRelations.length > 0) ? (
                <>
                  <Divider orientation="left">表关系</Divider>
                  {currentTable.parentRelations && currentTable.parentRelations.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <Title level={5}>父表关系</Title>
                      <List
                        size="small"
                        dataSource={currentTable.parentRelations}
                        renderItem={relation => (
                          <List.Item>
                            <Space>
                              <Text>{relation.parentTableName}</Text>
                              <ArrowRightOutlined />
                              <Text>{relation.childTableName}</Text>
                              <Tag color="blue">{relation.relationType}</Tag>
                              <Text type="secondary">{relation.description}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                  
                  {currentTable.childRelations && currentTable.childRelations.length > 0 && (
                    <div>
                      <Title level={5}>子表关系</Title>
                      <List
                        size="small"
                        dataSource={currentTable.childRelations}
                        renderItem={relation => (
                          <List.Item>
                            <Space>
                              <Text>{relation.parentTableName}</Text>
                              <ArrowRightOutlined />
                              <Text>{relation.childTableName}</Text>
                              <Tag color="blue">{relation.relationType}</Tag>
                              <Text type="secondary">{relation.description}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </>
              ) : null}
            </Card>
          ) : (
            <Card>
              <Empty
                description="请从左侧选择一个表查看详情"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
          
          {ddlScript && (
            <Card title="生成的DDL脚本" style={{ marginTop: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Button
                  icon={<CopyOutlined />}
                  style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                  onClick={() => copyToClipboard(ddlScript)}
                >
                  复制
                </Button>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '16px', 
                  borderRadius: '4px',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  {ddlScript}
                </pre>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    );
  };
  
  // 渲染代码生成选项
  const renderCodeGeneration = () => {
    return (
      <Row gutter={16}>
        <Col span={8}>
          <Card title="代码生成选项" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>选择表</Text>
                <Select 
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="请选择表"
                  onChange={tableId => {
                    generateCode(tableId);
                  }}
                >
                  {tableList.map(table => (
                    <Option key={table.id} value={table.id}>
                      {table.tableName} - {table.comment}
                    </Option>
                  ))}
                </Select>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <Text strong>选择代码模板</Text>
                <Select 
                  style={{ width: '100%', marginTop: '8px' }}
                  value={selectedTemplate}
                  onChange={setSelectedTemplate}
                  placeholder="请选择代码模板"
                >
                  {codeTemplates.map(template => (
                    <Option key={template.id} value={template.id}>
                      {template.templateName} 
                      {template.isSystem && <Tag color="blue" style={{ marginLeft: '8px' }}>系统</Tag>}
                    </Option>
                  ))}
                </Select>
              </div>
            </Space>
          </Card>
          
          <Card title="语言与数据库" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>编程语言</Text>
                <Radio.Group 
                  style={{ width: '100%', marginTop: '8px' }} 
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                >
                  {supportedLanguages.languages.map(lang => (
                    <Radio.Button value={lang.value} key={lang.value}>
                      {lang.code}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <Text strong>数据库类型</Text>
                <Radio.Group 
                  style={{ width: '100%', marginTop: '8px' }}
                  value={selectedDatabase}
                  onChange={e => setSelectedDatabase(e.target.value)}
                >
                  {supportedLanguages.databases.map(db => (
                    <Radio.Button value={db.value} key={db.value}>
                      {db.code}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col span={16}>
          {codeLoading ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin tip="正在生成代码..." />
              </div>
            </Card>
          ) : generatedCode.length > 0 ? (
            <Card title="生成的代码文件">
              <Collapse accordion>
                {generatedCode.map((file, index) => (
                  <Panel 
                    header={
                      <Space>
                        <FileTextOutlined />
                        <Text strong>{file.fileName}</Text>
                        <Text type="secondary">({file.name})</Text>
                      </Space>
                    } 
                    key={index}
                  >
                    <div style={{ position: 'relative' }}>
                      <Button
                        icon={<CopyOutlined />}
                        style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                        onClick={() => copyToClipboard(file.content)}
                      >
                        复制
                      </Button>
                      <pre style={{ 
                        background: '#f5f5f5', 
                        padding: '16px', 
                        borderRadius: '4px',
                        maxHeight: '400px',
                        overflow: 'auto'
                      }}>
                        {file.content}
                      </pre>
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          ) : (
            <Card>
              <Empty
                description="请选择表和代码模板，生成相应的代码"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
        </Col>
      </Row>
    );
  };
  
  // 返回上一页
  const goBack = () => {
    navigate('/database-design');
  };
  
  // 刷新数据
  const refreshData = () => {
    setLoading(true);
    Promise.all([
      fetchTaskDetail(),
      fetchChatHistory(),
      fetchTableList()
    ]).finally(() => {
      setLoading(false);
    });
  };
  
  if (loading && !taskInfo) {
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
          { title: <Link to="/database-design">数据库设计</Link> },
          { title: taskInfo?.taskName || '任务详情' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center">
            <Title level={4} style={{ margin: 0 }}>
              <DatabaseOutlined /> {taskInfo?.taskName || '数据库设计任务'}
            </Title>
            
            {taskInfo?.description && (
              <Tooltip title={taskInfo.description}>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            )}
          </Space>
          
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refreshData}
            >
              刷新
            </Button>
            <Button 
              icon={<LeftOutlined />} 
              onClick={goBack}
            >
              返回列表
            </Button>
          </Space>
        </div>
      </Card>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: 'chat',
            label: (
              <span>
                <RobotOutlined /> AI 对话设计
              </span>
            ),
            children: (
              <Card>
                <div
                  style={{
                    height: 'calc(70vh - 250px)',
                    overflowY: 'auto',
                    marginBottom: '16px',
                    padding: '16px',
                    background: '#fff',
                    borderRadius: '4px',
                    border: '1px solid #e8e8e8'
                  }}
                >
                  {chatHistory.length === 0 ? (
                    <Empty
                      description="暂无聊天记录"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <p>通过与AI助手对话，描述您的数据库需求</p>
                      <p>例如: "我需要设计一个用户管理系统，包括用户注册，登录，权限管理功能"</p>
                    </Empty>
                  ) : (
                    chatHistory.map(renderChatMessage)
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                <div style={{ display: 'flex' }}>
                  <TextArea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="描述您的数据库需求，例如：我需要设计一个用户管理系统，包括用户注册，登录，权限管理功能"
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    style={{ flex: 1, marginRight: '16px' }}
                    disabled={sending}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        sendUserMessage();
                      }
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={sendUserMessage}
                    loading={sending}
                    style={{ height: 'auto' }}
                  >
                    发送
                  </Button>
                </div>
              </Card>
            )
          },
          {
            key: 'tables',
            label: (
              <span>
                <DatabaseOutlined /> 表结构设计
              </span>
            ),
            children: renderTableStructure()
          },
          {
            key: 'code',
            label: (
              <span>
                <CodeOutlined /> 代码生成
              </span>
            ),
            children: renderCodeGeneration()
          }
        ]}
      />
    </div>
  );
};

export default DatabaseDesignTaskDetail;