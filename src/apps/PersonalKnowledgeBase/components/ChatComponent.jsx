import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Button, 
  Empty, 
  List, 
  Avatar, 
  Typography, 
  message,
  Drawer,
  Space
} from 'antd';
import { 
  MessageOutlined, 
  PlusOutlined, 
  UserOutlined,
  RobotOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import pkbAPI from '../../../api/pkbAPI';

const { Sider } = Layout;
const { Text } = Typography;

/**
 * 智能对话组件
 * 
 * @param {Object} props
 * @param {boolean} props.visible - 组件是否可见
 * @param {function} props.onClose - 关闭回调函数
 * @param {string} props.documentId - 文档ID，可选，如果提供则创建与该文档相关的对话
 * @param {string} props.documentTitle - 文档标题，可选，用于创建会话名称
 * @param {boolean} props.useDrawer - 是否使用抽屉模式展示对话，默认false使用侧边栏
 * @param {string} props.width - 抽屉或侧边栏宽度，默认'40%'
 */
const ChatComponent = ({ 
  visible = true, 
  onClose, 
  documentId = null, 
  documentTitle = '', 
  useDrawer = false,
  width = '40%'
}) => {
  // 聊天状态
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const chatContainerRef = useRef(null);

  // 如果有文档ID和标题，自动创建相关对话
  useEffect(() => {
    if (visible) {
      fetchChatSessions();
    }
  }, [visible]);

  // 如果文档ID和标题改变，且组件可见，则创建新对话
  useEffect(() => {
    if (visible && documentId && documentTitle) {
      createChatSession(documentId, documentTitle);
    }
  }, [documentId, documentTitle, visible]);

  // 滚动到聊天底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // 获取聊天会话列表
  const fetchChatSessions = async () => {
    try {
      setInitialLoading(true);
      const response = await pkbAPI.getChatSessionsList();
      if (response.code === 200) {
        setChatSessions(response.data || []);
        // 如果有聊天会话，默认选择第一个
        if (response.data && response.data.length > 0) {
          setCurrentSession(response.data[0]);
          fetchChatHistory(response.data[0].id);
        } else {
          setInitialLoading(false);
        }
      }
    } catch (error) {
      message.error('获取聊天会话失败');
      console.error('获取聊天会话失败:', error);
      setInitialLoading(false);
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
    } finally {
      setInitialLoading(false);
    }
  };

  // 创建新聊天会话
  const createChatSession = async (docId = null, docTitle = '') => {
    try {
      let sessionName = '新对话';
      if (docTitle) {
        sessionName = `关于 ${docTitle} 的对话`;
      }
      
      const response = await pkbAPI.createChatSession(sessionName);
      
      if (response.code === 200) {
        const newSessionId = response.data;
        message.success('创建聊天会话成功');
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
          setInitialLoading(false);
        }
      }
    } catch (error) {
      message.error('创建聊天会话失败');
      console.error('创建聊天会话失败:', error);
      setInitialLoading(false);
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

  // 切换聊天会话
  const switchChatSession = (session) => {
    setCurrentSession(session);
    setChatMessages([]);
    fetchChatHistory(session.id);
  };

  // 聊天气泡角色定义
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

  // 渲染聊天内容
  const renderChatContent = () => {
    if (initialLoading) {
      return (
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Text>加载中...</Text>
        </div>
      );
    }
    
    if (chatSessions.length === 0) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '40px 0' 
        }}>
          <MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Text type="secondary" style={{ marginBottom: '16px' }}>暂无对话</Text>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => createChatSession(documentId, documentTitle)}
          >
            新建对话
          </Button>
        </div>
      );
    }

    return (
      <div style={{ 
        display: 'flex', 
        height: '100%', 
        flex: 1, 
        overflow: 'hidden' 
      }}>
        {/* 聊天会话列表 */}
        <div style={{ 
          width: '240px', 
          borderRight: '1px solid #e8e8e8', 
          padding: '10px', 
          overflowY: 'auto', 
          height: '100%', 
          background: '#fff' 
        }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            style={{ marginBottom: '10px', width: '100%' }}
            onClick={() => createChatSession(documentId, documentTitle)}
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
                  padding: '8px',
                  borderRadius: '4px',
                  marginBottom: '4px'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<MessageOutlined />} 
                      size="small" 
                      style={{ 
                        backgroundColor: currentSession && currentSession.id === session.id 
                          ? '#1890ff' 
                          : '#d9d9d9' 
                      }} 
                    />
                  }
                  title={
                    <div style={{ 
                      fontSize: '14px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {session.sessionName}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
        
        {/* 聊天内容区 */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '0 16px', 
          height: '100%', 
          overflow: 'hidden' 
        }}>
          {currentSession ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>{currentSession.name}</Text>
                {useDrawer && (
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    onClick={onClose}
                  />
                )}
              </div>
              
              {/* 聊天消息区 */}
              <div 
                ref={chatContainerRef}
                style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '16px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  marginBottom: '10px'
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
              
              {/* 聊天输入区 - 放置在底部 */}
              <div style={{ padding: '0 0 0 0', marginTop: 'auto' }}>
                <Sender
                  loading={chatLoading}
                  value={chatInput}
                  onChange={setChatInput}
                  onSubmit={sendChatMessage}
                  placeholder="输入问题，按回车发送..."
                  submitType="enter"
                />
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty description="请选择或创建一个对话会话" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // 根据模式渲染抽屉或侧边栏
  if (useDrawer) {
    return (
      <Drawer
        title="智能对话"
        placement="right"
        width={width}
        onClose={onClose}
        open={visible}
        bodyStyle={{ padding: 0, height: 'calc(100% - 55px)' }}
        headerStyle={{ padding: '16px 24px' }}
        extra={
          <Space>
            <Button onClick={onClose}>关闭</Button>
          </Space>
        }
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderChatContent()}
        </div>
      </Drawer>
    );
  }

  // 侧边栏模式
  return visible ? (
    <Sider 
      width={width} 
      style={{ 
        background: '#f5f7fa', 
        height: '100%', 
        overflowY: 'hidden', 
        borderLeft: '1px solid #e8e8e8' 
      }}
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #e8e8e8', 
          fontWeight: 'bold', 
          fontSize: '16px', 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center' 
        }}>
          <span>智能对话</span>
          {onClose && (
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose}
              size="small"
            />
          )}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100% - 45px)' }}>
          {renderChatContent()}
        </div>
      </div>
    </Sider>
  ) : null;
};

export default ChatComponent;