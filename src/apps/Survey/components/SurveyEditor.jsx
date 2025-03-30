import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Typography,
  Divider,
  message,
  InputNumber,
  List,
  Collapse,
  Modal,
  Tooltip,
  Empty,
  Spin,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EditOutlined,
  SaveOutlined,
  PlusCircleOutlined,
  FormOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import surveyAPI from '../../../api/surveyAPI';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;
const { confirm } = Modal;

/**
 * 问卷编辑器组件 - 优化版
 * 使用卡片从上到下显示问卷内容，而不是使用标签页
 * 
 * @param {Object} props
 * @param {Object} props.surveyData - 问卷数据
 * @param {number} props.taskId - 问卷任务ID
 * @param {Function} props.onSaved - 保存成功后的回调
 */
const SurveyEditor = ({ surveyData, taskId, onSaved }) => {
  const [editingTabIndex, setEditingTabIndex] = useState(-1);
  const [editingFieldIndex, setEditingFieldIndex] = useState(-1);
  const [tabs, setTabs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tabForm] = Form.useForm();
  const [fieldForm] = Form.useForm();
  
  // 初始化问卷数据
  useEffect(() => {
    if (surveyData && surveyData.tabs) {
      setTabs(surveyData.tabs);
    }
  }, [surveyData]);
  
  // 添加新标签页（现在称为"部分"）
  const addNewTab = () => {
    setEditingTabIndex(-1);
    tabForm.resetFields();
    setModalVisible(true);
  };
  
  // 编辑标签页
  const editTab = (tab, index) => {
    setEditingTabIndex(index);
    tabForm.setFieldsValue({
      name: tab.name
    });
    setModalVisible(true);
  };
  
  // 确认删除标签页
  const confirmDeleteTab = (tabIndex) => {
    confirm({
      title: '确认删除此部分',
      icon: <ExclamationCircleOutlined />,
      content: '删除此部分将同时删除该部分下的所有字段，确定要删除吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteTab(tabIndex);
      }
    });
  };
  
  // 删除标签页
  const deleteTab = (tabIndex) => {
    const newTabs = [...tabs];
    
    // 标记为删除操作
    newTabs[tabIndex] = {
      ...newTabs[tabIndex],
      operation: 'delete'
    };
    
    setTabs(newTabs);
  };
  
  // 上移标签页
  const moveTabUp = (tabIndex) => {
    if (tabIndex === 0) return;
    
    const newTabs = [...tabs];
    
    const temp = { ...newTabs[tabIndex] };
    newTabs[tabIndex] = { ...newTabs[tabIndex - 1] };
    newTabs[tabIndex - 1] = temp;
    
    // 更新顺序号
    newTabs[tabIndex].orderNo = tabIndex + 1;
    newTabs[tabIndex - 1].orderNo = tabIndex;
    
    setTabs(newTabs);
  };
  
  // 下移标签页
  const moveTabDown = (tabIndex) => {
    if (tabIndex === tabs.length - 1) return;
    
    const newTabs = [...tabs];
    
    const temp = { ...newTabs[tabIndex] };
    newTabs[tabIndex] = { ...newTabs[tabIndex + 1] };
    newTabs[tabIndex + 1] = temp;
    
    // 更新顺序号
    newTabs[tabIndex].orderNo = tabIndex + 1;
    newTabs[tabIndex + 1].orderNo = tabIndex + 2;
    
    setTabs(newTabs);
  };
  
  // 添加新字段
  const addNewField = (tabId, tabIndex) => {
    setEditingFieldIndex(-1);
    
    // 获取当前标签页下的字段数量，用于设置新字段的默认顺序号
    const fieldsCount = tabs[tabIndex].fields ? tabs[tabIndex].fields.length : 0;
    
    fieldForm.resetFields();
    fieldForm.setFieldsValue({
      tabId,
      orderNo: fieldsCount + 1,
      isRequired: false,
      type: 'SingleLineText',
      config: {
        maxLength: 100
      }
    });
    
    setFieldModalVisible(true);
  };
  
  // 编辑字段
  const editField = (field, tabIndex, fieldIndex) => {
    setEditingFieldIndex({ tabIndex, fieldIndex });
    
    // 转换config为适当的格式
    let formConfig = { ...field.config };
    
    // 特殊处理options，确保表单中可以正确显示
    if (field.type === 'Radio' || field.type === 'Checkbox' || field.type === 'Select') {
      formConfig.optionsText = (field.config.options || [])
        .map(option => `${option.value}=${option.label}`)
        .join('\n');
    }
    
    fieldForm.setFieldsValue({
      tabId: field.tabId,
      fieldKey: field.fieldKey,
      name: field.name,
      type: field.type,
      isRequired: field.isRequired,
      placeholder: field.placeholder,
      orderNo: field.orderNo,
      config: formConfig
    });
    
    setFieldModalVisible(true);
  };
  
  // 确认删除字段
  const confirmDeleteField = (tabIndex, fieldIndex) => {
    confirm({
      title: '确认删除字段',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该字段吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteField(tabIndex, fieldIndex);
      }
    });
  };
  
  // 删除字段
  const deleteField = (tabIndex, fieldIndex) => {
    const newTabs = [...tabs];
    const tab = { ...newTabs[tabIndex] };
    const fields = [...tab.fields];
    
    // 标记为删除操作
    fields[fieldIndex] = {
      ...fields[fieldIndex],
      operation: 'delete'
    };
    
    // 更新字段列表
    tab.fields = fields;
    newTabs[tabIndex] = tab;
    
    setTabs(newTabs);
  };
  
  // 上移字段
  const moveFieldUp = (tabIndex, fieldIndex) => {
    if (fieldIndex === 0) return;
    
    const newTabs = [...tabs];
    const tab = { ...newTabs[tabIndex] };
    const fields = [...tab.fields];
    
    const temp = { ...fields[fieldIndex] };
    fields[fieldIndex] = { ...fields[fieldIndex - 1] };
    fields[fieldIndex - 1] = temp;
    
    // 更新顺序号
    fields[fieldIndex].orderNo = fieldIndex + 1;
    fields[fieldIndex - 1].orderNo = fieldIndex;
    
    // 更新字段列表
    tab.fields = fields;
    newTabs[tabIndex] = tab;
    
    setTabs(newTabs);
  };
  
  // 下移字段
  const moveFieldDown = (tabIndex, fieldIndex) => {
    const tab = tabs[tabIndex];
    if (fieldIndex === tab.fields.length - 1) return;
    
    const newTabs = [...tabs];
    const newTab = { ...newTabs[tabIndex] };
    const fields = [...newTab.fields];
    
    const temp = { ...fields[fieldIndex] };
    fields[fieldIndex] = { ...fields[fieldIndex + 1] };
    fields[fieldIndex + 1] = temp;
    
    // 更新顺序号
    fields[fieldIndex].orderNo = fieldIndex + 1;
    fields[fieldIndex + 1].orderNo = fieldIndex + 2;
    
    // 更新字段列表
    newTab.fields = fields;
    newTabs[tabIndex] = newTab;
    
    setTabs(newTabs);
  };
  
  // 保存标签页
  const saveTab = async () => {
    try {
      const values = await tabForm.validateFields();
      
      const newTabs = [...tabs];
      
      if (editingTabIndex === -1) {
        // 添加新标签页
        const newTab = {
          id: `temp-${Date.now()}`, // 临时ID，保存时会被替换
          taskId,
          name: values.name,
          orderNo: tabs.length + 1,
          fields: [],
          operation: 'add'
        };
        
        newTabs.push(newTab);
      } else {
        // 编辑现有标签页
        newTabs[editingTabIndex] = {
          ...newTabs[editingTabIndex],
          name: values.name,
          operation: newTabs[editingTabIndex].operation === 'add' 
            ? 'add' // 如果是新添加的，保持add操作
            : 'update' // 否则是更新操作
        };
      }
      
      setTabs(newTabs);
      setModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };
  
  // 保存字段
  const saveField = async () => {
    try {
      const values = await fieldForm.validateFields();
      
      // 处理选项类型的配置
      let config = { ...values.config };
      
      // 处理Radio/Checkbox/Select类型的选项
      if (['Radio', 'Checkbox', 'Select'].includes(values.type) && values.config.optionsText) {
        const optionsLines = values.config.optionsText.split('\n').filter(line => line.trim());
        
        const options = optionsLines.map(line => {
          const [value, label] = line.split('=').map(part => part.trim());
          return { value, label: label || value };
        });
        
        config.options = options;
        delete config.optionsText;
      }
      
      // 特殊处理Number类型
      if (values.type === 'Number') {
        config.min = Number(config.min) || 0;
        config.max = Number(config.max) || 1000000;
        config.step = Number(config.step) || 1;
      }
      
      // 特殊处理Rating类型
      if (values.type === 'Rating') {
        config.min = Number(config.min) || 1;
        config.max = Number(config.max) || 5;
      }
      
      const newTabs = [...tabs];
      
      // 生成唯一的fieldKey
      const fieldKey = values.fieldKey || `field_${Date.now()}`;
      

      
      if (editingFieldIndex === -1) {
        // 添加新字段
        const tabIndex = newTabs.findIndex(tab => tab.id === values.tabId);
        
        if (tabIndex === -1) {
          throw new Error('找不到指定的部分');
        }
        
        const newField = {
          id: `temp-${Date.now()}`, // 临时ID，保存时会被替换
          taskId,
          tabId: values.tabId,
          fieldKey,
          name: values.name,
          type: values.type,
          isRequired: values.isRequired,
          config,
          placeholder: values.placeholder,
          orderNo: values.orderNo,
          operation: 'add'
        };
        
        // 添加到指定标签页
        const tab = { ...newTabs[tabIndex] };
        tab.fields = [...(tab.fields || []), newField];
        newTabs[tabIndex] = tab;
      } else {
        // 编辑现有字段
        const { tabIndex, fieldIndex } = editingFieldIndex;
        const tab = { ...newTabs[tabIndex] };
        const fields = [...tab.fields];
        
        fields[fieldIndex] = {
          ...fields[fieldIndex],
          fieldKey,
          name: values.name,
          type: values.type,
          isRequired: values.isRequired,
          config,
          placeholder: values.placeholder,
          orderNo: values.orderNo,
          operation: fields[fieldIndex].operation === 'add' 
            ? 'add' // 如果是新添加的，保持add操作
            : 'update' // 否则是更新操作
        };
        
        tab.fields = fields;
        newTabs[tabIndex] = tab;
      }
      
      setTabs(newTabs);
      setFieldModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };
  
  // 渲染字段配置项
  const renderFieldConfigForm = (type) => {
    switch (type) {
      case 'SingleLineText':
      case 'MultiLineText':
        return (
          <Form.Item
            name={['config', 'maxLength']}
            label="最大长度"
            rules={[{ required: true, message: '请输入最大长度' }]}
          >
            <InputNumber min={1} max={1000} />
          </Form.Item>
        );
        
      case 'Number':
        return (
          <>
            <Form.Item name={['config', 'min']} label="最小值">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name={['config', 'max']} label="最大值">
              <InputNumber min={1} max={1000000} />
            </Form.Item>
            <Form.Item name={['config', 'step']} label="步长">
              <InputNumber min={1} />
            </Form.Item>
          </>
        );
        
      case 'Radio':
      case 'Checkbox':
      case 'Select':
        return (
          <Form.Item
            name={['config', 'optionsText']}
            label="选项列表"
            rules={[{ required: true, message: '请输入选项' }]}
            extra="每行一个选项，格式为'值=显示文本'，若无等号则值和显示文本相同"
          >
            <TextArea rows={5} placeholder="选项1=显示文本1&#10;选项2=显示文本2" />
          </Form.Item>
        );
        
      case 'Rating':
        return (
          <>
            <Form.Item name={['config', 'min']} label="最小值" initialValue={1}>
              <InputNumber min={0} max={5} />
            </Form.Item>
            <Form.Item name={['config', 'max']} label="最大值" initialValue={5}>
              <InputNumber min={1} max={10} />
            </Form.Item>
          </>
        );
        
      case 'ImageUpload':
        return (
          <>
            <Form.Item name={['config', 'maxFileSize']} label="最大文件大小(KB)" initialValue={5120}>
              <InputNumber min={1} max={5120} />
            </Form.Item>
            <Form.Item name={['config', 'allowedFileTypes']} label="允许的文件类型">
              <Select mode="tags" placeholder="输入文件类型，如jpg">
                <Option value="jpg">jpg</Option>
                <Option value="jpeg">jpeg</Option>
                <Option value="png">png</Option>
                <Option value="gif">gif</Option>
              </Select>
            </Form.Item>
          </>
        );
        
      default:
        return null;
    }
  };
  
  // 保存所有问卷数据
  const saveAllData = async () => {
    try {
      setSaving(true);
      
      // 构建要保存的数据
      const tabsToSave = tabs
        .filter(tab => tab.operation !== 'delete') // 过滤掉已删除的标签页
        .map(tab => {
          // 只保留需要的字段
          const { id, name, orderNo, operation } = tab;
          
          // 处理字段数据
          const fields = tab.fields
            .filter(field => field.operation !== 'delete') // 过滤掉已删除的字段
            .map(field => {
              const { 
                id, tabId, fieldKey, name, type, isRequired, 
                config, placeholder, orderNo, operation 
              } = field;
              
              return {
                id,
                tabId,
                fieldKey,
                name,
                type,
                isRequired,
                config,
                placeholder,
                orderNo,
                operation
              };
            });
          
          return {
            id,
            name,
            orderNo,
            operation,
            fields
          };
        });
      
      console.log('Saving data:', tabsToSave);
      
      // TODO: 这里调用API保存数据
      // 实际中需要调用后端API保存数据
      
      // 模拟保存成功
      message.success('问卷内容保存成功');
      
      // 保存成功后回调
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('保存问卷数据失败:', error);
      message.error('保存问卷数据失败');
    } finally {
      setSaving(false);
    }
  };
  
  // 渲染字段配置预览
  const renderFieldConfigPreview = (field) => {
    const { type, config } = field;
    
    switch (type) {
      case 'SingleLineText':
      case 'MultiLineText':
        return <Text type="secondary">最大长度: {config.maxLength}</Text>;
        
      case 'Number':
        return (
          <Space>
            {config.min !== undefined && <Text type="secondary">最小值: {config.min}</Text>}
            {config.max !== undefined && <Text type="secondary">最大值: {config.max}</Text>}
            {config.step !== undefined && <Text type="secondary">步长: {config.step}</Text>}
          </Space>
        );
        
      case 'Radio':
      case 'Checkbox':
      case 'Select':
        return (
          <Text type="secondary">
            选项数: {config.options ? config.options.length : 0}
          </Text>
        );
        
      case 'Rating':
        return (
          <Space>
            <Text type="secondary">评分范围: {config.min || 1} - {config.max || 5}</Text>
          </Space>
        );
        
      case 'ImageUpload':
        return (
          <Space>
            <Text type="secondary">最大文件大小: {config.maxFileSize || 5120}KB</Text>
            {config.allowedFileTypes && (
              <Text type="secondary">
                允许的文件类型: {config.allowedFileTypes.join(', ')}
              </Text>
            )}
          </Space>
        );
        
      default:
        return null;
    }
  };
  
  // 渲染字段弹框
  const renderFieldModal = () => {
    return (
      <Modal
        title={editingFieldIndex === -1 ? '添加字段' : '编辑字段'}
        open={fieldModalVisible}
        onOk={saveField}
        onCancel={() => setFieldModalVisible(false)}
        width={600}
      >
        <Form
          form={fieldForm}
          layout="vertical"
        >
          <Form.Item name="tabId" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            name="fieldKey"
            label="字段标识符"
            rules={[
              { required: true, message: '请输入字段标识符' },
              { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '字段标识符必须以字母开头，只能包含字母、数字和下划线' }
            ]}
            tooltip="字段的唯一标识，用于数据存储和代码引用"
          >
            <Input placeholder="例如: username" disabled={editingFieldIndex !== -1} />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="字段名称"
            rules={[{ required: true, message: '请输入字段名称' }]}
          >
            <Input placeholder="例如: 用户名" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="字段类型"
            rules={[{ required: true, message: '请选择字段类型' }]}
          >
            <Select>
              <Option value="SingleLineText">单行文本</Option>
              <Option value="MultiLineText">多行文本</Option>
              <Option value="Number">数字输入</Option>
              <Option value="Radio">单选框</Option>
              <Option value="Checkbox">多选框</Option>
              <Option value="Select">下拉选择</Option>
              <Option value="Date">日期选择</Option>
              <Option value="Time">时间选择</Option>
              <Option value="DateTime">日期时间选择</Option>
              <Option value="ImageUpload">图片上传</Option>
              <Option value="Rating">评分</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isRequired"
            label="是否必填"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="placeholder"
            label="占位提示文本"
          >
            <Input placeholder="请输入占位提示文本" />
          </Form.Item>
          
          <Form.Item
            name="orderNo"
            label="排序号"
            rules={[{ required: true, message: '请输入排序号' }]}
          >
            <InputNumber min={1} />
          </Form.Item>
          
          <Divider>字段配置</Divider>
          
          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
            {({ getFieldValue }) => renderFieldConfigForm(getFieldValue('type'))}
          </Form.Item>
        </Form>
      </Modal>
    );
  };
  
  // 渲染一个部分（之前的标签页）的内容
  const renderSection = (tab, index) => {
    if (tab.operation === 'delete') {
      return null; // 跳过被删除的部分
    }
    
    const visibleFields = tab.fields?.filter(field => field.operation !== 'delete') || [];
    
    return (
      <Card 
        key={tab.id}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{tab.name}</span>
            <Space>
              <Tooltip title="上移部分">
                <Button 
                  icon={<ArrowUpOutlined />} 
                  size="small"
                  disabled={index === 0}
                  onClick={() => moveTabUp(index)}
                />
              </Tooltip>
              <Tooltip title="下移部分">
                <Button 
                  icon={<ArrowDownOutlined />} 
                  size="small"
                  disabled={index === tabs.filter(t => t.operation !== 'delete').length - 1}
                  onClick={() => moveTabDown(index)}
                />
              </Tooltip>
              <Tooltip title="编辑部分">
                <Button 
                  icon={<EditOutlined />} 
                  size="small"
                  onClick={() => editTab(tab, index)}
                />
              </Tooltip>
              <Tooltip title="删除部分">
                <Button 
                  icon={<DeleteOutlined />} 
                  danger
                  size="small"
                  onClick={() => confirmDeleteTab(index)}
                />
              </Tooltip>
            </Space>
          </div>
        }
        style={{ marginBottom: '16px'}}
        extra={
          <Button 
            type="primary" 
            style={{ marginLeft: '8px' }}
            icon={<PlusOutlined />}
            onClick={() => addNewField(tab.id, index)}
          >
            添加字段
          </Button>
        }
      >
        {visibleFields.length === 0 ? (
          <Empty description="暂无字段，请添加字段" />
        ) : (
          <List
            bordered
            dataSource={visibleFields}
            renderItem={(field, fieldIndex) => (
              <List.Item
                actions={[
                  <Tooltip title="上移">
                    <Button
                      icon={<ArrowUpOutlined />}
                      disabled={fieldIndex === 0}
                      onClick={() => moveFieldUp(index, tab.fields.findIndex(f => f.id === field.id))}
                    />
                  </Tooltip>,
                  <Tooltip title="下移">
                    <Button
                      icon={<ArrowDownOutlined />}
                      disabled={fieldIndex === visibleFields.length - 1}
                      onClick={() => moveFieldDown(index, tab.fields.findIndex(f => f.id === field.id))}
                    />
                  </Tooltip>,
                  <Tooltip title="编辑">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => editField(field, index, tab.fields.findIndex(f => f.id === field.id))}
                    />
                  </Tooltip>,
                  <Tooltip title="删除">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => confirmDeleteField(index, tab.fields.findIndex(f => f.id === field.id))}
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{field.name}</Text>
                      {field.isRequired && <Text type="danger">(必填)</Text>}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">类型: {field.type}</Text>
                      <Text type="secondary">字段标识: {field.fieldKey}</Text>
                      {field.placeholder && <Text type="secondary">提示文本: {field.placeholder}</Text>}
                      {renderFieldConfigPreview(field)}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    );
  };
  
  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Title level={5}>问卷结构</Title>
            <Text type="secondary">设计问卷的各部分与字段</Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveAllData}
              loading={saving}
            >
              保存问卷
            </Button>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={addNewTab}
            >
              添加部分
            </Button>
          </Space>
        </div>
        
        {/* 渲染所有部分（原标签页） */}
        {tabs.filter(tab => tab.operation !== 'delete').length === 0 ? (
          <Empty 
            description="暂无内容，请添加部分" 
            style={{ margin: '40px 0' }}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={addNewTab}>
              添加部分
            </Button>
          </Empty>
        ) : (
          tabs.map((tab, index) => renderSection(tab, index))
        )}
      </Card>
      
      {/* 标签页弹框 */}
      <Modal
        title={editingTabIndex === -1 ? '添加部分' : '编辑部分'}
        open={modalVisible}
        onOk={saveTab}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={tabForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="部分名称"
            rules={[{ required: true, message: '请输入部分名称' }]}
          >
            <Input placeholder="例如: 基本信息" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 字段弹框 */}
      {renderFieldModal()}
    </div>
  );
};

export default SurveyEditor;