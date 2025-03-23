import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Breadcrumb,
  Spin,
  Empty,
  Button,
  message
} from 'antd';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ProductForm from './components/ProductForm';
import customerServiceAPI from '../../api/customerServiceAPI';

const { Title } = Typography;

/**
 * 编辑商品页面
 */
const EditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  
  // 初始化加载
  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);
  
  // 获取商品详情
  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await customerServiceAPI.getProductDetail(productId);
      
      if (response.code === 200) {
        setProduct(response.data);
      } else {
        setError(response.message || '获取商品详情失败');
        message.error(response.message || '获取商品详情失败');
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      setError('获取商品详情失败');
      message.error('获取商品详情失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 提交成功处理
  const handleFinish = (data) => {
    // 导航到商品详情页
    navigate(`/customer-service/products/${productId}`);
  };
  
  // 取消处理
  const handleCancel = () => {
    // 返回商品详情页
    navigate(`/customer-service/products/${productId}`);
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载商品信息中...</div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <Empty 
        description={error || "未找到商品信息"} 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => navigate('/customer-service/products')}>
          返回商品列表
        </Button>
      </Empty>
    );
  }
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/customer-service">首页</Link> },
          { title: <Link to="/customer-service/products">商品列表</Link> },
          { title: <Link to={`/customer-service/products/${productId}`}>{product.name}</Link> },
          { title: '编辑商品' }
        ]} style={{ marginBottom: '16px' }} />
        
        <Title level={4}>编辑商品: {product.name}</Title>
      </Card>
      
      <ProductForm 
        initialValues={product}
        onFinish={handleFinish}
        onCancel={handleCancel}
        isEdit={true}
      />
    </div>
  );
};

export default EditProductPage;