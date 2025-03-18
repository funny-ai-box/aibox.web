import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tooltip,
  Empty,
  Spin,
  message,
  Progress,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  VideoCameraOutlined,
  EditOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlaySquareOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import videoMixerAPI from '../../api/videoMixerAPI';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProjectListPage = () => {
  const navigate = useNavigate();
  
  // 状态
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  
  // 表单
  const [form] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchProjects();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await videoMixerAPI.getProjectsList(
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        setProjects(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
      } else {
        message.error(response.message || '获取项目列表失败');
      }
    } catch (error) {
      message.error('获取项目列表失败');
      console.error('获取项目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 创建新项目
  const createProject = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setCreatingProject(true);
      const response = await videoMixerAPI.createProject({
        Name: values.name,
        Description: values.description,
        TargetDuration: values.targetDuration,
        SceneKeywords: values.sceneKeywords,
        MinRelevanceThreshold: values.minRelevanceThreshold,
        NarrationStyle: values.narrationStyle,
        BackgroundMusicType: values.backgroundMusicType
      });
      
      if (response.code === 200) {
        message.success('项目创建成功');
        setCreateModalVisible(false);
        form.resetFields();
        fetchProjects();
        
        // 导航到项目编辑页面
        navigate(`/video-mixer/edit/${response.data}`);
      } else {
        message.error(response.message || '创建项目失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('创建项目失败');
      console.error('创建项目失败:', error);
    } finally {
      setCreatingProject(false);
    }
  };
  
  // 格式化项目状态
  const formatProjectStatus = (status) => {
    const statusMap = {
      0: { text: '创建', color: 'default' },
      1: { text: '视频上传完成', color: 'processing' },
      2: { text: '视频分析完成', color: 'processing' },
      3: { text: '场景检测完成', color: 'processing' },
      4: { text: 'AI分析完成', color: 'processing' },
      5: { text: '音频生成完成', color: 'processing' },
      6: { text: '视频合成完成', color: 'success' }
    };
    
    const statusInfo = statusMap[status] || { text: '未知状态', color: 'default' };
    
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };
  
  // 获取项目进度百分比
  const getProjectProgress = (status) => {
    const progressMap = {
      0: 0,
      1: 20,
      2: 40,
      3: 60,
      4: 70,
      5: 85,
      6: 100
    };
    
    return progressMap[status] || 0;
  };
  
  // 导航到项目编辑页面
  const navigateToEditProject = (projectId) => {
    navigate(`/video-mixer/edit/${projectId}`);
  };
  
  // 导航到项目详情页面
  const navigateToProjectDetails = (projectId) => {
    navigate(`/video-mixer/details/${projectId}`);
  };
  
  // 删除项目
  const deleteProject = async (projectId) => {
    // 预留接口，目前API未提供删除功能
    message.info('删除功能尚未实现');
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
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <VideoCameraOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => formatProjectStatus(status)
    },
    {
      title: '进度',
      dataIndex: 'status',
      key: 'progress',
      width: 200,
      render: (status) => (
        <Progress 
          percent={getProjectProgress(status)} 
          status={status === 6 ? 'success' : 'active'} 
          size="small" 
        />
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
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          {record.status === 0 || record.status === 1 ? (
            <Tooltip title="编辑项目">
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => navigateToEditProject(record.id)}
              >
                编辑
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="查看详情">
              <Button 
                type="primary" 
                icon={<PlaySquareOutlined />}
                size="small"
                onClick={() => navigateToProjectDetails(record.id)}
              >
                查看
              </Button>
            </Tooltip>
          )}
          
          <Tooltip title="删除项目">
            <Popconfirm
              title="确定要删除这个项目吗？"
              onConfirm={() => deleteProject(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
                size="small"
              >
                删除
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];
  
  // 创建项目模态框
  const renderCreateModal = () => (
    <Modal
      title="创建混剪项目"
      open={createModalVisible}
      onCancel={() => setCreateModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setCreateModalVisible(false)}>
          取消
        </Button>,
        <Button
          key="create"
          type="primary"
          loading={creatingProject}
          onClick={createProject}
        >
          创建
        </Button>
      ]}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          targetDuration: 60,
          minRelevanceThreshold: 0.9,
          backgroundMusicType: 2
        }}
      >
        <Form.Item
          name="name"
          label="项目名称"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="请输入项目名称" maxLength={50} />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="项目描述"
        >
          <TextArea placeholder="请输入项目描述（可选）" rows={3} maxLength={200} />
        </Form.Item>
        
        <Form.Item
          name="targetDuration"
          label="目标时长（秒）"
          rules={[{ required: true, message: '请输入目标时长' }]}
        >
          <InputNumber min={10} max={300} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="sceneKeywords"
          label="场景关键词"
          tooltip="用于AI筛选视频场景，多个关键词用逗号分隔"
        >
          <Input placeholder="例如：自然,风景,城市" />
        </Form.Item>
        
        <Form.Item
          name="minRelevanceThreshold"
          label="最小相关性阈值"
          tooltip="AI筛选场景的相关性阈值，取值范围0.1-1.0，值越大筛选越严格"
          rules={[{ required: true, message: '请输入最小相关性阈值' }]}
        >
          <InputNumber min={0.1} max={1.0} step={0.1} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="narrationStyle"
          label="解说词风格"
          tooltip="AI生成解说词的风格"
        >
          <Select placeholder="请选择解说词风格">
            <Option value="温馨">温馨</Option>
            <Option value="活力">活力</Option>
            <Option value="专业">专业</Option>
            <Option value="幽默">幽默</Option>
            <Option value="严肃">严肃</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="backgroundMusicType"
          label="背景音乐类型"
          rules={[{ required: true, message: '请选择背景音乐类型' }]}
        >
          <Select placeholder="请选择背景音乐类型">
            <Option value={1}>AI生成</Option>
            <Option value={2}>系统随机内置</Option>
            <Option value={3}>上传音乐文件</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}>我的混剪项目</Title>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchProjects()}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              创建新项目
            </Button>
          </Space>
        </div>
        
        <Text>
          创建并管理您的视频混剪项目，上传源视频后由AI自动分析、剪辑和组合，生成精彩短视频。
        </Text>
      </Card>
      
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>加载项目列表...</div>
          </div>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={projects}
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                setPagination({
                  ...pagination,
                  current: page,
                  pageSize
                });
              },
              showTotal: (total) => `共 ${total} 条`
            }}
            locale={{
              emptyText: (
                <Empty 
                  description="暂无混剪项目" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                  >
                    创建新项目
                  </Button>
                </Empty>
              )
            }}
          />
        )}
      </Card>
      
      {renderCreateModal()}
    </div>
  );
};

export default ProjectListPage;