import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Button, 
  Input, 
  Card, 
  Tabs, 
  Typography, 
  Space, 
  Tag, 
  Alert,
  Divider,
  List,
  Flex,
  Upload,
  Modal,
  Form,
  Select,
  message,
  Empty,
  Spin
} from 'antd';
import { 
  FolderOutlined, 
  UploadOutlined, 
  LinkOutlined, 
  SearchOutlined, 
  FileTextOutlined, 
  MessageOutlined, 
  NodeIndexOutlined, 
  DeleteOutlined,
  PlusOutlined,
  HomeOutlined,
  UserOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Bubble, Sender } from '@ant-design/x';
import pkbAPI from '../../api/pkbAPI';

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const KnowledgeBase = () => {
  // 文档状态
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [documentDetail, setDocumentDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // 聊天状态
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const chatContainerRef = useRef(null);
  
  // 查询条件
  const [searchKeyword, setSearchKeyword] = useState('');

  // 初始化加载
  useEffect(() => {
    fetchDocuments();
    fetchChatSessions();
  }, []);

  // 滚动到聊天底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // 获取文档列表
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await pkbAPI.getDocumentsList();
      if (response.code === 200) {
        setDocuments(response.data || []);
      }
    } catch (error) {
      message.error('获取文档列表失败');
      console.error('获取文档列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取聊天会话列表
  const fetchChatSessions = async () => {
    try {
      const response = await pkbAPI.getChatSessionsList();
      if (response.code === 200) {
        setChatSessions(response.data || []);
        // 如果有聊天会话，默认选择第一个
        if (response.data && response.data.length > 0) {
          setCurrentSession(response.data[0]);
          fetchChatHistory(response.data[0].id);
        }
      }
    } catch (error) {
      message.error('获取聊天会话失败');
      console.error('获取聊天会话失败:', error);
    }
  };

  // 获取聊天历史
  const fetchChatHistory = async (sessionId, lastId = null) => {
    try {
      const response = await pkbAPI.getChatHistory(sessionId, 20, lastId);
      
      if (response.code === 200) {
        // 新记录在前，旧记录在后，需要倒序
        const messages = response.data.messages.reverse();
        setChatMessages(prevMessages => {
          // 若是加载更多（有lastId），则添加到已有消息前面
          if (lastId) {
            return [...messages, ...prevMessages];
          }
          return messages;
        });
      }
    } catch (error) {
      message.error('获取聊天历史失败');
      console.error('获取聊天历史失败:', error);
    }
  };

  // 创建新聊天会话
  const createChatSession = async () => {
    try {
      const response = await pkbAPI.createChatSession('新对话');
      
      if (response.code === 200) {
        const newSessionId = response.data;
        message.success('创建聊天会话成功');
        // 自动切换到聊天标签页
        setActiveTab('chat');
        // 更新当前会话并清空聊天记录
        setChatMessages([]);
        // 获取最新会话列表，选中新创建的会话
        const sessionRes = await pkbAPI.getChatSessionsList();
        if (sessionRes.code === 200) {
          const sessions = sessionRes.data || [];
          const newSession = sessions.find(s => s.id === newSessionId);
          if (newSession) {
            setCurrentSession(newSession);
          }
          setChatSessions(sessions);
        }
      }
    } catch (error) {
      message.error('创建聊天会话失败');
      console.error('创建聊天会话失败:', error);
    }
  };

  // 发送聊天消息（使用流式接口）
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !currentSession) return;
    
    // 添加用户消息到列表
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      createDate: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput(''); // 清空输入框
    setChatLoading(true);
    
    try {
      // 构造一个临时的AI消息占位
      const tempAiMessage = {
        id: `temp-${Date.now()}`,
        role: 'assistant',
        content: '',
        createDate: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, tempAiMessage]);
      
      // 使用流式接口
      const response = await pkbAPI.sendChatMessage(currentSession.id, chatInput);
      
      // 读取流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      
      // 更新临时消息内容的函数
      const updateTempMessage = (content) => {
        setChatMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].id.startsWith('temp-')) {
            newMessages[lastIndex] = { ...newMessages[lastIndex], content };
          }
          return newMessages;
        });
      };
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.includes('event: chunk')) {
            const dataLine = line.split('\n').find(l => l.startsWith('data: '));
            if (dataLine) {
              const data = dataLine.slice(6); // 去掉 'data: '
              result += data;
              updateTempMessage(result);
            }
          } else if (line.includes('event: done')) {
            // 替换临时消息为正式消息
            setChatMessages(prevMessages => {
              const newMessages = [...prevMessages];
              const lastMessage = { ...newMessages[newMessages.length - 1] };
              
              // 修改临时ID为正式ID
              lastMessage.id = `formal-${Date.now()}`;
              newMessages[newMessages.length - 1] = lastMessage;
              
              return newMessages;
            });
          } else if (line.includes('event: error')) {
            message.error('消息发送失败');
            // 移除临时消息
            setChatMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
          }
        }
      }
      
      // 完成后重新获取聊天历史以保持同步
      await fetchChatHistory(currentSession.id);
      
    } catch (error) {
      message.error('发送消息失败');
      console.error('发送消息失败:', error);
      // 移除临时消息
      setChatMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setChatLoading(false);
    }
  };

  // 上传文档
  const handleUpload = async (file) => {
    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      
      const response = await pkbAPI.uploadDocument(formData);
      
      if (response.code === 200) {
        message.success('文档上传成功');
        fetchDocuments(); // 刷新文档列表
      } else {
        message.error(response.message || '上传失败');
      }
    } catch (error) {
      message.error('文档上传失败');
      console.error('文档上传失败:', error);
    } finally {
      setUploadLoading(false);
    }
    
    return false;  // 阻止默认上传行为
  };

  // 删除文档
  const deleteDocument = async (documentId) => {
    try {
      const response = await pkbAPI.deleteDocument(documentId);
      
      if (response.code === 200) {
        message.success('文档删除成功');
        fetchDocuments(); // 刷新文档列表
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除文档失败');
      console.error('删除文档失败:', error);
    }
  };

  // 查看文档详情
  const viewDocumentDetail = async (documentId) => {
    try {
      setLoading(true);
      const response = await pkbAPI.getDocumentDetail(documentId);
      
      if (response.code === 200) {
        setDocumentDetail(response.data);
        setShowDetailModal(true);
      } else {
        message.error(response.message || '获取详情失败');
      }
    } catch (error) {
      message.error('获取文档详情失败');
      console.error('获取文档详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切换聊天会话
  const switchChatSession = (session) => {
    setCurrentSession(session);
    setChatMessages([]);
    fetchChatHistory(session.id);
  };

  // 搜索文档
  const searchDocuments = (keyword) => {
    setSearchKeyword(keyword);
    // 简单前端搜索，实际应该调用搜索API
    // 当前实现为前端过滤
  };

  // 过滤后的文档列表
  const filteredDocuments = searchKeyword
    ? documents.filter(doc => 
        doc.title.toLowerCase().includes(searchKeyword.toLowerCase()))
    : documents;

  // 上传组件属性配置
  const uploadProps = {
    name: 'file',
    showUploadList: false,
    beforeUpload: handleUpload,
    accept: '.txt,.pdf,.doc,.docx',
    disabled: uploadLoading
  };

  // 聊天气泡角色定义
  const chatRoles = {
    user: {
      placement: 'end',
      avatar: { icon: <UserOutlined />, style: { background: '#f0f0f0' } },
    },
    assistant: {
      placement: 'start',
      avatar: { icon: <MessageOutlined />, style: { background: '#1890ff', color: '#fff' } },
    },
  };

  // 根据文档类型返回图标
  const getDocumentIcon = (type, status) => {
    if (status === 'processing') {
      return <LoadingOutlined style={{ color: '#1890ff' }} />;
    }
    return <FileTextOutlined style={{ color: '#1890ff' }} />;
  };

  // 格式化文档状态显示
  const formatDocumentStatus = (status) => {
    if (status === 'processing') return <Tag color="processing">处理中</Tag>;
    if (status === 'failed') return <Tag color="error">处理失败</Tag>;
    return <Tag color="success">已完成</Tag>;
  };

  return (
    <Layout style={{ height: 'calc(100vh - 30px)'  }}>
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>个人知识库</Title>
        <Link to="/">
          <Button type="primary" icon={<HomeOutlined />}>
            返回首页
          </Button>
        </Link>
      </Header>
      <Layout>
        {/* 主内容区 */}
        <Content style={{ padding: '20px', borderRadius: '8px' }}>
          {/* 搜索栏 */}
          <Search
            placeholder="输入关键词进行搜索..."
            allowClear
            enterButton="搜索"
            size="large"
            onSearch={searchDocuments}
            style={{ marginBottom: '20px' }}
            prefix={<SearchOutlined />}
          />

          {/* 功能标签页 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={<span><FileTextOutlined />文档库</span>} key="documents">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>我的文档</Text>
                <Upload {...uploadProps}>
                  <Button 
                    type="primary" 
                    icon={<UploadOutlined />}
                    loading={uploadLoading}
                  >
                    上传文档
                  </Button>
                </Upload>
              </div>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                </div>
              ) : filteredDocuments.length === 0 ? (
                <Card style={{ borderStyle: 'dashed', background: '#fafafa' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                    <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <Text type="secondary" style={{ marginBottom: '16px' }}>暂无文档</Text>
                    <Upload {...uploadProps}>
                      <Button type="primary" icon={<UploadOutlined />}>
                        上传文档
                      </Button>
                    </Upload>
                  </div>
                </Card>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {filteredDocuments.map(doc => (
                    <Card 
                      key={doc.id} 
                      hoverable
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <Space>
                            {getDocumentIcon(doc.type, doc.status)}
                            <Text strong>{doc.title}</Text>
                            {formatDocumentStatus(doc.status)}
                          </Space>
                          <div style={{ marginTop: '8px' }}>
                            <Space>
                              <Text type="secondary">上传于 {new Date(doc.createDate).toLocaleDateString()}</Text>
                            </Space>
                          </div>
                        </div>
                        <Space>
                          <Button 
                            type="text" 
                            icon={<MessageOutlined />} 
                            onClick={() => {
                              createChatSession();
                              // 实际应该关联文档
                            }}
                          />
                          <Button 
                            type="text" 
                            icon={<NodeIndexOutlined />} 
                            onClick={() => viewDocumentDetail(doc.id)}
                            disabled={doc.status !== 'done'}
                          />
                          <Button 
                            type="text" 
                            danger
                            icon={<DeleteOutlined />} 
                            onClick={() => deleteDocument(doc.id)}
                          />
                        </Space>
                      </div>
                    </Card>
                  ))}
                </Space>
              )}
            </TabPane>
            <TabPane tab={<span><NodeIndexOutlined />知识图谱</span>} key="knowledge-graph">
              <Card style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#888' }}>
                  {documentDetail ? (
                    <div>
                      <Title level={4}>{documentDetail.title}</Title>
                      <Paragraph>{documentDetail.summary}</Paragraph>
                      {/* 这里应该渲染知识图谱，可以使用Echarts或其他图形库 */}
                    </div>
                  ) : (
                    <Empty description="请在文档库中选择一个文档查看知识图谱" />
                  )}
                </div>
              </Card>
            </TabPane>
            <TabPane tab={<span><MessageOutlined />智能对话</span>} key="chat">
              <Card style={{ height: 'calc(100vh - 220px)' }}>
                {chatSessions.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                    <MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <Text type="secondary" style={{ marginBottom: '16px' }}>暂无对话</Text>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={createChatSession}
                    >
                      新建对话
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', height: '100%' }}>
                    {/* 聊天会话列表 */}
                    <div style={{ width: '200px', borderRight: '1px solid #f0f0f0', padding: '10px', overflowY: 'auto' }}>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        style={{ marginBottom: '10px', width: '100%' }}
                        onClick={createChatSession}
                      >
                        新建对话
                      </Button>
                      <List
                        itemLayout="horizontal"
                        dataSource={chatSessions}
                        renderItem={session => (
                          <List.Item 
                            onClick={() => switchChatSession(session)}
                            style={{ 
                              cursor: 'pointer', 
                              backgroundColor: currentSession && currentSession.id === session.id ? '#f5f5f5' : 'transparent',
                              padding: '8px 12px',
                              borderRadius: '4px'
                            }}
                          >
                            <List.Item.Meta
                              avatar={<MessageOutlined />}
                              title={session.name}
                              description={new Date(session.updateDate).toLocaleDateString()}
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                    
                    {/* 聊天内容区 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px' }}>
                      {currentSession ? (
                        <>
                          <div style={{ marginBottom: '10px' }}>
                            <Text strong>{currentSession.name}</Text>
                          </div>
                          
                          {/* 聊天消息区 */}
                          <div 
                            ref={chatContainerRef}
                            style={{ 
                              flex: 1, 
                              overflowY: 'auto', 
                              padding: '10px',
                              backgroundColor: '#f9f9f9',
                              borderRadius: '8px'
                            }}
                          >
                            <Bubble.List
                              roles={chatRoles}
                              items={chatMessages.map(({ id, role, content }) => ({
                                key: id,
                                role: role === 'user' ? 'user' : 'assistant',
                                content,
                              }))}
                            />
                          </div>
                          
                          {/* 聊天输入区 */}
                          <div style={{ marginTop: '10px' }}>
                            <Sender
                              loading={chatLoading}
                              value={chatInput}
                              onChange={setChatInput}
                              onSend={sendChatMessage}
                              placeholder="输入问题，按回车发送..."
                            />
                          </div>
                        </>
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Empty description="请选择或创建一个对话会话" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </TabPane>
          </Tabs>
        </Content>
      </Layout>

      {/* 文档详情弹窗 */}
      <Modal
        title="文档详情"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={800}
      >
        {documentDetail ? (
          <div>
            <Title level={4}>{documentDetail.title}</Title>
            <Divider />
            <Title level={5}>文档摘要</Title>
            <Paragraph>{documentDetail.summary}</Paragraph>
            <Divider />
            <Title level={5}>知识图谱</Title>
            <div style={{ height: '300px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              {/* 这里应该渲染知识图谱，可以使用Echarts或其他图形库 */}
              <Empty description="知识图谱展示区" />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
            <div style={{ marginTop: '10px' }}>加载中...</div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default KnowledgeBase;