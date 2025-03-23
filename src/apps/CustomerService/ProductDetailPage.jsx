import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Descriptions,
  Image,
  Button,
  Space,
  Tag,
  Divider,
  Carousel,
  Empty,
  Spin,
  message,
  Breadcrumb,
  Popconfirm,
  Modal
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import customerServiceAPI from '../../api/customerServiceAPI';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

/**
 * 商品详情页面
 */
const ProductDetailPage = () => {
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
  
  // 编辑商品
  const editProduct = () => {
    navigate(`/customer-service/products/edit/${productId}`);
  };
  
  // 删除商品确认
  const confirmDeleteProduct = () => {
    confirm({
      title: '确认删除商品',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复，确定要删除该商品吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteProduct();
      }
    });
  };
  
  // 删除商品
  const deleteProduct = async () => {
    try {
      const response = await customerServiceAPI.deleteProduct(productId);
      
      if (response.code === 200) {
        message.success('商品已删除');
        navigate('/customer-service/products');
      } else {
        message.error(response.message || '删除商品失败');
      }
    } catch (error) {
      message.error('删除商品失败');
      console.error('删除商品失败:', error);
    }
  };
  
  // 更新商品状态
  const updateProductStatus = async (newStatus) => {
    try {
      const productData = {
        Id: product.id,
        Code: product.code,
        Name: product.name,
        Price: product.price,
        Description: product.description,
        SellingPoints: product.sellingPoints,
        Stock: product.stock,
        Status: newStatus
      };
      
      const response = await customerServiceAPI.updateProduct(productData);
      
      if (response.code === 200) {
        message.success(newStatus === 1 ? '商品已上架' : '商品已下架');
        fetchProductDetail(); // 刷新详情
      } else {
        message.error(response.message || '更新商品状态失败');
      }
    } catch (error) {
      message.error('更新商品状态失败');
      console.error('更新商品状态失败:', error);
    }
  };
  
  // 返回商品列表
  const backToList = () => {
    navigate('/customer-service/products');
  };
  
  // 格式化价格
  const formatPrice = (price) => {
    return `¥${Number(price).toFixed(2)}`;
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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
        <Button type="primary" onClick={backToList}>
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
          { title: product.name }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>{product.name}</Title>
          
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={backToList}
            >
              返回列表
            </Button>
            
            {product.status === 1 ? (
              <Button 
                icon={<StopOutlined />}
                onClick={() => updateProductStatus(0)}
              >
                下架商品
              </Button>
            ) : (
              <Button 
                icon={<CheckCircleOutlined />}
                onClick={() => updateProductStatus(1)}
                type="primary"
              >
                上架商品
              </Button>
            )}
            
            <Button 
              icon={<EditOutlined />}
              onClick={editProduct}
            >
              编辑商品
            </Button>
            
            <Button 
              danger
              icon={<DeleteOutlined />}
              onClick={confirmDeleteProduct}
            >
              删除商品
            </Button>
          </Space>
        </div>
      </Card>
      
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ width: '360px' }}>
            {product.images && product.images.length > 0 ? (
              <Carousel autoplay>
                {product.images.map((image, index) => (
                  <div key={image.id || index}>
                    <Image
                      src={image.imageUrl}
                      alt={`${product.name}-图片${index+1}`}
                      style={{ objectFit: 'cover', width: '100%', height: '360px' }}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div 
                style={{ 
                  height: '360px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f5f5f5',
                  borderRadius: '4px'
                }}
              >
                <ShoppingOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
              </div>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <Descriptions title="商品信息" bordered column={1}>
              <Descriptions.Item label="商品编码">{product.code}</Descriptions.Item>
              <Descriptions.Item label="商品名称">{product.name}</Descriptions.Item>
              <Descriptions.Item label="商品价格">
                <Text type="danger" strong style={{ fontSize: '18px' }}>
                  {formatPrice(product.price)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="库存数量">{product.stock}</Descriptions.Item>
              <Descriptions.Item label="商品状态">
                {product.status === 1 ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">上架中</Tag>
                ) : (
                  <Tag icon={<StopOutlined />} color="default">已下架</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{formatDate(product.createDate)}</Descriptions.Item>
              <Descriptions.Item label="最后更新">{formatDate(product.lastModifyDate)}</Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>
      
      {product.sellingPoints && (
        <Card title="商品卖点" style={{ marginBottom: '16px' }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {product.sellingPoints}
          </Paragraph>
        </Card>
      )}
      
      {product.description && (
        <Card title="商品描述" style={{ marginBottom: '16px' }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {product.description}
          </Paragraph>
        </Card>
      )}
      
      <Card title="商品图片" style={{ marginBottom: '16px' }}>
        {product.images && product.images.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {product.images.map((image, index) => (
              <Image
                key={image.id || index}
                src={image.imageUrl}
                alt={`${product.name}-图片${index+1}`}
                width={200}
                height={200}
                style={{ objectFit: 'cover' }}
              />
            ))}
          </div>
        ) : (
          <Empty description="暂无商品图片" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  );
};

export default ProductDetailPage;