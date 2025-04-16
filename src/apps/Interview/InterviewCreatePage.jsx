import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Radio,
  Typography,
  Divider,
  Alert,
  message,
  Select,
  Upload,
  Breadcrumb,
  Tooltip
} from 'antd';
import {
  SaveOutlined,
  TeamOutlined,
  LeftOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import interviewAPI from '../../api/interviewAPI';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * 创建面试场景页面
 */
const InterviewCreatePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [submitting, setSubmitting] = useState(false);
  
  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // 调整职位级别格式
      const jobPositions = values.jobPositions.map(position => ({
        Name: position.name,
        Level: parseInt(position.level)
      }));
      
      const submitData = {
        Name: values.name,
        Description: values.description,
        InterviewerName: values.interviewerName,
        InterviewerGender: parseInt(values.interviewerGender),
        JobPositions: jobPositions
      };
      
      const response = await interviewAPI.createScenario(submitData);
      
      if (response.code === 200) {
        message.success('面试场景创建成功');
        // 跳转到场景详情页
        navigate(`/interview/scenario/${response.data.id}`);
      } else {
        message.error(response.message || '创建面试场景失败');
      }
    } catch (error) {
      console.error('创建面试场景失败:', error);
      message.error('创建面试场景失败');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 返回列表页
  const goBack = () => {
    navigate('/interview');
  };
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: <Link to="/interview">AI面试</Link> },
          { title: '创建面试场景' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Button 
            icon={<LeftOutlined />} 
            onClick={goBack}
            style={{ marginRight: '16px' }}
          >
            返回列表
          </Button>
          <Title level={4} style={{ margin: 0 }}>创建面试场景</Title>
        </div>
        
        <Alert
          message="温馨提示"
          description="创建面试场景后，您可以上传文档或输入文本作为面试知识库，系统会基于这些内容生成相应的面试题目。"
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            interviewerGender: 1,
            jobPositions: [{ name: '', level: '1' }]
          }}
        >
          <Title level={5}>基本信息</Title>
          <Form.Item
            name="name"
            label="场景名称"
            rules={[{ required: true, message: '请输入面试场景名称' }]}
          >
            <Input placeholder="请输入面试场景名称，例如：后端开发工程师面试" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="场景描述"
          >
            <TextArea 
              placeholder="请输入面试场景描述，包括面试目的、适用范围等"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          
          <Divider />
          <Title level={5}>面试官设置</Title>
          
          <Form.Item
            name="interviewerName"
            label="面试官姓名"
            rules={[{ required: true, message: '请输入面试官姓名' }]}
          >
            <Input placeholder="请输入面试官姓名" />
          </Form.Item>
          
          <Form.Item
            name="interviewerGender"
            label="面试官性别"
            rules={[{ required: true, message: '请选择面试官性别' }]}
          >
            <Radio.Group>
              <Radio value={1}>男</Radio>
              <Radio value={2}>女</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Divider />
          <Title level={5}>
            <Space>
              职位设置
              <Tooltip title="添加多个职位可以针对不同岗位级别设置不同的面试题目">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            </Space>
          </Title>
          
          <Form.List name="jobPositions">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, 'name']}
                      fieldKey={[field.fieldKey, 'name']}
                      rules={[{ required: true, message: '请输入职位名称' }]}
                      style={{ width: '300px' }}
                    >
                      <Input placeholder="职位名称，例如：后端开发工程师" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'level']}
                      fieldKey={[field.fieldKey, 'level']}
                      rules={[{ required: true, message: '请选择职位级别' }]}
                    >
                      <Select placeholder="职位级别" style={{ width: 120 }}>
                        <Option value="1">初级</Option>
                        <Option value="2">中级</Option>
                        <Option value="3">高级</Option>
                        <Option value="4">专家</Option>
                      </Select>
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        style={{ color: '#ff4d4f' }}
                      />
                    ) : null}
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                  >
                    添加职位
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={submitting}
            >
              创建面试场景
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default InterviewCreatePage;