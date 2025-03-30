import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Form,
  Input,
  InputNumber,
  Radio,
  Checkbox,
  Select,
  Rate,
  DatePicker,
  TimePicker,
  Space,
  Divider,
  Upload,
  message,
  Spin,
  Result,
  Alert,
  Breadcrumb
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UploadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import surveyAPI from '../../api/surveyAPI';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * 问卷预览页面 - 优化版
 * 使用卡片从上到下显示问卷内容，而不是使用标签页
 */
const SurveyPreviewPage = () => {
  const { taskId, shareCode } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // 初始化加载
  useEffect(() => {
    // 判断是预览模式还是填写模式
    setIsPreviewMode(!!taskId);
    
    // 加载问卷数据
    if (taskId) {
      fetchSurveyById(taskId);
    } else if (shareCode) {
      fetchSurveyByShareCode(shareCode);
    }
  }, [taskId, shareCode]);
  
  // 获取问卷详情（通过ID）
  const fetchSurveyById = async (id) => {
    try {
      setLoading(true);
      const response = await surveyAPI.getTaskDetail(id);
      
      if (response.code === 200) {
        setSurveyData(response.data);
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
  
  // 获取问卷详情（通过分享码）
  const fetchSurveyByShareCode = async (code) => {
    try {
      setLoading(true);
      const response = await surveyAPI.getTaskByShareCode(code);
      
      if (response.code === 200) {
        setSurveyData(response.data);
        
        // 检查问卷状态
        if (response.data.status !== 1) {
          message.warning('当前问卷未开放填写');
          setSubmitted(true); // 使用submitted状态来显示不可填写提示
        }
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
  
  // 提交问卷
  const handleSubmit = async () => {
    try {
      // 验证表单
      await form.validateFields();
      
      // 获取表单数据
      const values = form.getFieldsValue();
      
      // 转换为后端需要的格式
      const fieldValues = [];
      
      // 遍历所有字段的值
      Object.entries(values).forEach(([fieldKey, value]) => {
        // 查找对应的字段ID
        const field = findFieldByKey(fieldKey);
        
        if (field) {
          // 特殊处理某些类型的值
          let processedValue = value;
          
          // 处理日期类型
          if (field.type === 'Date' && value) {
            processedValue = value.format('YYYY-MM-DD');
          }
          
          // 处理时间类型
          if (field.type === 'Time' && value) {
            processedValue = value.format('HH:mm:ss');
          }
          
          // 处理日期时间类型
          if (field.type === 'DateTime' && value) {
            processedValue = value.format('YYYY-MM-DD HH:mm:ss');
          }
          
          // 处理多选框类型（数组转字符串）
          if (field.type === 'Checkbox' && Array.isArray(value)) {
            processedValue = value.join(',');
          }
          
          // 添加到字段值列表
          fieldValues.push({
            FieldId: field.id,
            Value: processedValue === undefined || processedValue === null ? '' : String(processedValue)
          });
        }
      });
      
      // 如果是预览模式，只显示数据而不提交
      if (isPreviewMode) {
        console.log('预览模式 - 表单数据:', fieldValues);
        message.success('预览模式 - 表单验证通过');
        return;
      }
      
      // 提交数据
      setSubmitting(true);
      
      const response = await surveyAPI.submitResponse({
        TaskId: surveyData.id,
        FieldValues: fieldValues
      });
      
      if (response.code === 200) {
        message.success('问卷提交成功');
        setSubmitted(true);
      } else {
        message.error(response.message || '提交问卷失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误，自动滚动到第一个错误字段
        message.error('请检查填写的内容');
      } else {
        message.error('提交问卷失败');
        console.error('提交问卷失败:', error);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // 通过字段标识符查找字段
  const findFieldByKey = (fieldKey) => {
    if (!surveyData || !surveyData.tabs) return null;
    
    for (const tab of surveyData.tabs) {
      for (const field of tab.fields) {
        if (field.fieldKey === fieldKey) {
          return field;
        }
      }
    }
    
    return null;
  };
  
  // 重新填写
  const handleRefill = () => {
    form.resetFields();
    setSubmitted(false);
  };
  
  // 返回上一页
  const goBack = () => {
    navigate(-1);
  };
  
  // 编辑问卷
  const editSurvey = () => {
    if (taskId) {
      navigate(`/survey/edit/${taskId}`);
    }
  };
  
  // 渲染字段
  const renderField = (field) => {
    const { id, fieldKey, name, type, isRequired, config, placeholder } = field;
    
    // 基础表单项属性
    const fieldProps = {
      name: fieldKey,
      label: (
        <Space>
          <span>{name}</span>
          {isRequired && <span style={{ color: '#ff4d4f' }}>*</span>}
        </Space>
      ),
      rules: isRequired ? [{ required: true, message: `请${getRequiredMessage(type, name)}` }] : undefined,
      extra: null
    };
    
    // 不同类型的字段渲染
    switch (type) {
      case 'SingleLineText':
        return (
          <Form.Item {...fieldProps}>
            <Input 
              placeholder={placeholder} 
              maxLength={config?.maxLength} 
              showCount={!!config?.maxLength}
            />
          </Form.Item>
        );
        
      case 'MultiLineText':
        return (
          <Form.Item {...fieldProps}>
            <TextArea 
              placeholder={placeholder} 
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={config?.maxLength}
              showCount={!!config?.maxLength}
            />
          </Form.Item>
        );
        
      case 'Number':
        return (
          <Form.Item {...fieldProps}>
            <InputNumber 
              placeholder={placeholder} 
              style={{ width: '100%' }}
              min={config?.min}
              max={config?.max}
              step={config?.step}
            />
          </Form.Item>
        );
        
      case 'Radio':
        return (
          <Form.Item {...fieldProps}>
            <Radio.Group>
              {config?.options?.map(option => (
                <Radio key={option.value} value={option.value}>{option.label}</Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );
        
      case 'Checkbox':
        return (
          <Form.Item {...fieldProps}>
            <Checkbox.Group>
              {config?.options?.map(option => (
                <Checkbox key={option.value} value={option.value}>{option.label}</Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        );
        
      case 'Select':
        return (
          <Form.Item {...fieldProps}>
            <Select placeholder={placeholder} style={{ width: '100%' }}>
              {config?.options?.map(option => (
                <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        );
        
      case 'Date':
        return (
          <Form.Item {...fieldProps}>
            <DatePicker 
              placeholder={placeholder || '请选择日期'}
              style={{ width: '100%' }}
            />
          </Form.Item>
        );
        
      case 'Time':
        return (
          <Form.Item {...fieldProps}>
            <TimePicker 
              placeholder={placeholder || '请选择时间'}
              style={{ width: '100%' }}
            />
          </Form.Item>
        );
        
      case 'DateTime':
        return (
          <Form.Item {...fieldProps}>
            <DatePicker 
              showTime
              placeholder={placeholder || '请选择日期和时间'}
              style={{ width: '100%' }}
            />
          </Form.Item>
        );
        
      case 'Rating':
        return (
          <Form.Item {...fieldProps}>
            <Rate count={config?.max || 5} />
          </Form.Item>
        );
        
      case 'ImageUpload':
        return (
          <Form.Item {...fieldProps}>
            <Upload
              listType="picture-card"
              beforeUpload={file => {
                // 在预览模式下不实际上传
                message.success('预览模式：文件已选择但不会上传');
                return false;
              }}
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
            {config?.maxFileSize && (
              <div style={{ color: '#999', fontSize: '12px' }}>
                文件大小不超过 {config.maxFileSize}KB
                {config?.allowedFileTypes?.length > 0 && (
                  <>, 支持的格式: {config.allowedFileTypes.join(', ')}</>
                )}
              </div>
            )}
          </Form.Item>
        );
        
      default:
        return (
          <Form.Item {...fieldProps}>
            <Input placeholder={placeholder} />
          </Form.Item>
        );
    }
  };
  
  // 获取必填提示消息
  const getRequiredMessage = (type, name) => {
    switch (type) {
      case 'SingleLineText':
      case 'MultiLineText':
        return `输入${name}`;
      case 'Number':
        return `输入${name}`;
      case 'Radio':
        return `选择${name}`;
      case 'Checkbox':
        return `选择${name}`;
      case 'Select':
        return `选择${name}`;
      case 'Date':
        return `选择${name}`;
      case 'Time':
        return `选择${name}`;
      case 'DateTime':
        return `选择${name}`;
      case 'Rating':
        return `评分${name}`;
      case 'ImageUpload':
        return `上传${name}`;
      default:
        return `填写${name}`;
    }
  };
  
  // 渲染标签页内容
  const renderSectionContent = (tab) => {
    if (!tab?.fields?.length) {
      return <div style={{ padding: '20px 0', textAlign: 'center' }}>该部分没有字段</div>;
    }
    
    return tab.fields.map(field => renderField(field));
  };
  
  // 渲染已提交结果
  const renderSubmittedResult = () => {
    // 问卷未开放
    if (surveyData?.status !== 1) {
      return (
        <Result
          status="warning"
          title="问卷未开放填写"
          subTitle="当前问卷暂未开放或已关闭，请稍后再试"
        />
      );
    }
    
    // 提交成功
    return (
      <Result
        status="success"
        title="问卷提交成功"
        subTitle="感谢您的填写！"
        extra={[
          <Button type="primary" key="again" onClick={handleRefill}>
            再次填写
          </Button>
        ]}
      />
    );
  };
  
  // 渲染问卷内容
  const renderSurveyContent = () => {
    if (!surveyData) {
      return null;
    }
    
    if (submitted) {
      return renderSubmittedResult();
    }
    
    return (
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
      >
        {/* 从上到下以卡片形式显示每个部分 */}
        {surveyData.tabs?.map((tab, index) => (
          <Card 
            key={tab.id} 
            title={tab.name}
            style={{ marginBottom: '20px' }}
            headStyle={{ backgroundColor: '#f5f5f5' }}
          >
            {renderSectionContent(tab)}
          </Card>
        ))}
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleSubmit}
            loading={submitting}
            disabled={isPreviewMode && surveyData.status !== 1}
          >
            {isPreviewMode ? '预览提交' : '提交问卷'}
          </Button>
        </div>
      </Form>
    );
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          ...(isPreviewMode ? [{ title: <Link to="/survey">问卷列表</Link> }] : []),
          { title: isPreviewMode ? '问卷预览' : '问卷填写' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0 }}>{surveyData?.name || '问卷调查'}</Title>
          
          <Space>
            {isPreviewMode && (
              <Button
                icon={<EditOutlined />}
                onClick={editSurvey}
              >
                编辑问卷
              </Button>
            )}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={goBack}
            >
              返回
            </Button>
          </Space>
        </div>
        
        {surveyData?.description && (
          <Paragraph style={{ marginBottom: '16px' }}>
            {surveyData.description}
          </Paragraph>
        )}
      </Card>
      
      <Spin spinning={loading}>
        <Card>
          {renderSurveyContent()}
        </Card>
      </Spin>
    </div>
  );
};

export default SurveyPreviewPage;