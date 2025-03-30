import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Typography,
  Space,
  Tag,
  Progress,
  Tooltip,
  Modal,
  message,
  Divider,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  HourglassOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import podcastAPI from '../../api/podcastAPI';

const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * 播客工具首页组件
 */
const PodcastHome = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [taskList, setTaskList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statistics, setStatistics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    processingTasks: 0,
    failedTasks: 0
  });
  
  // 初始化加载
  useEffect(() => {
    fetchTaskList();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取任务列表
  const fetchTaskList = async () => {
    try {
      setLoading(true);
      const response = await podcastAPI.getTaskList(
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        setTaskList(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
        
        // 计算统计数据
        const tasks = response.data.items || [];
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 3).length;
        const processingTasks = tasks.filter(task => task.status === 1 || task.status === 2).length;
        const failedTasks = tasks.filter(task => task.status === 4).length;
        
        setStatistics({
          totalTasks: response.data.totalCount,
          completedTasks,
          processingTasks,
          failedTasks
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
    navigate('/podcast/create');
  };
  
  // 查看任务详情
  const viewTaskDetail = (taskId) => {
    navigate(`/podcast/task/${taskId}`);
  };
  
  // 删除任务确认
  const confirmDeleteTask = (taskId) => {
    confirm({
      title: '确认删除播客任务',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复，确定要删除该播客任务吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteTask(taskId);
      }
    });
  };
  
  // 删除任务
  const deleteTask = async (taskId) => {
    try {
      const response = await podcastAPI.deleteTask(taskId);
      
      if (response.code === 200) {
        message.success('播客任务已删除');
        fetchTaskList(); // 刷新列表
      } else {
        message.error(response.message || '删除播客任务失败');
      }
    } catch (error) {
      message.error('删除播客任务失败');
      console.error('删除播客任务失败:', error);
    }
  };
  
  // 开始生成播客
  const startGenerate = async (taskId) => {
    try {
      const response = await podcastAPI.generatePodcast(taskId);
      
      if (response.code === 200) {
        message.success('播客生成任务已提交，请稍后刷新查看结果');
        setTimeout(() => {
          fetchTaskList(); // 过一会儿刷新列表
        }, 2000);
      } else {
        message.error(response.message || '提交生成任务失败');
      }
    } catch (error) {
      message.error('提交生成任务失败');
      console.error('提交生成任务失败:', error);
    }
  };
  
  // 渲染任务状态标签
  const renderStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag icon={<HourglassOutlined />} color="default">初始化</Tag>;
      case 1:
        return <Tag icon={<HourglassOutlined />} color="blue">待处理</Tag>;
      case 2:
        return <Tag icon={<SyncOutlined spin />} color="processing">处理中</Tag>;
      case 3:
        return <Tag icon={<CheckCircleOutlined />} color="success">已完成</Tag>;
      case 4:
        return <Tag icon={<CloseCircleOutlined />} color="error">处理失败</Tag>;
      default:
        return <Tag color="default">未知状态</Tag>;
    }
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
      title: '任务标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <a onClick={() => viewTaskDetail(record.id)}>{text}</a>
      )
    },
    {
      title: '主题/场景',
      dataIndex: 'scene',
      key: 'scene',
      ellipsis: true,
    },
    {
      title: '嘉宾数量',
      dataIndex: 'guestCount',
      key: 'guestCount',
      width: 100,
      align: 'center'
    },
    {
      title: '内容数量',
      dataIndex: 'contentItemCount',
      key: 'contentItemCount',
      width: 100,
      align: 'center'
    },
    {
      title: '脚本数量',
      dataIndex: 'scriptItemCount',
      key: 'scriptItemCount',
      width: 100,
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => renderStatusTag(status)
    },
    {
      title: '进度',
      dataIndex: 'progressStep',
      key: 'progressStep',
      width: 180,
      render: (progress, record) => (
        <Progress 
          percent={progress} 
          status={
            record.status === 3 ? 'success' : 
            record.status === 4 ? 'exception' : 
            record.status === 2 ? 'active' : 'normal'
          }
          size="small"
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 170,
      render: (text) => formatDate(text)
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewTaskDetail(record.id)}
          >
            查看
          </Button>
          
          {(record.status === 0 || record.status === 1) && (
            <Button 
              type="primary"
              ghost
              size="small" 
              icon={<PlayCircleOutlined />} 
              onClick={() => startGenerate(record.id)}
            >
              开始生成
            </Button>
          )}
          
          <Button 
            danger
            size="small" 
            icon={<DeleteOutlined />} 
            onClick={() => confirmDeleteTask(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];
  
  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={4}>AI播客生成工具</Title>
          
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
              创建播客
            </Button>
          </Space>
        </div>
        
        <Divider />
        
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card bordered={false}>
              <Statistic
                title="任务总数"
                value={statistics.totalTasks}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false}>
              <Statistic
                title="已完成任务"
                value={statistics.completedTasks}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false}>
              <Statistic
                title="处理中任务"
                value={statistics.processingTasks}
                prefix={<SyncOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false}>
              <Statistic
                title="失败任务"
                value={statistics.failedTasks}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={taskList}
          rowKey="id"
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

export default PodcastHome;