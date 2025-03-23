import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Tooltip,
  Modal,
  message,
  Input,
  Breadcrumb,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import customerServiceAPI from '../../api/customerServiceAPI';

const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * 智能客服会话列表页面
 */
const SessionListPage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 初始化加载
  useEffect(() => {
    fetchSessions();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取会话列表
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await customerServiceAPI.getChatSessionList(
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        setSessions(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
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
  
  // 创建新会话
  const createNewSession = async () => {
    try {
      const defaultSessionName = `会话 ${new Date().toLocaleString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric', 
        minute: 'numeric' 
      })}`;
      
      const response = await customerServiceAPI.createChatSession({
        SessionName: defaultSessionName
      });
      
      if (response.code === 200) {
        message.success('创建聊天会话成功');
        navigate(`/customer-service/chat/${response.data}`);
      } else {
        message.error(response.message || '创建聊天会话失败');
      }
    } catch (error) {
      console.error('创建聊天会话失败:', error);
      message.error('创建聊天会话失败');
    }
  };
  
  // 查看会话详情
  const viewSession = (sessionId) => {
    navigate(`/customer-service/chat/${sessionId}`);
  };
  
  // 删除会话确认
  const confirmDeleteSession = (sessionId) => {
    confirm({
      title: '确认删除会话',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复，确定要删除该会话吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        // 这里应该调用删除会话的API
        // 暂时模拟删除成功
        message.success('会话已删除');
        fetchSessions(); // 刷新列表
      }
    });
  };
  
  // 搜索会话
  const handleSearch = () => {
    // 在实际应用中，这里应该调用后端搜索API
    // 暂时前端筛选
    setPagination({
      ...pagination,
      current: 1
    });
    fetchSessions();
  };
  
  // 刷新会话列表
  const refreshSessions = () => {
    fetchSessions();
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 表格列定义
  const columns = [
    {
      title: '会话名称',
      dataIndex: 'sessionName',
      key: 'sessionName',
      render: (text, record) => (
        <Space>
          <CustomerServiceOutlined style={{ color: '#1890ff' }} />
          <a onClick={() => viewSession(record.id)}>{text}</a>
        </Space>
      )
    },
    {
      title: '用户信息',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => (
        <Space>
          <UserOutlined />
          <span>{text || '未知用户'}</span>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        return status === 1 ? (
          <Tag icon={<SyncOutlined spin />} color="processing">
            进行中
          </Tag>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="default">
            已结束
          </Tag>
        );
      },
      filters: [
        { text: '进行中', value: 1 },
        { text: '已结束', value: 0 }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '创建时间',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 180,
      render: (text) => formatDate(text),
      sorter: (a, b) => new Date(a.createDate) - new Date(b.createDate),
      defaultSortOrder: 'descend'
    },
    {
      title: '最后更新',
      dataIndex: 'lastModifyDate',
      key: 'lastModifyDate',
      width: 180,
      render: (text) => formatDate(text)
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看会话">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => viewSession(record.id)}
            />
          </Tooltip>
          <Tooltip title="删除会话">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDeleteSession(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/customer-service">首页</Link> },
          { title: '会话列表' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}>智能客服会话列表</Title>
          
          <Space>
            <Input
              placeholder="搜索会话"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refreshSessions}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={createNewSession}
            >
              新建会话
            </Button>
          </Space>
        </div>
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={sessions}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination({
                ...pagination,
                current: page,
                pageSize
              });
            },
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>
    </div>
  );
};

export default SessionListPage;