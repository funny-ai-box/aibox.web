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
  Modal,
  Steps,
  Result
} from 'antd';
import {
  SaveOutlined,
  FormOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  RobotOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  EditOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import surveyAPI from '../../api/surveyAPI';
import AIDesignChat from './components/AIDesignChat';
import SurveyEditor from './components/SurveyEditor';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

/**
 * 问卷创建/编辑页面 - 优化版
 * 使用步骤导航和卡片布局取代标签页
 */
const SurveyCreatePage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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
          // 移动到下一步
          setCurrentStep(1);
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
        
        // 显示发布成功弹窗
        Modal.success({
          title: '问卷发布成功',
          content: '您的问卷已成功发布，现在可以分享给用户填写了',
          okText: '返回列表',
          onOk: () => {
            navigate('/survey');
          }
        });
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
  
  // 渲染步骤内容
  const renderStepContent = () => {
    if (loading) {
      return <Spin tip="加载中..." />;
    }
    
    switch (currentStep) {
      case 0:
        return renderBasicForm();
      case 1:
        return renderAIDesignPanel();
      case 2:
        return renderSurveyEditor();
      default:
        return null;
    }
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
                {isEdit ? '保存并继续' : '创建问卷'}
              </Button>
              
              {isEdit && surveyData && (
                <Space>
                  <Button 
                    icon={<EyeOutlined />}
                    onClick={previewSurvey}
                  >
                    预览问卷
                  </Button>
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
          description="请先保存问卷基本信息，才能使用AI设计功能"
          type="info"
          showIcon
        />
      );
    }
    
    return (
      <Card>
        <AIDesignChat taskId={taskId} onDesignComplete={fetchSurveyDetail} />
        
        <Divider />
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setCurrentStep(0)}>
            <ArrowLeftOutlined /> 上一步
          </Button>
          <Button type="primary" onClick={() => setCurrentStep(2)}>
            继续编辑问卷 <EditOutlined />
          </Button>
        </div>
      </Card>
    );
  };
  
  // 渲染问卷编辑器
  const renderSurveyEditor = () => {
    if (!isEdit || !taskId) {
      return (
        <Alert
          message="保存基本信息"
          description="请先在基本信息步骤保存问卷基本信息，才能编辑问卷内容"
          type="info"
          showIcon
        />
      );
    }
    
    if (!surveyData) {
      return <Spin tip="加载问卷数据..." />;
    }
    
    return (
      <div>
        <SurveyEditor surveyData={surveyData} taskId={taskId} onSaved={fetchSurveyDetail} />
        
        <Divider />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          <Space>
            <Button onClick={() => setCurrentStep(1)}>
              <ArrowLeftOutlined /> 返回AI设计
            </Button>
            <Button icon={<EyeOutlined />} onClick={previewSurvey}>
              预览问卷
            </Button>
          </Space>
          
          {surveyData.status === 0 && (
            <Button 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={publishSurvey}
            >
              发布问卷
            </Button>
          )}
        </div>
      </div>
    );
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
        <Card style={{ marginBottom: '16px' }}>
          <Steps 
            current={currentStep}
            onChange={setCurrentStep}
            items={[
              {
                
title: '基本信息',
description: '设置问卷标题和说明',
icon: <FileTextOutlined />
},
{
title: 'AI智能设计',
description: '使用AI智能设计问卷结构',
icon: <RobotOutlined />,
disabled: !isEdit
},
{
title: '问卷编辑',
description: '编辑问卷的部分和字段',
icon: <FormOutlined />,
disabled: !isEdit
}
]}
/>
</Card>

{renderStepContent()}
</Spin>
</div>
);
};

export default SurveyCreatePage;