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
  Form,
  Select,
  Tabs,
  Radio,
  List,
  Collapse,
  Spin,
  Breadcrumb,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  FileTextOutlined,
  CodeOutlined,
  SaveOutlined,
  SendOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import databaseDesignAPI from '../../api/databaseDesignAPI';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

/**
 * 代码模板管理组件
 */
const CodeTemplateManager = () => {

  const [loading, setLoading] = useState(true);
  const [templateList, setTemplateList] = useState([]);
  const [supportedLanguages, setSupportedLanguages] = useState({
    databases: [],
    languages: []
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // create, generate
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [generatingContent, setGeneratingContent] = useState('');
  
  const [form] = Form.useForm();
  
  // 初始化加载
  useEffect(() => {
    Promise.all([
      fetchTemplateList(),
      fetchSupportedLanguages()
    ]).finally(() => {
      setLoading(false);
    });
  }, []);
  
  // 获取模板列表
  const fetchTemplateList = async () => {
    try {
      const response = await databaseDesignAPI.getCodeTemplateList();
      
      if (response.code === 200) {
        setTemplateList(response.data || []);
      } else {
        message.error(response.message || '获取模板列表失败');
      }
    } catch (error) {
      console.error('获取模板列表失败:', error);
      message.error('获取模板列表失败');
    }
  };
  
  // 获取支持的语言和数据库
  const fetchSupportedLanguages = async () => {
    try {
      const response = await databaseDesignAPI.getSupportedLanguages();
      
      if (response.code === 200) {
        setSupportedLanguages(response.data);
        // 设置默认值
        form.setFieldsValue({
          language: response.data.languages[0]?.value,
          databaseType: response.data.databases[0]?.value
        });
      } else {
        message.error(response.message || '获取支持的语言失败');
      }
    } catch (error) {
      console.error('获取支持的语言失败:', error);
      message.error('获取支持的语言失败');
    }
  };
  
  // 获取模板详情
  const fetchTemplateDetail = async (templateId) => {
    try {
      setFormLoading(true);
      const response = await databaseDesignAPI.getCodeTemplateDetail(templateId);
      
      if (response.code === 200) {
        setSelectedTemplateDetails(response.data || []);
      } else {
        message.error(response.message || '获取模板详情失败');
      }
    } catch (error) {
      console.error('获取模板详情失败:', error);
      message.error('获取模板详情失败');
    } finally {
      setFormLoading(false);
    }
  };
  
  // 获取示例要求
  const fetchTemplateExample = async () => {
    try {
      setFormLoading(true);
      const values = form.getFieldsValue();
      
      const response = await databaseDesignAPI.getTemplateExample({
        language: values.language,
        databaseType: values.databaseType
      });
      
      if (response.code === 200) {
        form.setFieldsValue({
          requirements: response.data.exampleRequirements
        });
      } else {
        message.error(response.message || '获取示例要求失败');
      }
    } catch (error) {
      console.error('获取示例要求失败:', error);
      message.error('获取示例要求失败');
    } finally {
      setFormLoading(false);
    }
  };
  
  // 打开创建模板对话框
  const openCreateModal = () => {
    form.resetFields();
    setModalType('create');
    setModalVisible(true);
  };
  
  // 打开AI生成模板对话框
  const openGenerateModal = () => {
    form.resetFields();
    fetchTemplateExample();
    setModalType('generate');
    setGeneratingContent('');
    setModalVisible(true);
  };
  
  // 查看模板详情
  const viewTemplateDetail = (templateId) => {
    setSelectedTemplate(templateId);
    fetchTemplateDetail(templateId);
  };
  
  // 删除模板
  const deleteTemplate = async (templateId) => {
    try {
      const response = await databaseDesignAPI.deleteCodeTemplate(templateId);
      
      if (response.code === 200) {
        message.success('模板删除成功');
        fetchTemplateList();
        if (selectedTemplate === templateId) {
          setSelectedTemplate(null);
          setSelectedTemplateDetails([]);
        }
      } else {
        message.error(response.message || '删除模板失败');
      }
    } catch (error) {
      console.error('删除模板失败:', error);
      message.error('删除模板失败');
    }
  };
  
  // 创建模板
  const createTemplate = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setFormLoading(true);
      const response = await databaseDesignAPI.createCodeTemplate({
        TemplateName: values.templateName,
        Language: values.language,
        DatabaseType: values.databaseType
      });
      
      if (response.code === 200) {
        message.success('模板创建成功');
        setModalVisible(false);
        fetchTemplateList();
      } else {
        message.error(response.message || '创建模板失败');
      }
    } catch (error) {
      if (error.errorFields) {
        return; // 表单验证错误
      }
      console.error('创建模板失败:', error);
      message.error('创建模板失败');
    } finally {
      setFormLoading(false);
    }
  };
  
  // AI生成模板
  const generateTemplate = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setStreaming(true);
      setGeneratingContent('');
      
      const eventSource = new EventSource(`http://106.75.71.65:57460/api/datadesign/code/template/generatedtl?TemplateId=${values.templateId}&Requirements=${encodeURIComponent(values.requirements)}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setGeneratingContent(prev => prev + (data.chunk || ''));
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        setStreaming(false);
        
        if (!generatingContent) {
          message.error('生成模板失败');
        }
      };
      
      eventSource.addEventListener('done', () => {
        eventSource.close();
        setStreaming(false);
        message.success('模板生成成功');
        fetchTemplateList();
      });
      
      eventSource.addEventListener('end', () => {
        eventSource.close();
        setStreaming(false);
      });
    } catch (error) {
      if (error.errorFields) {
        return; // 表单验证错误
      }
      console.error('生成模板失败:', error);
      message.error('生成模板失败');
      setStreaming(false);
    }
  };
  
  // 复制文本到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('已复制到剪贴板');
      },
      () => {
        message.error('复制失败');
      }
    );
  };
  
  // 渲染创建模板表单
  const renderCreateForm = () => (
    <Form
      form={form}
      layout="vertical"
    >
      <Form.Item
        name="templateName"
        label="模板名称"
        rules={[{ required: true, message: '请输入模板名称' }]}
      >
        <Input placeholder="请输入模板名称" />
      </Form.Item>
      
      <Form.Item
        name="language"
        label="编程语言"
        rules={[{ required: true, message: '请选择编程语言' }]}
      >
        <Select placeholder="请选择编程语言">
          {supportedLanguages.languages.map(lang => (
            <Option key={lang.value} value={lang.value}>
              {lang.code}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        name="databaseType"
        label="数据库类型"
        rules={[{ required: true, message: '请选择数据库类型' }]}
      >
        <Select placeholder="请选择数据库类型">
          {supportedLanguages.databases.map(db => (
            <Option key={db.value} value={db.value}>
              {db.code}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
  
  // 渲染AI生成模板表单
  const renderGenerateForm = () => (
    <Form
      form={form}
      layout="vertical"
    >
      <Form.Item
        name="templateId"
        label="选择模板"
        rules={[{ required: true, message: '请选择模板' }]}
      >
        <Select placeholder="请选择模板">
          {templateList.filter(t => !t.isSystem).map(template => (
            <Option key={template.id} value={template.id}>
              {template.templateName}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        name="language"
        label="编程语言"
        rules={[{ required: true, message: '请选择编程语言' }]}
      >
        <Select placeholder="请选择编程语言">
          {supportedLanguages.languages.map(lang => (
            <Option key={lang.value} value={lang.value}>
              {lang.code}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        name="databaseType"
        label="数据库类型"
        rules={[{ required: true, message: '请选择数据库类型' }]}
      >
        <Select placeholder="请选择数据库类型">
          {supportedLanguages.databases.map(db => (
            <Option key={db.value} value={db.value}>
              {db.code}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <div style={{ marginBottom: 16 }}>
        <Button onClick={fetchTemplateExample} loading={formLoading}>
          获取示例要求
        </Button>
      </div>
      
      <Form.Item
        name="requirements"
        label="模板生成要求"
        rules={[{ required: true, message: '请输入模板生成要求' }]}
      >
        <TextArea
          placeholder="请描述您希望如何生成模板，例如：模板内容、格式、功能等"
          autoSize={{ minRows: 6, maxRows: 12 }}
        />
      </Form.Item>
      
      {generatingContent && (
        <div style={{ marginTop: 16 }}>
          <Title level={5}>生成结果</Title>
          <div
            style={{
              border: '1px solid #d9d9d9',
              padding: 16,
              borderRadius: 4,
              maxHeight: 300,
              overflowY: 'auto',
              backgroundColor: '#f5f5f5'
            }}
          >
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {generatingContent}
            </pre>
          </div>
        </div>
      )}
    </Form>
  );
  
  // 表格列定义
  const columns = [
    {
      title: '模板名称',
      dataIndex: 'templateName',
      key: 'templateName',
      ellipsis: true,
      render: (text, record) => (
        <a onClick={() => viewTemplateDetail(record.id)}>{text}</a>
      )
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 120,
      render: (value) => {
        const lang = supportedLanguages.languages.find(l => l.value === value);
        return lang ? (
          <Tag color="blue">{lang.code}</Tag>
        ) : value;
      }
    },
    {
      title: '数据库',
      dataIndex: 'databaseType',
      key: 'databaseType',
      width: 120,
      render: (value) => {
        const db = supportedLanguages.databases.find(d => d.value === value);
        return db ? (
          <Tag color="green">{db.code}</Tag>
        ) : value;
      }
    },
    {
      title: '类型',
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 100,
      render: (value) => value ? (
        <Tag color="gold">系统</Tag>
      ) : (
        <Tag color="purple">自定义</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => viewTemplateDetail(record.id)}
          >
            详情
          </Button>
          
          {!record.isSystem && (
            <Popconfirm
              title="确定要删除此模板吗？"
              onConfirm={() => deleteTemplate(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: <Link to="/database-design">数据库设计</Link> },
          { title: '代码模板管理' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}><CodeOutlined /> 代码模板管理</Title>
          
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              创建模板
            </Button>
            <Button 
              icon={<CodeOutlined />}
              onClick={openGenerateModal}
            >
              AI生成模板
            </Button>
          </Space>
        </div>
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={templateList}
          loading={loading}
        />
      </Card>
      
      {selectedTemplate && (
        <Card title="模板详情" extra={
          <Button 
            icon={<CopyOutlined />} 
            onClick={() => copyToClipboard(JSON.stringify(selectedTemplateDetails, null, 2))}
          >
            复制全部
          </Button>
        }>
          {formLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin tip="加载模板详情..." />
            </div>
          ) : (
            <Collapse defaultActiveKey={['0']} accordion>
              {selectedTemplateDetails.map((detail, index) => (
                <Panel 
                  header={
                    <Space>
                      <FileTextOutlined />
                      <Text strong>{detail.templateDtlName}</Text>
                    </Space>
                  } 
                  key={index}
                >
                  <div style={{ position: 'relative' }}>
                    <Button
                      icon={<CopyOutlined />}
                      style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                      onClick={() => copyToClipboard(detail.templateContent)}
                    >
                      复制
                    </Button>
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '4px',
                      maxHeight: '400px',
                      overflow: 'auto'
                    }}>
                      {detail.templateContent}
                    </pre>
                  </div>
                </Panel>
              ))}
            </Collapse>
          )}
        </Card>
      )}
      
      <Modal
        title={modalType === 'create' ? "创建模板" : "AI生成模板"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            onClick={modalType === 'create' ? createTemplate : generateTemplate}
            loading={formLoading || streaming}
          >
            {modalType === 'create' ? "创建" : "生成"}
          </Button>
        ]}
        width={700}
      >
        {modalType === 'create' ? renderCreateForm() : renderGenerateForm()}
      </Modal>
    </div>
  );
};

export default CodeTemplateManager;