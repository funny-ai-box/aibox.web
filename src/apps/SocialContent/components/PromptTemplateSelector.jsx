import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Card, 
  Spin, 
  Empty, 
  message, 
  Typography, 
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tooltip,
  Popconfirm,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  InfoCircleOutlined,
  FormOutlined,
  EyeOutlined,
  CopyOutlined,
  UserOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import socialContentAPI from '../../../api/socialContentAPI';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

/**
 * 提示词模板选择组件
 * @param {Object} props
 * @param {number} props.platformId - 平台ID
 * @param {Object} props.value - 选中的模板值对象，包含id和type
 * @param {function} props.onChange - 选择变更回调
 * @param {boolean} props.loading - 外部加载状态
 */
const PromptTemplateSelector = ({ 
  platformId, 
  value = { id: null, type: 1 }, 
  onChange,
  loading: externalLoading 
}) => {
  const [sysPromptList, setSysPromptList] = useState([]);
  const [userPromptList, setUserPromptList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('system');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState(null);
  
  const [form] = Form.useForm();
  
  // 加载平台提示词模板
  useEffect(() => {
    if (platformId) {
      fetchPromptTemplates();
    }
  }, [platformId]);
  
  // 获取系统提示词列表
  const fetchPromptTemplates = async () => {
    try {
      setLoading(true);
      
      // 获取系统预设提示词
      const sysResponse = await socialContentAPI.getSysPromptList(platformId);
      if (sysResponse.code === 200) {
        setSysPromptList(sysResponse.data || []);
        
        // 如果有系统模板数据且未设置初始值，默认选择第一个模板
        if (sysResponse.data && sysResponse.data.length > 0 && !value.id) {
          onChange && onChange({ id: sysResponse.data[0].id, type: 1 });
        }
      }
      
      // 获取用户自定义提示词
      const userResponse = await socialContentAPI.getUserPromptList(platformId);
      if (userResponse.code === 200) {
        setUserPromptList(userResponse.data || []);
      }
    } catch (error) {
      message.error('获取提示词模板失败');
      console.error('获取提示词模板失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理模板选择变更
  const handleTemplateChange = (templateId, type) => {
    onChange && onChange({ id: templateId, type });
  };
  
  // 打开添加/编辑模板模态框
  const openPromptModal = (prompt = null) => {
    setEditingPrompt(prompt);
    
    if (prompt) {
      form.setFieldsValue({
        templateName: prompt.templateName,
        templateContent: prompt.templateContent,
        systemPrompt: prompt.systemPrompt
      });
    } else {
      form.resetFields();
    }
    
    setModalVisible(true);
  };
  
  // 查看提示词模板详情
  const viewPromptDetail = (prompt) => {
    setViewingPrompt(prompt);
    setViewModalVisible(true);
  };
  
  // 提交添加/编辑模板
  const submitPromptTemplate = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setSubmitting(true);
      
      // 构建请求数据
      const requestData = {
        TemplateName: values.templateName,
        TemplateContent: values.templateContent,
        SystemPrompt: values.systemPrompt,
        PlatformId: platformId
      };
      
      let response;
      
      if (editingPrompt) {
        // 更新已有模板
        requestData.Id = editingPrompt.id;
        response = await socialContentAPI.updateUserPrompt(requestData);
      } else {
        // 创建新模板
        response = await socialContentAPI.addUserPrompt(requestData);
      }
      
      if (response.code === 200) {
        message.success(editingPrompt ? '更新模板成功' : '创建模板成功');
        setModalVisible(false);
        fetchPromptTemplates(); // 刷新模板列表
      } else {
        message.error(response.message || (editingPrompt ? '更新模板失败' : '创建模板失败'));
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(editingPrompt ? '更新模板失败' : '创建模板失败');
      console.error(editingPrompt ? '更新模板失败:' : '创建模板失败:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // 删除用户自定义模板
  const deleteUserPrompt = async (promptId) => {
    try {
      const response = await socialContentAPI.deleteUserPrompt(promptId);
      
      if (response.code === 200) {
        message.success('删除模板成功');
        
        // 如果删除的是当前选中的模板，重置选择
        if (value.id === promptId && value.type === 2) {
          // 默认选中第一个系统模板
          if (sysPromptList.length > 0) {
            onChange && onChange({ id: sysPromptList[0].id, type: 1 });
          } else {
            onChange && onChange({ id: null, type: 1 });
          }
        }
        
        // 更新用户模板列表
        setUserPromptList(prev => prev.filter(item => item.id !== promptId));
      } else {
        message.error(response.message || '删除模板失败');
      }
    } catch (error) {
      message.error('删除模板失败');
      console.error('删除模板失败:', error);
    }
  };
  
  // 渲染系统提示词模板
  const renderSystemPromptList = () => {
    if (sysPromptList.length === 0) {
      return <Empty description="暂无系统预设提示词模板" />;
    }
    
    return (
      <Radio.Group 
        value={value.type === 1 ? value.id : null}
        onChange={(e) => handleTemplateChange(e.target.value, 1)}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {sysPromptList.map(prompt => (
            <Card 
              key={prompt.id}
              style={{ 
                width: '100%',
                marginBottom: '16px',
                border: value.id === prompt.id && value.type === 1 
                  ? '2px solid #1890ff' 
                  : '1px solid #d9d9d9'
              }}
              bodyStyle={{ padding: '16px' }}
              hoverable
            >
              <Radio value={prompt.id} style={{ display: 'block', height: '22px' }}>
                <Text strong>{prompt.templateName}</Text>
              </Radio>
              
              <div style={{ marginTop: '8px', color: '#666' }}>
                <Paragraph 
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: '8px' }}
                >
                  {prompt.systemPrompt}
                </Paragraph>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <Tooltip title="查看详情">
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      viewPromptDetail(prompt);
                    }}
                  />
                </Tooltip>
                <Tooltip title="复制为我的模板">
                  <Button 
                    type="text" 
                    icon={<CopyOutlined />}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openPromptModal({
                        ...prompt,
                        templateName: `${prompt.templateName} (我的复制)`
                      });
                    }}
                  />
                </Tooltip>
              </div>
            </Card>
          ))}
        </Space>
      </Radio.Group>
    );
  };
  
  // 渲染用户自定义提示词模板
  const renderUserPromptList = () => {
    return (
      <>
        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openPromptModal()}
          >
            创建我的提示词模板
          </Button>
        </div>
        
        {userPromptList.length === 0 ? (
          <Empty description="暂无自定义提示词模板" />
        ) : (
          <Radio.Group 
            value={value.type === 2 ? value.id : null}
            onChange={(e) => handleTemplateChange(e.target.value, 2)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {userPromptList.map(prompt => (
                <Card 
                  key={prompt.id}
                  style={{ 
                    width: '100%',
                    marginBottom: '16px',
                    border: value.id === prompt.id && value.type === 2
                      ? '2px solid #1890ff' 
                      : '1px solid #d9d9d9'
                  }}
                  bodyStyle={{ padding: '16px' }}
                  hoverable
                >
                  <Radio value={prompt.id} style={{ display: 'block', height: '22px' }}>
                    <Text strong>{prompt.templateName}</Text>
                  </Radio>
                  
                  <div style={{ marginTop: '8px', color: '#666' }}>
                    <Paragraph 
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: '8px' }}
                    >
                      {prompt.systemPrompt}
                    </Paragraph>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <Tooltip title="查看详情">
                      <Button 
                        type="text" 
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          viewPromptDetail(prompt);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="编辑模板">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openPromptModal(prompt);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="删除模板">
                      <Popconfirm
                        title="确定要删除此模板吗？"
                        onConfirm={(e) => {
                          e.stopPropagation();
                          deleteUserPrompt(prompt.id);
                        }}
                        okText="确定"
                        cancelText="取消"
                        placement="topRight"
                      >
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        />
                      </Popconfirm>
                    </Tooltip>
                  </div>
                </Card>
              ))}
            </Space>
          </Radio.Group>
        )}
      </>
    );
  };
  
  // 渲染详情查看模态框
  const renderViewModal = () => {
    if (!viewingPrompt) return null;
    
    return (
      <Modal
        title={`提示词模板详情：${viewingPrompt.templateName}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <Text strong>系统提示词：</Text>
          <Card style={{ marginTop: '8px' }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {viewingPrompt.systemPrompt}
            </Paragraph>
          </Card>
        </div>
        
        <div>
          <Text strong>模板内容：</Text>
          <Card style={{ marginTop: '8px' }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {viewingPrompt.templateContent}
            </Paragraph>
          </Card>
          <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
            * 模板内容中支持使用 商品信息、关键词、图片描述 作为占位符
          </Text>
        </div>
      </Modal>
    );
  };
  
  // 渲染添加/编辑模态框
  const renderPromptModal = () => {
    return (
      <Modal
        title={editingPrompt ? "编辑提示词模板" : "创建提示词模板"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={submitPromptTemplate}
        okText={editingPrompt ? "更新" : "创建"}
        cancelText="取消"
        confirmLoading={submitting}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="templateName"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" maxLength={100} />
          </Form.Item>
          
          <Form.Item
            name="systemPrompt"
            label={
              <Space>
                <span>系统提示词</span>
                <Tooltip title="设定AI的角色和行为指导，例如：你是一位专业的小红书内容创作者">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: '请输入系统提示词' }]}
          >
            <TextArea 
              placeholder="请输入系统提示词，用于定义AI的角色和行为" 
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          
          <Form.Item
            name="templateContent"
            label={
              <Space>
                <span>模板内容</span>
                <Tooltip title="指导AI如何创作内容的具体要求，支持使用{{商品信息}}、{{关键词}}、{{图片描述}}作为占位符">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <TextArea 
              placeholder="请输入模板内容，支持使用{{商品信息}}、{{关键词}}、{{图片描述}}作为占位符" 
              autoSize={{ minRows: 6, maxRows: 12 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  };
  
  const isLoading = loading || externalLoading;
  
  if (isLoading) {
    return (
      <Card 
        title="选择提示词模板"
        style={{ textAlign: 'center', padding: '20px' }}
        bodyStyle={{ padding: '20px 0' }}
      >
        <Spin tip="加载提示词模板..." />
      </Card>
    );
  }
  
  if (!platformId) {
    return (
      <Card title="选择提示词模板">
        <Empty description="请先选择社交平台" />
      </Card>
    );
  }
  
  return (
    <Card title="选择提示词模板">
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarExtraContent={
          <Tooltip title="提示词模板用于指导AI创建高质量的社交媒体内容">
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        }
      >
        <TabPane 
          tab={
            <span>
              <AppstoreOutlined />
              系统预设
            </span>
          } 
          key="system"
        >
          {renderSystemPromptList()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              我的模板
            </span>
          } 
          key="user"
        >
          {renderUserPromptList()}
        </TabPane>
      </Tabs>
      
      {renderPromptModal()}
      {renderViewModal()}
    </Card>
  );
};

export default PromptTemplateSelector;