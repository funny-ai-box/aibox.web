import React from 'react';
import {
  Card,
  Typography,
  Breadcrumb
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import ProductForm from './components/ProductForm';

const { Title } = Typography;

/**
 * 创建商品页面
 */
const CreateProductPage = () => {
  const navigate = useNavigate();
  
  // 提交成功处理
  const handleFinish = (data) => {
    // 导航到商品详情页
    navigate(`/customer-service/products/${data}`);
  };
  
  // 取消处理
  const handleCancel = () => {
    // 返回商品列表
    navigate('/customer-service/products');
  };
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/customer-service">首页</Link> },
          { title: <Link to="/customer-service/products">商品列表</Link> },
          { title: '创建商品' }
        ]} style={{ marginBottom: '16px' }} />
        
        <Title level={4}>创建新商品</Title>
      </Card>
      
      <ProductForm 
        onFinish={handleFinish}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateProductPage;