import React, { useState, useEffect } from 'react';
import { 
  Card,
  Button,
  Typography,
  Space,
  Spin,
  Empty,
  Result,
  Modal,
  message,
  Breadcrumb 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CustomerServiceOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import customerServiceAPI from '../../api/customerServiceAPI';
import ChatComponent from './components/ChatComponent';

const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * 智能客服聊天页面
 */
const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [error, setError] = useState(null);
  
  // 初始化加载
  useEffect(() => {
    if (sessionId) {
      fetchSessionInfo();
    }
  }, [sessionId]);
  
  // 获取会话信息
  const fetchSessionInfo = async () => {
    try {
      setLoading(true);
      const response = await customerServiceAPI.getChatHistory(sessionId);
      
      if (response.code === 200) {
        setSessionInfo(response.data);
      } else {
        setError(response.message || '获取会话信息失败');
        message.error(response.message || '获取会话信息失败');
      }
    } catch (error) {
      console.error('获取会话信息失败:', error);
      setError('获取会话信息失败，请检查网络连接');
      message.error('获取会话信息失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 结束会话确认
  const confirmEndSession = () => {
    confirm({
      title: '确认结束会话',
      icon: <ExclamationCircleOutlined />,
      content: '结束会话后，您将无法继续在当前会话中聊天。确定要结束会话吗？',
      okText: '确认结束',
      cancelText: '取消',
      onOk() {
        endSession();
      }
    });
  };
  
  // 结束会话
  const endSession = async () => {
    // 在实际实现中，这里应该调用结束会话的API
    // 暂时模拟成功结束会话
    message.success('会话已结束');
    navigate('/customer-service/sessions');
  };
  
  // 返回会话列表
  const backToSessions = () => {
    navigate('/customer-service/sessions');
  };
  
  // 处理聊天关闭
  const handleChatClose = () => {
    if (sessionInfo && sessionInfo.status === 1) {
      // 如果会话仍在进行中，询问是否结束
      confirmEndSession();
    } else {
      // 如果会话已经结束，直接返回列表
      backToSessions();
    }
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin tip="加载会话中..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <Result
        status="error"
        title="加载会话失败"
        subTitle={error}
        extra={[
          <Button 
            type="primary" 
            key="back" 
            onClick={backToSessions}
          >
            返回会话列表
          </Button>
        ]}
      />
    );
  }
  
  if (!sessionInfo) {
    return (
      <Empty 
        description="未找到会话信息" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button 
          type="primary" 
          onClick={backToSessions}
        >
          返回会话列表
        </Button>
      </Empty>
    );
  }
  
  return (
    <div style={{ height: 'calc(100vh - 148px)' }}>
      <Card 
        style={{ marginBottom: '16px' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Breadcrumb items={[
              { title: <Link to="/customer-service">首页</Link> },
              { title: <Link to="/customer-service/sessions">会话列表</Link> },
              { title: sessionInfo.sessionName || '聊天会话' }
            ]} />
          </div>
          
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={backToSessions}
            >
              返回列表
            </Button>
            
            {sessionInfo.status === 1 && (
              <Button 
                danger
                onClick={confirmEndSession}
              >
                结束会话
              </Button>
            )}
          </Space>
        </div>
      </Card>
      
      <div style={{ height: 'calc(100% - 56px)' }}>
        <ChatComponent 
          sessionId={sessionId} 
          onClose={handleChatClose}
        />
      </div>
    </div>
  );
};

export default ChatPage;