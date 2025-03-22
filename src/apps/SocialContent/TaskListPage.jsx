import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Tag,
  Tooltip,
  Badge,
  Progress,
  Empty,
  message
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import socialContentAPI from '../../api/socialContentAPI';

const { Title, Text } = Typography;

const TaskListPage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [taskList, setTaskList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 初始化加载
  useEffect(() => {
    fetchTaskList();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取任务列表
  const fetchTaskList = async () => {
    try {
      setLoading(true);
      const response = await socialContentAPI.getTaskList(
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        setTaskList(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
      } else {
        message.error(response.message || '获取任务列表失败');
      }
    } catch (error) {
      message.error('获取任务列表失败');
      console.error('获取任务列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 创建新任务
  const createNewTask = () => {
    navigate('/social-content/create');
  };
  
  // 查看任务详情
  const viewTaskDetail = (taskId) => {
    navigate(`/social-content/task/${taskId}`);
  };
  
  // 渲染任务状态
  const renderTaskStatus = (status, statusName) => {
    let icon = null;
    let color = '';
    
    switch (status) {
      case 0:
        icon = <ClockCircleOutlined />;
        color = 'default';
        break;
      case 1:
        icon = <SyncOutlined spin />;
        color = 'processing';
        break;
      case 2:
        icon = <CheckCircleOutlined />;
        color = 'success';
        break;
      case 3:
        icon = <CloseCircleOutlined />;
        color = 'error';
        break;
      default:
        icon = <ClockCircleOutlined />;
        color = 'default';
    }
    
    return (
      <Tag icon={icon} color={color}>
        {statusName || '待处理'}
      </Tag>
    );
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
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      ellipsis: true,
    },
    {
      title: '平台',
      key: 'platforms',
      render: (_, record) => (
        <Badge count={record.platformCount} style={{ backgroundColor: '#1890ff' }}>
          <Text>平台</Text>
        </Badge>
      ),
      width: 80,
      align: 'center'
    },
    {
      title: '图片',
      key: 'images',
      render: (_, record) => (
        <Badge count={record.imageCount} style={{ backgroundColor: '#52c41a' }}>
          <Text>图片</Text>
        </Badge>
      ),
      width: 80,
      align: 'center'
    },
    {
      title: '内容',
      key: 'contents',
      render: (_, record) => (
        <Badge count={record.contentCount} style={{ backgroundColor: '#722ed1' }}>
          <Text>内容</Text>
        </Badge>
      ),
      width: 80,
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => renderTaskStatus(status, record.statusName)
    },
    {
      title: '进度',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 150,
      render: (rate) => (
        <Progress 
          percent={rate} 
          size="small" 
          status={rate >= 100 ? 'success' : 'active'}
          style={{ width: '120px' }}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 180,
      render: (dateStr) => formatDate(dateStr)
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => viewTaskDetail(record.id)}
        >
          查看
        </Button>
      )
    }
  ];
  
  return (
    <div>
      <Card 
        title="内容创作任务"
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchTaskList}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={createNewTask}
            >
              创建任务
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={taskList}
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
          locale={{
            emptyText: (
              <Empty 
                description="暂无内容创作任务" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={createNewTask}
                >
                  创建任务
                </Button>
              </Empty>
            )
          }}
        />
      </Card>
    </div>
  );
};

export default TaskListPage;