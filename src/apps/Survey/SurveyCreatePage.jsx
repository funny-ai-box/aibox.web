import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tabs,
  Form,
  Input,
  Space,
  Typography,
  Breadcrumb,
  message,
  Spin,
  Divider,
  Alert,
  Modal
} from 'antd';
import {
  SaveOutlined,
  FormOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  RobotOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import surveyAPI from '../../api/surveyAPI';
import AIDesignChat from './components/AIDesignChat';
import SurveyEditor from './components/SurveyEditor';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

/**
 * 问卷创建/编辑页面
 */
const SurveyCreatePage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [surveyData, setSurveyData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  
  // 初始化加载
  useEffect(() => {
    if (taskId) {
      setIsEdit(true);
      fetchSurveyDetail();
    } else {
      // 新建问卷，设置默认名称
      form.setFieldsValue({
        name: `问卷调查 ${new Date().toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}`,
        description: ''
      });
    }
  }, [taskId, form]);
  
  // 获取问卷详情
  const fetchSurveyDetail = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getTaskDetail(taskId);
      
      if (response.code === 200) {
        setSurveyData(response.data);
        form.setFieldsValue({
          name: response.data.name,
          description: response.data.description
        });
      } else {
        message.error(response.message || '获取问卷详情失败');
      }
    } catch (error) {
      message.error('获取问卷详情失败');
      console.error('获取问卷详情失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 保存问卷基本信息
  const handleSaveBasic = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      let response;
      if (isEdit) {
        response = await surveyAPI.updateTask({
          Id: taskId,
          Name: values.name,
          Description: values.description
        });
      } else {
        response = await surveyAPI.createTask({
          Name: values.name,
          Description: values.description
        });
      }
      
      if (response.code === 200) {
        message.success(isEdit ? '问卷信息已更新' : '问卷已创建');
        
        if (!isEdit) {
          // 创建成功后跳转到编辑页面
          navigate(`/survey/edit/${response.data}`);
        } else {
          // 刷新问卷数据
          fetchSurveyDetail();
        }
      } else {
        message.error(response.message || (isEdit ? '更新问卷失败' : '创建问卷失败'));
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(isEdit ? '更新问卷失败' : '创建问卷失败');
      console.error(isEdit ? '更新问卷失败:' : '创建问卷失败:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // 预览问卷
  const previewSurvey = () => {
    if (taskId) {
      navigate(`/survey/preview/${taskId}`);
    } else {
      message.warning('请先保存问卷');
    }
  };
  
  // 发布问卷
  const publishSurvey = async () => {
    if (!taskId) {
      message.warning('请先保存问卷');
      return;
    }
    
    try {
      const response = await surveyAPI.publishTask(taskId);
      
      if (response.code === 200) {
        message.success('问卷已发布');
        // 跳转到问卷列表
        navigate('/survey');
      } else {
        message.error(response.message || '发布问卷失败');
      }
    } catch (error) {
      message.error('发布问卷失败');
      console.error('发布问卷失败:', error);
    }
  };
  
  // 返回列表
  const goBack = () => {
    navigate('/survey');
  };
  
  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // 渲染基本信息表单
  const renderBasicForm = () => {
    return (
      <Card>
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="问卷标题"
            rules={[{ required: true, message: '请输入问卷标题' }]}
          >
            <Input placeholder="请输入问卷标题" maxLength={100} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="问卷描述"
          >
            <TextArea 
              placeholder="请输入问卷描述" 
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                onClick={handleSaveBasic}
                loading={saving}
              >
                保存信息
              </Button>
              
              {isEdit && surveyData && (
                <Space>
                  <Button 
                    icon={<EyeOutlined />}
                    onClick={previewSurvey}
                  >
                    预览问卷
                  </Button>
                  
                  {surveyData.status === 0 && (
                    <Button 
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={publishSurvey}
                    >
                      发布问卷
                    </Button>
                  )}
                </Space>
              )}
            </Space>
          </Form.Item>
          
        </Form>
      </Card>
    );
  };
  
  // 渲染AI设计面板
  const renderAIDesignPanel = () => {
    if (!isEdit || !taskId) {
      return (
        <Alert
          message="保存基本信息"
          description="请先在基本信息标签页保存问卷基本信息，才能使用AI设计功能"
          type="info"
          showIcon
        />
      );
    }
    
    return <AIDesignChat taskId={taskId} onDesignComplete={fetchSurveyDetail} />;
  };
  
  // 渲染问卷编辑器
  const renderSurveyEditor = () => {
    if (!isEdit || !taskId) {
      return (
        <Alert
          message="保存基本信息"
          description="请先在基本信息标签页保存问卷基本信息，才能编辑问卷内容"
          type="info"
          showIcon
        />
      );
    }
    
    if (!surveyData) {
      return <Spin tip="加载问卷数据..." />;
    }
    
    return <SurveyEditor surveyData={surveyData} taskId={taskId} onSaved={fetchSurveyDetail} />;
  };
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: <Link to="/survey">问卷列表</Link> },
          { title: isEdit ? '编辑问卷' : '创建问卷' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>{isEdit ? '编辑问卷' : '创建问卷'}</Title>
          
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={goBack}
            >
              返回列表
            </Button>
          </Space>
        </div>
      </Card>
      
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <FormOutlined />
                基本信息
              </span>
            }
            key="basic"
          >
            {renderBasicForm()}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <RobotOutlined />
                AI智能设计
              </span>
            }
            key="ai-design"
            disabled={!isEdit}
          >
            {renderAIDesignPanel()}
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <FormOutlined />
                问卷编辑
              </span>
            }
            key="editor"
            disabled={!isEdit}
          >
            {renderSurveyEditor()}
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default SurveyCreatePage;