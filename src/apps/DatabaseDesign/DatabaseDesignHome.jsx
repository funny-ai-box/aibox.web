import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Tag,
  Tooltip,
  Modal,
  message,
  Input,
  Row,
  Col,
  Breadcrumb,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  CodeOutlined,
  ExclamationCircleOutlined,
  FormOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import databaseDesignAPI from '../../api/databaseDesignAPI';

const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * 数据库设计工具首页组件
 */
const DatabaseDesignHome = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [taskList, setTaskList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 初始化加载
  useEffect(() => {
    fetchTaskList();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取设计任务列表
  const fetchTaskList = async () => {
    try {
      setLoading(true);
      const response = await databaseDesignAPI.getTaskList(
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
        message.error(response.message || '获取设计任务列表失败');
      }
    } catch (error) {
      console.error('获取设计任务列表失败:', error);
      message.error('获取设计任务列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 创建设计任务
  const createTask = async () => {
    try {
      const taskName = "新建数据库设计任务";
      const description = "请描述你的数据库设计需求...";
      
      const response = await databaseDesignAPI.createTask({
        TaskName: taskName,
        Description: description
      });
      
      if (response.code === 200) {
        message.success('任务创建成功');
        const taskId = response.data;
        navigate(`/database-design/task/${taskId}`);
      } else {
        message.error(response.message || '创建任务失败');
      }
    } catch (error) {
      console.error('创建任务失败:', error);
      message.error('创建任务失败');
    }
  };
  
  // 查看任务详情
  const viewTaskDetail = (taskId) => {
    navigate(`/database-design/task/${taskId}`);
  };
  
  // 删除任务确认
  const confirmDeleteTask = (taskId, taskName) => {
    confirm({
      title: '确认删除设计任务',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除任务"${taskName}"吗？删除后无法恢复。`,
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
      const response = await databaseDesignAPI.deleteTask(taskId);
      
      if (response.code === 200) {
        message.success('任务删除成功');
        fetchTaskList(); // 刷新列表
      } else {
        message.error(response.message || '删除任务失败');
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      message.error('删除任务失败');
    }
  };
  
  // 搜索任务
  const handleSearch = () => {
    // 重置到第一页
    setPagination({
      ...pagination,
      current: 1
    });
    fetchTaskList();
  };
  
  // 刷新任务列表
  const refreshTaskList = () => {
    fetchTaskList();
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
      render: (text, record) => (
        <a onClick={() => viewTaskDetail(record.id)}>{text}</a>
      )
    },
    {
      title: '表数量',
      dataIndex: 'tableCount',
      key: 'tableCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <Tag color="blue">{count}</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 180,
      render: (text) => formatDate(text)
    },
    {
      title: '最后修改',
      dataIndex: 'lastModifyDate',
      key: 'lastModifyDate',
      width: 180,
      render: (text) => formatDate(text)
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="primary"
              size="small"
              icon={<DatabaseOutlined />}
              onClick={() => viewTaskDetail(record.id)}
            >
              详情
            </Button>
          </Tooltip>
          <Tooltip title="删除任务">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => confirmDeleteTask(record.id, record.taskName)}
            >
              删除
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: '数据库设计' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}><DatabaseOutlined /> 数据库设计任务</Title>
          
          <Space>
            <Input
              placeholder="搜索任务名称"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refreshTaskList}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={createTask}
            >
              创建任务
            </Button>
          </Space>
        </div>
        
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
        />
      </Card>
      
      <Card title="使用说明">
        <Row gutter={16}>
          <Col span={8}>
            <Card type="inner" title="Step 1: 创建设计任务" style={{ marginBottom: '16px' }}>
              <p>点击"创建任务"按钮，输入任务名称和描述信息。</p>
              <p>任务创建后，可以开始与AI助手对话，描述您的数据库需求。</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card type="inner" title="Step 2: 设计表结构" style={{ marginBottom: '16px' }}>
              <p>通过自然语言描述您的业务需求，AI会分析并推荐合适的表结构设计。</p>
              <p>您可以与AI多轮对话，不断完善表结构设计。</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card type="inner" title="Step 3: 生成代码" style={{ marginBottom: '16px' }}>
              <p>表结构设计完成后，可以选择生成数据库DDL脚本。</p>
              <p>还可以根据业务需求生成相应的应用代码，支持多种编程语言和框架。</p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DatabaseDesignHome;