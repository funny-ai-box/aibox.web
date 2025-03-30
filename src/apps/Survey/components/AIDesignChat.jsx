import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Avatar,
  Divider,
  message,
  Spin,
  Empty,
  Alert
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  LoadingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import surveyAPI from '../../../api/surveyAPI';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

/**
 * AI设计聊天组件
 * @param {Object} props
 * @param {number} props.taskId - 问卷任务ID
 * @param {Function} props.onDesignComplete - 完成设计后的回调
 */
const AIDesignChat = ({ taskId, onDesignComplete }) => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [streamResponse, setStreamResponse] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // 初始化加载聊天历史
  useEffect(() => {
    if (taskId) {
      fetchChatHistory();
    }
  }, [taskId]);
  
  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, streamResponse]);
  
  // 获取聊天历史
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getDesignHistory(taskId);
      
      if (response.code === 200) {
        setChatHistory(response.data.items || []);
      } else {
        message.error(response.message || '获取聊天历史失败');
      }
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      message.error('获取聊天历史失败');
    } finally {
      setLoading(false);
      
      // 聊天历史加载完成后，聚焦到输入框
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    }
  };
  
  // 发送消息到AI
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setSending(true);
    setStreamResponse('');
    
    try {
      // 添加用户消息到界面
      const newMessage = {
        id: Date.now(),
        role: 2, // 用户
        content: userMessage,
        createDate: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, newMessage]);
      
      // 调用流式API
      await streamChatWithAI(userMessage);
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败');
    } finally {
      setSending(false);
    }
  };
  
  // 流式聊天请求
  const streamChatWithAI = async (userMessage) => {
    try {
      const response = await surveyAPI.aiDesignSurveyStream({
        TaskId: taskId,
        Message: userMessage
      });
      
      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let aiResponse = '';
      let completeJsonConfig = null;
      let isDone = false;
      
      while (!isDone) {
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
              // 更新流式响应内容
              aiResponse += data;
              setStreamResponse(aiResponse);
              break;
              
            case 'done':
              // 生成完成，解析完整结果
              try {
                const resultData = JSON.parse(data);
                if (resultData && resultData.completeJsonConfig) {
                  completeJsonConfig = resultData.completeJsonConfig;
                }
              } catch (e) {
                console.error('解析结果数据失败:', e);
              }
              isDone = true;
              break;
              
            case 'error':
              // 生成出错
              message.error(data || '生成失败');
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
      
      // 添加AI回复到聊天历史
      const aiMessage = {
        id: Date.now() + 1,
        role: 1, // AI
        content: aiResponse,
        completeJsonConfig,
        createDate: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      setStreamResponse('');
      
      // 如果完成了设计，触发回调
      if (completeJsonConfig && onDesignComplete) {
        message.success('问卷设计已完成');
        onDesignComplete();
      }
    } catch (error) {
      console.error('流式响应处理失败:', error);
      message.error('处理AI响应失败');
    }
  };
  
  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 渲染消息气泡
  const renderMessage = (msg, index) => {
    const isAI = msg.role === 1; // 1=AI, 2=用户
    
    return (
      <div
        key={msg.id || index}
        style={{
          marginBottom: '16px',
          display: 'flex',
          flexDirection: isAI ? 'row' : 'row-reverse',
          alignItems: 'flex-start'
        }}
      >
        <Avatar
          icon={isAI ? <RobotOutlined /> : <UserOutlined />}
          style={{
            backgroundColor: isAI ? '#1890ff' : '#87d068',
            marginRight: isAI ? '8px' : 0,
            marginLeft: isAI ? 0 : '8px'
          }}
        />
        
        <div
          style={{
            maxWidth: '70%',
            background: isAI ? '#f0f8ff' : '#f6ffed',
            padding: '12px 16px',
            borderRadius: '8px',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {msg.content}
          </Paragraph>
          
          {msg.completeJsonConfig && (
            <div style={{ marginTop: '8px' }}>
              <Alert
                message="设计已完成"
                description="AI已生成问卷配置，可以在问卷编辑标签页查看和修改"
                type="success"
                showIcon
              />
            </div>
          )}
          
          <div
            style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '4px',
              textAlign: isAI ? 'left' : 'right'
            }}
          >
            {formatTime(msg.createDate)}
          </div>
        </div>
      </div>
    );
  };
  
  // 格式化时间
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <Card style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px' }}>
        <Title level={5}>
          <RobotOutlined style={{ marginRight: '8px' }} />
          AI问卷设计助手
        </Title>
        <Text type="secondary">
          描述您的问卷需求，AI将帮您设计问卷内容和结构
        </Text>
      </div>
      
      <Divider style={{ margin: '8px 0' }} />
      
      {/* 聊天历史区域 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          marginBottom: '16px',
          background: '#f9f9f9',
          borderRadius: '4px'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="加载聊天历史..." />
          </div>
        ) : chatHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Empty
              description={
                <Text>
                  <InfoCircleOutlined style={{ marginRight: '8px' }} />
                  开始与AI对话，描述您的问卷需求
                </Text>
              }
            />
            <Paragraph style={{ marginTop: '16px' }}>
              示例: "我需要一份客户满意度调查，包含基本信息、服务评价和建议反馈三个部分"
            </Paragraph>
          </div>
        ) : (
          <>
            {chatHistory.map(renderMessage)}
            
            {/* 流式响应区域 */}
            {streamResponse && (
              <div
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start'
                }}
              >
                <Avatar
                  icon={<RobotOutlined />}
                  style={{
                    backgroundColor: '#1890ff',
                    marginRight: '8px'
                  }}
                />
                
                <div
                  style={{
                    maxWidth: '70%',
                    background: '#f0f8ff',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {streamResponse}
                  </Paragraph>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* 输入区域 */}
      <div>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入问卷需求描述，例如：我需要一份客户满意度调查..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            disabled={sending || loading}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            style={{ borderRadius: '4px 0 0 4px' }}
          />
          <Button
            type="primary"
            icon={sending ? <LoadingOutlined /> : <SendOutlined />}
            onClick={sendMessage}
            disabled={!inputValue.trim() || sending || loading}
            loading={sending}
            style={{ borderRadius: '0 4px 4px 0', height: 'auto' }}
          >
            发送
          </Button>
        </Space.Compact>
      </div>
    </Card>
  );
};

export default AIDesignChat;