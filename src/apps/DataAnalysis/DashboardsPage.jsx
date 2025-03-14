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
  Popconfirm,
  Empty,
  Spin,
  message,
  Tooltip
} from 'antd';
import {
  DashboardOutlined,
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dtaAPI from '../../api/dtaAPI';

const { Title, Text } = Typography;

/**
 * 数据分析助手 - 可视化面板页面
 * 展示和管理用户创建的数据可视化面板
 */
const DashboardsPage = () => {
  const navigate = useNavigate();
  
  // 状态
  const [loading, setLoading] = useState(true);
  const [dashboards, setDashboards] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creatingDashboard, setCreatingDashboard] = useState(false);
  const [editDashboard, setEditDashboard] = useState(null);
  const [dashboardDetailVisible, setDashboardDetailVisible] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [dashboardDetailLoading, setDashboardDetailLoading] = useState(false);
  
  const [form] = Form.useForm();
  
  // 初始加载
  useEffect(() => {
    fetchDashboards();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取仪表板列表
  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const response = await dtaAPI.getBIPagesList(
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        setDashboards(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
      } else {
        message.error(response.message || '获取仪表板列表失败');
      }
    } catch (error) {
      message.error('获取仪表板列表失败');
      console.error('获取仪表板列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 创建或更新仪表板
  const handleCreateOrUpdateDashboard = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setCreatingDashboard(true);
      
      let response;
      if (editDashboard) {
        // 更新仪表板（API尚未提供更新方法，待实现）
        message.info('更新仪表板功能尚未实现');
        return;
      } else {
        // 创建仪表板
        response = await dtaAPI.createBIPage(
          values.pageName,
          values.description,
          false // 默认非公开
        );
      }
      
      if (response.code === 200) {
        message.success(editDashboard ? '更新仪表板成功' : '创建仪表板成功');
        setCreateModalVisible(false);
        form.resetFields();
        fetchDashboards();
      } else {
        message.error(response.message || (editDashboard ? '更新仪表板失败' : '创建仪表板失败'));
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(editDashboard ? '更新仪表板失败' : '创建仪表板失败');
      console.error(editDashboard ? '更新仪表板失败:' : '创建仪表板失败:', error);
    } finally {
      setCreatingDashboard(false);
    }
  };
  
  // 删除仪表板
  const handleDeleteDashboard = async (dashboardId) => {
    try {
      const response = await dtaAPI.deleteBIPage(dashboardId);
      
      if (response.code === 200) {
        message.success('删除仪表板成功');
        fetchDashboards();
      } else {
        message.error(response.message || '删除仪表板失败');
      }
    } catch (error) {
      message.error('删除仪表板失败');
      console.error('删除仪表板失败:', error);
    }
  };
  
  // 查看仪表板详情
  const viewDashboardDetail = async (dashboardId) => {
    try {
      setDashboardDetailLoading(true);
      setDashboardDetailVisible(true);
      
      const response = await dtaAPI.getBIPageDetail(dashboardId);
      
      if (response.code === 200) {
        setCurrentDashboard(response.data);
      } else {
        message.error(response.message || '获取仪表板详情失败');
        setDashboardDetailVisible(false);
      }
    } catch (error) {
      message.error('获取仪表板详情失败');
      console.error('获取仪表板详情失败:', error);
      setDashboardDetailVisible(false);
    } finally {
      setDashboardDetailLoading(false);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 打开编辑模态框
  const openEditModal = (dashboard) => {
    setEditDashboard(dashboard);
    form.setFieldsValue({
      pageName: dashboard.pageName,
      description: dashboard.description
    });
    setCreateModalVisible(true);
  };
  
  // 打开创建模态框
  const openCreateModal = () => {
    setEditDashboard(null);
    form.resetFields();
    setCreateModalVisible(true);
  };
  
  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'pageName',
      key: 'pageName',
      render: (text, record) => (
        <Space>
          <DashboardOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '组件数量',
      dataIndex: 'componentCount',
      key: 'componentCount',
      width: 100,
      render: (count) => count || 0
    },
    {
      title: '公开状态',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 100,
      render: (isPublic) => isPublic ? (
        <Tag color="green">公开</Tag>
      ) : (
        <Tag color="default">私有</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (text) => formatDate(text)
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看仪表板">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => viewDashboardDetail(record.id)}
            />
          </Tooltip>
          
          <Tooltip title="编辑信息">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          
          <Tooltip title="删除仪表板">
            <Popconfirm
              title="确定要删除这个仪表板吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDeleteDashboard(record.id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];
  
  // 创建/编辑仪表板模态框
  const renderCreateModal = () => (
    <Modal
      title={editDashboard ? '编辑仪表板' : '创建新仪表板'}
      open={createModalVisible}
      onCancel={() => setCreateModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setCreateModalVisible(false)}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={creatingDashboard}
          onClick={handleCreateOrUpdateDashboard}
        >
          {editDashboard ? '更新' : '创建'}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="pageName"
          label="仪表板名称"
          rules={[{ required: true, message: '请输入仪表板名称' }]}
        >
          <Input placeholder="请输入仪表板名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea 
            placeholder="请输入仪表板描述（可选）" 
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
  
  // 仪表板详情模态框
  const renderDashboardDetailModal = () => {
    if (!currentDashboard) return null;
    
    return (
      <Modal
        title={`仪表板：${currentDashboard.pageName}`}
        open={dashboardDetailVisible}
        onCancel={() => setDashboardDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDashboardDetailVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="view" 
            type="primary" 
            onClick={() => navigate(`/data-analysis/dashboard/${currentDashboard.id}`)}
          >
            查看完整仪表板
          </Button>
        ]}
        width={800}
      >
        {dashboardDetailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary">
                {currentDashboard.description || '暂无描述'}
              </Text>
            </div>
            
            <Title level={5}>图表组件 ({currentDashboard.componentCount || 0})</Title>
            
            {!currentDashboard.components || currentDashboard.components.length === 0 ? (
              <Empty description="暂无图表组件" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {currentDashboard.components.map((component, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    title={component.title || '未命名组件'}
                    style={{ height: '250px', overflow: 'hidden' }}
                  >
                    <div style={{ height: '180px', overflow: 'hidden' }}>
                      {component.visualization ? (
                        <iframe
                          srcDoc={component.visualization}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          title={component.title}
                          sandbox="allow-scripts"
                        />
                      ) : (
                        <Empty description="无可视化内容" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    );
  };
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}>可视化面板</Title>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchDashboards()}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              创建新仪表板
            </Button>
          </Space>
        </div>
        
        <Text>
          创建并管理您的数据可视化面板，将分析结果保存为可视化图表组件。
        </Text>
      </Card>
      
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={dashboards}
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
            showTotal: (total) => `共 ${total} 条`
          }}
          locale={{
            emptyText: (
              <Empty 
                description="暂无数据" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={openCreateModal}
                >
                  创建新仪表板
                </Button>
              </Empty>
            )
          }}
        />
      </Card>
      
      {renderCreateModal()}
      {renderDashboardDetailModal()}
    </div>
  );
};

export default DashboardsPage;