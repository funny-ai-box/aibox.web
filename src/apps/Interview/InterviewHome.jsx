import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Tag,
  Modal,
  message,
  Input,
  Row,
  Col,
  Breadcrumb,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
  FileTextOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import interviewAPI from '../../api/interviewAPI';

const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * AI面试主页组件，展示面试场景列表
 */
const InterviewHome = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [scenarioList, setScenarioList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 初始化加载
  useEffect(() => {
    fetchScenarioList();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取面试场景列表
  const fetchScenarioList = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getScenarioList(
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        setScenarioList(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
      } else {
        message.error(response.message || '获取面试场景列表失败');
      }
    } catch (error) {
      console.error('获取面试场景列表失败:', error);
      message.error('获取面试场景列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 创建面试场景
  const createScenario = () => {
    navigate('/interview/create');
  };
  
  // 查看场景详情
  const viewScenarioDetail = (scenarioId) => {
    navigate(`/interview/scenario/${scenarioId}`);
  };
  
  // 删除场景确认
  const confirmDeleteScenario = (scenarioId, scenarioName) => {
    confirm({
      title: '确认删除面试场景',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除面试场景"${scenarioName}"吗？删除后无法恢复。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteScenario(scenarioId);
      }
    });
  };
  
  // 删除场景
  const deleteScenario = async (scenarioId) => {
    try {
      const response = await interviewAPI.deleteScenario(scenarioId);
      
      if (response.code === 200) {
        message.success('面试场景删除成功');
        fetchScenarioList(); // 刷新列表
      } else {
        message.error(response.message || '删除面试场景失败');
      }
    } catch (error) {
      console.error('删除面试场景失败:', error);
      message.error('删除面试场景失败');
    }
  };
  
  // 搜索任务
  const handleSearch = () => {
    // 重置到第一页
    setPagination({
      ...pagination,
      current: 1
    });
    fetchScenarioList();
  };
  
  // 刷新列表
  const refreshScenarioList = () => {
    fetchScenarioList();
  };
  
  // 渲染场景状态
  const renderStatus = (status) => {
    const statusMap = {
      0: { text: '初始化', color: 'default' },
      1: { text: '待处理', color: 'warning' },
      2: { text: '分析中', color: 'processing' },
      3: { text: '已就绪', color: 'success' },
      4: { text: '分析失败', color: 'error' }
    };
    
    const { text, color } = statusMap[status] || { text: '未知', color: 'default' };
    
    return <Tag color={color}>{text}</Tag>;
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
      title: '场景名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <a onClick={() => viewScenarioDetail(record.id)}>{text}</a>
      )
    },
    {
      title: '面试官',
      dataIndex: 'interviewerName',
      key: 'interviewerName',
      width: 120,
      render: (text, record) => (
        <Tag icon={<TeamOutlined />}>
          {text} ({record.interviewerGender === 1 ? '男' : '女'})
        </Tag>
      )
    },
    {
      title: '职位数量',
      dataIndex: 'jobPositionCount',
      key: 'jobPositionCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <Tag color="blue">{count}</Tag>
      )
    },
    {
      title: '内容项数量',
      dataIndex: 'contentItemCount',
      key: 'contentItemCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <Tag color="green">{count}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => renderStatus(status)
    },
    {
      title: '创建时间',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 180,
      render: (text) => formatDate(text)
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="primary"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => viewScenarioDetail(record.id)}
            >
              详情
            </Button>
          </Tooltip>
          <Tooltip title="删除场景">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => confirmDeleteScenario(record.id, record.name)}
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
          { title: 'AI面试' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}><TeamOutlined /> AI面试场景</Title>
          
          <Space>
            <Input
              placeholder="搜索场景名称"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refreshScenarioList}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={createScenario}
            >
              创建面试场景
            </Button>
          </Space>
        </div>
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={scenarioList}
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
            <Card type="inner" title="Step 1: 创建面试场景" style={{ marginBottom: '16px' }}>
              <p>点击"创建面试场景"按钮，输入场景名称、面试官信息和需要面试的职位。</p>
              <p>可以上传文档或输入文本作为面试题目的知识来源。</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card type="inner" title="Step 2: 生成面试题目" style={{ marginBottom: '16px' }}>
              <p>系统会基于上传的文档或内容，生成针对不同职位的面试题目。</p>
              <p>您可以查看、编辑和优化AI生成的面试题目。</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card type="inner" title="Step 3: 开始面试" style={{ marginBottom: '16px' }}>
              <p>创建面试会话，选择要面试的职位。</p>
              <p>AI面试官将通过语音与应聘者交流，进行真实的面试体验。</p>
              <p>面试结束后，系统会生成详细的评估报告。</p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InterviewHome;