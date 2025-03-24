import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Avatar,
  Typography,
  Space,
  Divider,
  Upload,
  message,
  Tag,
  Spin,
  Empty,
  Alert,
  Badge
} from 'antd';
import {
  SendOutlined,
  PictureOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  PaperClipOutlined,
  LinkOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import webSocketService from '../../../utils/webSocketService';
import customerServiceAPI from '../../../api/customerServiceAPI';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * 智能客服聊天组件
 * @param {Object} props
 * @param {string} props.sessionId - 会话ID
 * @param {Function} props.onClose - 关闭聊天的回调
 */
const ChatComponent = ({ sessionId, onClose }) => {
  // 聊天状态
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    message: '正在连接...'
  });

  // 引用
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // 初始化
  useEffect(() => {
    if (sessionId) {
      initializeChat();
    }

    return () => {
      // 组件卸载时断开WebSocket
      handleDisconnect();
    };
  }, [sessionId]);

  // 处理WebSocket消息
  useEffect(() => {
    // 添加WebSocket消息监听
    webSocketService.onMessage(handleWebSocketMessage);
    webSocketService.onStatusChange(handleConnectionStatus);

    return () => {
      // 移除WebSocket消息监听
      webSocketService.removeMessageCallback(handleWebSocketMessage);
      webSocketService.removeStatusCallback(handleConnectionStatus);
    };
  }, []);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化聊天
  const initializeChat = async () => {
    try {
      setLoading(true);

      // 1. 加载历史消息
      await loadChatHistory();

      // 2. 连接WebSocket
      await connectWebSocket();

      // 3. 加入会话
      await joinChatSession();
    } catch (error) {
      console.error('初始化聊天失败:', error);
      message.error('初始化聊天失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载聊天历史
  const loadChatHistory = async () => {
    try {
      const response = await customerServiceAPI.getChatHistory(sessionId);
      
      if (response.code === 200) {
        const history = response.data.messages || [];
        setMessages(history);
        setSessionInfo(response.data);
      } else {
        message.error(response.message || '获取聊天历史失败');
      }
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      message.error('获取聊天历史失败');
    }
  };

  // 连接WebSocket
  const connectWebSocket = async () => {
    try {
      await webSocketService.connect();
    } catch (error) {
      console.error('连接WebSocket失败:', error);
      message.error('连接服务器失败，可能无法实时聊天');
    }
  };

  // 加入聊天会话
  const joinChatSession = async () => {
    try {
      if (!webSocketService.isConnected) {
        throw new Error('WebSocket未连接');
      }
      
      await webSocketService.joinSession(sessionId);
    } catch (error) {
      console.error('加入聊天会话失败:', error);

    }
  };

  // 处理WebSocket消息
  const handleWebSocketMessage = (data) => {
      console.log('收到WebSocket消息:', data);
  
      if (!data) return;
  
      switch (data.type) {
        case 'join_success':
          message.success('已成功加入聊天会话');
          break;
          
        case 'leave_success':
          message.info('已离开聊天会话');
          break;
          
        case 'message':
          handleNewMessage(data);
          break;
          
        case 'reply':
          // 处理新格式的回复消息
          if (data.data) {
            handleNewMessage({
              content: data.data.content,
              role: data.data.role === 'assistant' ? 1 : 2, // 1=assistant, 2=user
              intent: data.data.intent || '',
              callDatas: data.data.callDatas || '',
              id: data.data.messageId,
              createDate: data.data.timestamp
            });
          }
          break;
          
        case 'error':
          message.error(data.message || '发生错误');
          break;
          
        default:
          // 如果已经由webSocketService处理过格式转换，则尝试直接作为消息处理
          if (data.content && (data.role === 1 || data.role === 2)) {
            handleNewMessage(data);
          }
          break;
      }
    };

  // 处理新消息
  const handleNewMessage = (data) => {
    if (!data.content) return;

    const newMessage = {
      id: Date.now().toString(),
      sessionId: sessionId,
      role: data.role === 2 ? 2 : 1, // 1=assistant, 2=user
      content: data.content,
      intent: data.intent || '',
      callDatas: data.callDatas || '',
      imageUrl: data.imageUrl || '',
      createDate: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
  };

  // 处理连接状态变更
  const handleConnectionStatus = (status) => {
    setConnectionStatus(status);
  };

  // 滚动到底部
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // 发送文本消息
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!webSocketService.isConnected || !connectionStatus.connected) {
      message.error('未连接到服务器，请刷新页面重试');
      return;
    }

    const messageText = inputValue;
    setInputValue('');
    setSending(true);

    try {
      // 添加用户消息到界面
      const userMessage = {
        id: `temp-${Date.now()}`,
        sessionId: sessionId,
        role: 2, // user
        content: messageText,
        createDate: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);

      // 发送到WebSocket
      await webSocketService.sendMessage(messageText);
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败');
    } finally {
      setSending(false);
    }
  };

  // 处理图片上传之前
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过5MB!');
      return Upload.LIST_IGNORE;
    }

    // 手动上传
    uploadImage(file);
    return false;
  };

  // 上传图片
  const uploadImage = async (file) => {
    if (!webSocketService.isConnected || !connectionStatus.connected) {
      message.error('未连接到服务器，请刷新页面重试');
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('image', file);

      // 通过HTTP上传图片
      const response = await customerServiceAPI.sendImageMessage(formData);
      
      if (response.code === 200) {
        const imageUrl = response.data;
        
        // 添加图片消息到界面
        const imageMessage = {
          id: `temp-img-${Date.now()}`,
          sessionId: sessionId,
          role: 2, // user
          content: '[图片]',
          imageUrl: imageUrl,
          createDate: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, imageMessage]);

        // 通知WebSocket已上传图片
        await webSocketService.sendImageMessage(imageUrl);
      } else {
        throw new Error(response.message || '上传图片失败');
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      message.error('上传图片失败');
    } finally {
      setUploadingImage(false);
    }
  };

  // 触发文件选择
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 处理文件变更
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  // 处理断开连接
  const handleDisconnect = async () => {
    try {
      if (webSocketService.isConnected && webSocketService.sessionId) {
        await webSocketService.leaveSession();
      }
      webSocketService.disconnect();
    } catch (error) {
      console.error('断开连接失败:', error);
    }
  };

  // 渲染消息
  const renderMessage = (msg, index) => {
    const isAI = msg.role === 1; // 1=assistant, 2=user
    
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
          icon={isAI ? <CustomerServiceOutlined /> : <UserOutlined />}
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
          {/* 意图标签 */}
          {isAI && msg.intent && (
            <Tag 
              color="blue" 
              style={{ 
                position: 'absolute', 
                top: '-10px', 
                left: '8px',
                fontSize: '12px',
                padding: '0 6px'
              }}
            >
              {formatIntent(msg.intent)}
            </Tag>
          )}
          
          {/* 消息内容 */}
          <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {msg.content}
          </Paragraph>
          
          {/* 图片内容 */}
          {msg.imageUrl && (
            <div style={{ marginTop: '8px' }}>
              <img 
                src={msg.imageUrl} 
                alt="图片消息" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(msg.imageUrl, '_blank')}
              />
            </div>
          )}
          
          {/* 商品信息 */}
          {isAI && msg.callDatas && (
            <div 
              style={{ 
                marginTop: '8px', 
                padding: '8px', 
                background: '#fff', 
                borderRadius: '4px',
                border: '1px solid #e8e8e8'
              }}
            >
              <Space>
                <ShoppingOutlined style={{ color: '#722ed1' }} />
                <Text strong>商品信息</Text>
              </Space>
              <div style={{ marginTop: '8px' }}>
                {parseCallData(msg.callDatas)}
              </div>
            </div>
          )}
          
          {/* 消息时间 */}
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

  // 格式化意图
  const formatIntent = (intent) => {
    const intentMap = {
      'GREETING': '问候',
      'PRODUCT_INQUIRY': '商品咨询',
      'ORDER_INQUIRY': '订单咨询',
      'SHIPPING_POLICY': '物流政策',
      'RETURN_POLICY': '退换货政策',
      'GENERAL_QUERY': '一般咨询',
      'COMPLAINT': '投诉',
      'GRATITUDE': '感谢',
      'FAREWELL': '告别'
    };

    return intentMap[intent] || intent;
  };

  // 解析调用数据
  const parseCallData = (callDatas) => {
    if (!callDatas) return null;
    
    try {
      // 这里只是简单显示，实际可能需要根据数据结构调整
      return (
        <div>
          <Text>{callDatas}</Text>
        </div>
      );
    } catch (error) {
      console.error('解析调用数据失败:', error);
      return <Text type="danger">数据解析错误</Text>;
    }
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

  // 渲染连接状态
  const renderConnectionStatus = () => {
    const { connected, message } = connectionStatus;
    
    return (
      <div 
        style={{ 
          padding: '8px 16px', 
          background: connected ? '#f6ffed' : '#fff2e8',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Space>
          <Badge 
            status={connected ? 'success' : 'processing'} 
            text={
              <Text strong>{connected ? '已连接' : message}</Text>
            }
          />
        </Space>
        
        {!connected && (
          <Button 
            size="small" 
            onClick={connectWebSocket}
            loading={message.includes('重连')}
          >
            重新连接
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      bodyStyle={{ 
        padding: '0', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        flex: 1
      }}
    >
      {/* 聊天头部 */}
      <div 
        style={{ 
          padding: '16px', 
          borderBottom: '1px solid #e8e8e8',
          background: '#fff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <CustomerServiceOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
            <Text strong>
              {sessionInfo ? sessionInfo.sessionName : '智能客服对话'}
            </Text>
          </Space>
          
          {onClose && (
            <Button onClick={onClose}>
              关闭会话
            </Button>
          )}
        </div>
      </div>
      
      {/* 连接状态 */}
      {renderConnectionStatus()}
      
      {/* 聊天消息区域 */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          background: '#f5f5f5'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="加载聊天历史..." />
          </div>
        ) : messages.length === 0 ? (
          <Empty 
            description="暂无消息，开始对话吧" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          messages.map(renderMessage)
        )}
      </div>
      
      {/* 图片上传区域 - 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*"
      />
      
      {/* 输入区域 */}
      <div 
        style={{ 
          padding: '16px', 
          borderTop: '1px solid #e8e8e8',
          background: '#fff'
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <TextArea
            placeholder="输入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 4 }}
            disabled={!webSocketService.isConnected || sending}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Button
                icon={<PictureOutlined />}
                onClick={handleUploadClick}
                loading={uploadingImage}
                disabled={!webSocketService.isConnected}
              >
                发送图片
              </Button>
            </Space>
            
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              loading={sending}
              disabled={!inputValue.trim() || !webSocketService.isConnected}
            >
              发送
            </Button>
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default ChatComponent;