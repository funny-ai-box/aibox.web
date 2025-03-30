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
  Statistic,
  Input,
  Empty
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
  ExclamationCircleOutlined,
  SearchOutlined,
  AudioOutlined,
  FileTextOutlined,
  UsergroupAddOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import podcastAPI from '../../api/podcastAPI';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;
const { Search } = Input;

/**
 * 播客工具首页组件 - 增强科技感版本
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
  const [searchKeyword, setSearchKeyword] = useState('');
  
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
  
  // 搜索任务
  const handleSearch = (value) => {
    setSearchKeyword(value);
  };
  
  // 筛选任务列表
  const getFilteredTasks = () => {
    if (!searchKeyword) return taskList;
    
    return taskList.filter(task => 
      task.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      task.scene.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      task.description.toLowerCase().includes(searchKeyword.toLowerCase())
    );
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
        <a onClick={() => viewTaskDetail(record.id)} className="task-title-link">
          {text}
        </a>
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
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#1890ff',
          }}
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
            className="action-button view-button"
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
              className="action-button generate-button"
            >
              开始生成
            </Button>
          )}
          
          <Button 
            danger
            size="small" 
            icon={<DeleteOutlined />} 
            onClick={() => confirmDeleteTask(record.id)}
            className="action-button delete-button"
          >
            删除
          </Button>
        </Space>
      )
    }
  ];
  
  const filteredTasks = getFilteredTasks();
  
  return (
    <div className="podcast-home-container">
      <Card
        className="main-card"
        style={{ 
          marginBottom: '24px', 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div 
          className="header-section" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px',
            position: 'relative'
          }}
        >
          <Title 
            level={4} 
            className="gradient-title"
            style={{
              background: 'linear-gradient(90deg, #1890ff, #096dd9)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            AI播客任务列表
          </Title>
          
          <Space>
            <Search
              placeholder="搜索播客任务..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 250 }}
              className="search-input"
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchTaskList}
              loading={loading}
              className="refresh-button"
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={createNewTask}
              className="create-button"
            >
              创建播客
            </Button>
          </Space>
          
          {/* 装饰性线条 */}
          <div 
            className="decoration-line" 
            style={{
              position: 'absolute',
              bottom: '-12px',
              left: '0',
              right: '0',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #1890ff, transparent)'
            }}
          />
        </div>
        
        <Divider style={{ margin: '12px 0 24px' }} />
        
        <Row 
          gutter={24} 
          style={{ marginBottom: '32px' }}
          className="statistics-row"
        >
          <Col span={6}>
            <Card 
              bordered={false}
              className="statistics-card"
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #e6f7ff, #f0f5ff)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              <Statistic
                title={
                  <div style={{ color: '#1890ff', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <AudioOutlined style={{ marginRight: '8px' }} />
                    任务总数
                  </div>
                }
                value={statistics.totalTasks}
                valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              bordered={false}
              className="statistics-card"
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f6ffed, #e6fffb)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              <Statistic
                title={
                  <div style={{ color: '#52c41a', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ marginRight: '8px' }} />
                    已完成任务
                  </div>
                }
                value={statistics.completedTasks}
                valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              bordered={false}
              className="statistics-card"
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f9f0ff, #efdbff)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              <Statistic
                title={
                  <div style={{ color: '#722ed1', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <SyncOutlined style={{ marginRight: '8px' }} />
                    处理中任务
                  </div>
                }
                value={statistics.processingTasks}
                valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              bordered={false}
              className="statistics-card"
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #fff2f0, #ffedeb)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              <Statistic
                title={
                  <div style={{ color: '#f5222d', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <CloseCircleOutlined style={{ marginRight: '8px' }} />
                    失败任务
                  </div>
                }
                value={statistics.failedTasks}
                valueStyle={{ color: '#f5222d', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>
        
        {filteredTasks.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={
              <span style={{ color: '#8c8c8c' }}>
                {loading ? '正在加载数据...' : (searchKeyword ? '没有找到匹配的播客任务' : '暂无播客任务')}
              </span>
            }
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={createNewTask}>
              创建播客
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredTasks}
            rowKey="id"
            loading={loading}
            className="podcast-table"
            style={{ 
              borderRadius: '8px',
              overflow: 'hidden'
            }}
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
              showTotal: (total) => `共 ${total} 条记录`,
              style: { marginTop: '16px' },
              className: 'custom-pagination'
            }}
            rowClassName={(record, index) => 
              `podcast-table-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`
            }
          />
        )}
      </Card>
      
      {/* 添加动态视觉效果的样式 */}
      <style jsx="true">{`
        .podcast-home-container {
          position: relative;
        }
        
        .main-card {
          transition: all 0.3s ease;
        }
        
        .main-card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }
        
        .statistics-card {
          transition: all 0.3s ease;
        }
        
        .statistics-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }
        
        .task-title-link {
          color: #1890ff;
          transition: all 0.3s;
          position: relative;
        }
        
        .task-title-link:hover {
          color: #096dd9;
        }
        
        .task-title-link:after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          background-color: #1890ff;
          visibility: hidden;
          transition: all 0.3s ease-in-out;
        }
        
        .task-title-link:hover:after {
          visibility: visible;
          width: 100%;
        }
        
        .action-button {
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        
        .action-button:hover {
          transform: translateY(-2px);
        }
        
        .action-button:after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 0;
          border-radius: 100%;
          transform: scale(1, 1) translate(-50%);
          transform-origin: 50% 50%;
        }
        
        .action-button:hover:after {
          animation: ripple 1s ease-out;
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0, 0);
            opacity: 0.5;
          }
          100% {
            transform: scale(20, 20);
            opacity: 0;
          }
        }
        
        .podcast-table-row {
          transition: all 0.3s;
        }
        
        .podcast-table-row:hover {
          background-color: rgba(24, 144, 255, 0.05) !important;
        }
        
        .even-row {
          background-color: rgba(250, 250, 250, 0.5);
        }
        
        .odd-row {
          background-color: rgba(255, 255, 255, 0.8);
        }
        
        .custom-pagination .ant-pagination-item-active {
          background-color: #1890ff;
          border-color: #1890ff;
        }
        
        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }
        
        .search-input .ant-input {
          border-radius: 8px;
          transition: all 0.3s;
        }
        
        .search-input .ant-input:focus,
        .search-input .ant-input:hover {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
        
        .search-input .ant-input-suffix {
          color: #1890ff;
        }
        
        .refresh-button,
        .create-button {
          border-radius: 8px;
          transition: all 0.3s;
        }
        
        .create-button {
          background: linear-gradient(90deg, #1890ff, #096dd9);
          border: none;
          box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
        }
        
        .create-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
        }
        
        .decoration-line {
          animation: glow 2s ease-in-out infinite;
        }
        
        @keyframes glow {
          0% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.2;
          }
        }
        
        /* 添加音频波形动画 */
        .podcast-home-container:before {
          content: '';
          position: absolute;
          top: 20px;
          right: 20px;
          width: 100px;
          height: 60px;
          background-image: 
            linear-gradient(90deg, transparent 0%, transparent 20%, #1890ff 20%, #1890ff 23%, transparent 23%, transparent 30%, 
            #1890ff 30%, #1890ff 35%, transparent 35%, transparent 40%, 
            #1890ff 40%, #1890ff 43%, transparent 43%, transparent 50%, 
            #1890ff 50%, #1890ff 53%, transparent 53%, transparent 60%, 
            #1890ff 60%, #1890ff 65%, transparent 65%, transparent 70%, 
            #1890ff 70%, #1890ff 73%, transparent 73%, transparent 80%, 
            #1890ff 80%, #1890ff 83%, transparent 83%, transparent 100%);
          background-size: 200% 100%;
          background-position: 0% 0%;
          opacity: 0.1;
          animation: wave 3s linear infinite;
          pointer-events: none;
        }
        
        @keyframes wave {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default PodcastHome;