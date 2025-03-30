import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  Input,
  message,
  Breadcrumb,
  Badge,
  Modal
} from 'antd';
import {
  PlusOutlined,
  FormOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  StopOutlined,
  BarChartOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import surveyAPI from '../../api/surveyAPI';

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

/**
 * 问卷列表页面
 */
const SurveyListPage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchValue, setSearchValue] = useState('');
  
  // 初始化加载
  useEffect(() => {
    fetchSurveys();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取问卷列表
  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getTaskList(
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        setSurveys(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
      } else {
        message.error(response.message || '获取问卷列表失败');
      }
    } catch (error) {
      message.error('获取问卷列表失败');
      console.error('获取问卷列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 创建新问卷
  const createNewSurvey = () => {
    navigate('/survey/create');
  };
  
  // 搜索问卷
  const handleSearch = (value) => {
    setSearchValue(value);
    setPagination({
      ...pagination,
      current: 1
    });
    // 实际应用中这里应该调用API的搜索功能
    fetchSurveys();
  };
  
  // 刷新问卷列表
  const refreshSurveys = () => {
    fetchSurveys();
  };
  
  // 删除问卷确认
  const confirmDeleteSurvey = (taskId) => {
    confirm({
      title: '确认删除问卷',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复，确定要删除该问卷吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteSurvey(taskId);
      }
    });
  };
  
  // 删除问卷
  const deleteSurvey = async (taskId) => {
    try {
      const response = await surveyAPI.deleteTask(taskId);
      
      if (response.code === 200) {
        message.success('问卷已删除');
        fetchSurveys(); // 刷新列表
      } else {
        message.error(response.message || '删除问卷失败');
      }
    } catch (error) {
      message.error('删除问卷失败');
      console.error('删除问卷失败:', error);
    }
  };
  
  // 复制分享链接
  const copyShareLink = (shareCode) => {
    if (!shareCode) {
      message.warning('请先发布问卷才能分享');
      return;
    }
    
    const link = `${window.location.origin}/survey/fill/${shareCode}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        message.success('分享链接已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
  };
  
  // 发布问卷
  const publishSurvey = async (taskId) => {
    try {
      const response = await surveyAPI.publishTask(taskId);
      
      if (response.code === 200) {
        message.success('问卷已发布');
        fetchSurveys(); // 刷新列表
      } else {
        message.error(response.message || '发布问卷失败');
      }
    } catch (error) {
      message.error('发布问卷失败');
      console.error('发布问卷失败:', error);
    }
  };
  
  // 关闭问卷
  const closeSurvey = async (taskId) => {
    try {
      const response = await surveyAPI.closeTask(taskId);
      
      if (response.code === 200) {
        message.success('问卷已关闭');
        fetchSurveys(); // 刷新列表
      } else {
        message.error(response.message || '关闭问卷失败');
      }
    } catch (error) {
      message.error('关闭问卷失败');
      console.error('关闭问卷失败:', error);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 渲染状态标签
  const renderStatus = (status, statusName) => {
    let icon = null;
    let color = '';
    
    switch (status) {
      case 0:
        icon = <FormOutlined />;
        color = 'default';
        break;
      case 1:
        icon = <CheckCircleOutlined />;
        color = 'success';
        break;
      case 2:
        icon = <StopOutlined />;
        color = 'error';
        break;
      default:
        icon = <FormOutlined />;
        color = 'default';
    }
    
    return (
      <Tag icon={icon} color={color}>
        {statusName}
      </Tag>
    );
  };
  
  // 表格列定义
  const columns = [
    {
      title: '问卷名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '回答数',
      dataIndex: 'responseCount',
      key: 'responseCount',
      width: 100,
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: count > 0 ? '#1890ff' : '#ccc' }} />
      ),
      sorter: (a, b) => a.responseCount - b.responseCount
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => renderStatus(status, record.statusName),
      filters: [
        { text: '草稿', value: 0 },
        { text: '已发布', value: 1 },
        { text: '已关闭', value: 2 }
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
      title: '最后修改',
      dataIndex: 'lastModifyDate',
      key: 'lastModifyDate',
      width: 180,
      render: (text) => formatDate(text),
      sorter: (a, b) => new Date(a.lastModifyDate) - new Date(b.lastModifyDate)
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      render: (_, record) => (
        <Space size="small">
          {record.status === 0 && (
            <>
              <Tooltip title="编辑问卷">
                <Button
                  type="link"
                  icon={<FormOutlined />}
                  onClick={() => navigate(`/survey/edit/${record.id}`)}
                >
                  编辑
                </Button>
              </Tooltip>
              <Tooltip title="发布问卷">
                <Button
                  type="link"
                  icon={<CheckCircleOutlined />}
                  onClick={() => publishSurvey(record.id)}
                >
                  发布
                </Button>
              </Tooltip>
            </>
          )}
          
          {record.status === 1 && (
            <>
              <Tooltip title="查看统计">
                <Button
                  type="link"
                  icon={<BarChartOutlined />}
                  onClick={() => navigate(`/survey/stats/${record.id}`)}
                >
                  统计
                </Button>
              </Tooltip>
              <Tooltip title="分享链接">
                <Button
                  type="link"
                  icon={<ShareAltOutlined />}
                  onClick={() => copyShareLink(record.shareCode)}
                >
                  分享
                </Button>
              </Tooltip>
              <Tooltip title="关闭问卷">
                <Button
                  type="link"
                  icon={<StopOutlined />}
                  onClick={() => closeSurvey(record.id)}
                >
                  关闭
                </Button>
              </Tooltip>
            </>
          )}
          
          {record.status === 2 && (
            <>
              <Tooltip title="查看统计">
                <Button
                  type="link"
                  icon={<BarChartOutlined />}
                  onClick={() => navigate(`/survey/stats/${record.id}`)}
                >
                  统计
                </Button>
              </Tooltip>
              <Tooltip title="重新发布">
                <Button
                  type="link"
                  icon={<CheckCircleOutlined />}
                  onClick={() => publishSurvey(record.id)}
                >
                  重新发布
                </Button>
              </Tooltip>
            </>
          )}
          
          <Tooltip title="预览问卷">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/survey/preview/${record.id}`)}
            >
              预览
            </Button>
          </Tooltip>
          
          <Tooltip title="删除问卷">
            <Popconfirm
              title="确定要删除该问卷吗？"
              onConfirm={() => deleteSurvey(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
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
          { title: 'AI 问卷调查' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}>问卷列表</Title>
          
          <Space>
            <Search
              placeholder="搜索问卷"
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refreshSurveys}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={createNewSurvey}
            >
              创建问卷
            </Button>
          </Space>
        </div>
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={surveys}
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

export default SurveyListPage;