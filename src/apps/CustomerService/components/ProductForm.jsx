import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Upload,
  Space,
  Card,
  Typography,
  Divider,
  Radio,
  message,
  Image
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  PictureOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import customerServiceAPI from '../../../api/customerServiceAPI';

const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * 商品表单组件
 * @param {Object} props
 * @param {Object} props.initialValues - 商品初始值（编辑时使用）
 * @param {Function} props.onFinish - 表单提交成功回调
 * @param {Function} props.onCancel - 取消操作回调
 * @param {boolean} props.isEdit - 是否为编辑模式
 */
const ProductForm = ({ initialValues = null, onFinish, onCancel, isEdit = false }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // 初始化表单
  useEffect(() => {
    if (initialValues) {
      // 设置表单初始值
      form.setFieldsValue({
        code: initialValues.code,
        name: initialValues.name,
        price: initialValues.price,
        description: initialValues.description,
        sellingPoints: initialValues.sellingPoints,
        stock: initialValues.stock,
        status: initialValues.status
      });
      
      // 设置图片列表
      if (initialValues.images && initialValues.images.length > 0) {
        const images = initialValues.images.map(img => ({
          uid: img.id,
          name: `图片${img.id}`,
          status: 'done',
          url: img.imageUrl,
          imageId: img.id
        }));
        setImageList(images);
      }
    }
  }, [initialValues, form]);
  
  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      let response;
      
      if (isEdit && initialValues) {
        // 编辑模式
        const productData = {
          Id: initialValues.id,
          Code: values.code,
          Name: values.name,
          Price: values.price,
          Description: values.description,
          SellingPoints: values.sellingPoints,
          Stock: values.stock,
          Status: values.status
        };
        
        response = await customerServiceAPI.updateProduct(productData);
      } else {
        // 创建模式
        const formData = new FormData();
        formData.append('Code', values.code);
        formData.append('Name', values.name);
        formData.append('Price', values.price);
        formData.append('Description', values.description || '');
        formData.append('SellingPoints', values.sellingPoints || '');
        formData.append('Stock', values.stock);
        formData.append('Status', values.status);
        
        // 添加图片
        imageList.forEach(image => {
          if (image.originFileObj) {
            formData.append('images', image.originFileObj);
          }
        });
        
        response = await customerServiceAPI.createProduct(formData);
      }
      
      if (response.code === 200) {
        message.success(isEdit ? '商品更新成功' : '商品创建成功');
        if (onFinish) {
          onFinish(response.data);
        }
      } else {
        throw new Error(response.message || (isEdit ? '商品更新失败' : '商品创建失败'));
      }
    } catch (error) {
      console.error(isEdit ? '更新商品失败:' : '创建商品失败:', error);
      message.error(error.message || (isEdit ? '商品更新失败' : '商品创建失败'));
    } finally {
      setLoading(false);
    }
  };
  
  // 处理图片上传前检查
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过5MB!');
      return Upload.LIST_IGNORE;
    }
    
    // 在编辑模式下，需要立即上传图片到服务器
    if (isEdit && initialValues) {
      uploadImage(file, initialValues.id);
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };
  
  // 在编辑模式下上传图片
  const uploadImage = async (file, productId) => {
    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('ProductId', productId);
      formData.append('image', file);
      
      const response = await customerServiceAPI.uploadProductImage(formData);
      
      if (response.code === 200) {
        message.success('图片上传成功');
        
        // 添加新上传的图片到图片列表
        const newImage = {
          uid: response.data.id,
          name: file.name,
          status: 'done',
          url: response.data.imageUrl,
          imageId: response.data.id
        };
        
        setImageList([...imageList, newImage]);
      } else {
        throw new Error(response.message || '图片上传失败');
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      message.error(error.message || '图片上传失败');
    } finally {
      setUploadingImage(false);
    }
  };
  
  // 处理图片变更
  const handleImageChange = ({ fileList }) => {
    // 只在创建模式下通过这个方法更新图片列表
    if (!isEdit) {
      setImageList(fileList);
    }
  };
  
  // 处理图片删除
  const handleImageRemove = async (file) => {
    if (isEdit && file.imageId) {
      try {
        const response = await customerServiceAPI.deleteProductImage(file.imageId);
        
        if (response.code === 200) {
          message.success('图片删除成功');
          setImageList(imageList.filter(img => img.uid !== file.uid));
        } else {
          throw new Error(response.message || '图片删除失败');
        }
      } catch (error) {
        console.error('删除图片失败:', error);
        message.error(error.message || '图片删除失败');
        return false; // 阻止删除
      }
    }
    return true; // 允许删除
  };
  
  // 自定义上传按钮
  const uploadButton = (
    <div>
      {uploadingImage ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: 1, // 默认上架
        stock: 0,
        price: 0
      }}
    >
      <Card title="基本信息" style={{ marginBottom: '16px' }}>
        <Form.Item
          name="code"
          label="商品编码"
          rules={[
            { required: true, message: '请输入商品编码' },
            { max: 50, message: '商品编码不能超过50个字符' }
          ]}
        >
          <Input placeholder="请输入商品编码" />
        </Form.Item>
        
        <Form.Item
          name="name"
          label="商品名称"
          rules={[
            { required: true, message: '请输入商品名称' },
            { max: 255, message: '商品名称不能超过255个字符' }
          ]}
        >
          <Input placeholder="请输入商品名称" />
        </Form.Item>
        
        <Form.Item
          name="price"
          label="商品价格"
          rules={[
            { required: true, message: '请输入商品价格' },
            { type: 'number', min: 0, message: '价格不能为负数' }
          ]}
        >
          <InputNumber 
            placeholder="请输入商品价格" 
            style={{ width: '100%' }}
            precision={2}
            addonBefore="¥"
          />
        </Form.Item>
        
        <Form.Item
          name="stock"
          label="商品库存"
          rules={[
            { required: true, message: '请输入商品库存' },
            { type: 'number', min: 0, message: '库存不能为负数' }
          ]}
        >
          <InputNumber placeholder="请输入商品库存" style={{ width: '100%' }} precision={0} />
        </Form.Item>
        
        <Form.Item
          name="status"
          label="商品状态"
          rules={[{ required: true, message: '请选择商品状态' }]}
        >
          <Radio.Group>
            <Radio value={1}>上架</Radio>
            <Radio value={0}>下架</Radio>
          </Radio.Group>
        </Form.Item>
      </Card>
      
      <Card title="商品详情" style={{ marginBottom: '16px' }}>
        <Form.Item
          name="description"
          label="商品描述"
        >
          <TextArea 
            placeholder="请输入商品描述" 
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Form.Item>
        
        <Form.Item
          name="sellingPoints"
          label="商品卖点"
        >
          <TextArea 
            placeholder="请输入商品卖点" 
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>
      </Card>
      
      <Card title="商品图片" style={{ marginBottom: '16px' }}>
        <Upload
          listType="picture-card"
          fileList={imageList}
          beforeUpload={beforeUpload}
          onChange={handleImageChange}
          onRemove={handleImageRemove}
          multiple={true}
          accept="image/*"
        >
          {imageList.length >= 8 ? null : uploadButton}
        </Upload>
        <Text type="secondary">
          最多上传8张图片，每张图片不超过5MB，支持JPG、PNG等格式
        </Text>
      </Card>
      
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '更新商品' : '创建商品'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;