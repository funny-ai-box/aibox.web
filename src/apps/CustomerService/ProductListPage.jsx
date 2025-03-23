import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Tooltip,
  Modal,
  message,
  Input,
  Image,
  Breadcrumb,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ShoppingOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import customerServiceAPI from '../../api/customerServiceAPI';

const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * 智能客服商品列表页面
 */
const ProductListPage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 初始化加载
  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取商品列表
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await customerServiceAPI.getProductList(
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        // 处理产品数据，确保每个产品都有mainImage字段
        const processedProducts = (response.data.items || []).map(product => {
          // 找到商品的第一张图片作为主图
          let mainImage = null;
          if (product.images && product.images.length > 0) {
            mainImage = product.images[0].imageUrl;
          }
          return { ...product, mainImage };
        });
        
        setProducts(processedProducts);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
      } else {
        message.error(response.message || '获取商品列表失败');
      }
    } catch (error) {
      message.error('获取商品列表失败');
      console.error('获取商品列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 创建新商品
  const createNewProduct = () => {
    navigate('/customer-service/products/create');
  };
  
  // 编辑商品
  const editProduct = (productId) => {
    navigate(`/customer-service/products/edit/${productId}`);
  };
  
  // 查看商品详情
  const viewProduct = (productId) => {
    navigate(`/customer-service/products/${productId}`);
  };
  
  // 删除商品确认
  const confirmDeleteProduct = (productId) => {
    confirm({
      title: '确认删除商品',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复，确定要删除该商品吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteProduct(productId);
      }
    });
  };
  
  // 删除商品
  const deleteProduct = async (productId) => {
    try {
      const response = await customerServiceAPI.deleteProduct(productId);
      
      if (response.code === 200) {
        message.success('商品已删除');
        fetchProducts(); // 刷新列表
      } else {
        message.error(response.message || '删除商品失败');
      }
    } catch (error) {
      message.error('删除商品失败');
      console.error('删除商品失败:', error);
    }
  };
  
  // 搜索商品
  const handleSearch = () => {
    // 在实际应用中，这里应该调用后端搜索API
    // 暂时前端筛选
    setPagination({
      ...pagination,
      current: 1
    });
    fetchProducts();
  };
  
  // 刷新商品列表
  const refreshProducts = () => {
    fetchProducts();
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 格式化价格
  const formatPrice = (price) => {
    return `¥${Number(price).toFixed(2)}`;
  };
  
  // 表格列定义
  const columns = [
    {
      title: '商品信息',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.mainImage ? (
            <Image 
              src={record.mainImage} 
              alt={text}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              fallback="data:image/png;base64,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"
            />
          ) : (
            <div 
              style={{ 
                width: 50, 
                height: 50, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f5f5f5',
                borderRadius: '4px'
              }}
            >
              <ShoppingOutlined style={{ color: '#d9d9d9' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <a onClick={() => viewProduct(record.id)}>{text}</a>
            <Text type="secondary" style={{ fontSize: '12px' }}>编码: {record.code}</Text>
          </div>
        </Space>
      )
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => (
        <Text type="danger" strong>{formatPrice(price)}</Text>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock) => (
        <Text>{stock}</Text>
      ),
      sorter: (a, b) => a.stock - b.stock
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        return status === 1 ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            上架中
          </Tag>
        ) : (
          <Tag icon={<StopOutlined />} color="default">
            已下架
          </Tag>
        );
      },
      filters: [
        { text: '上架中', value: 1 },
        { text: '已下架', value: 0 }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '更新时间',
      dataIndex: 'lastModifyDate',
      key: 'lastModifyDate',
      width: 180,
      render: (text) => formatDate(text),
      sorter: (a, b) => new Date(a.lastModifyDate) - new Date(b.lastModifyDate),
      defaultSortOrder: 'descend'
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => viewProduct(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑商品">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => editProduct(record.id)}
            />
          </Tooltip>
          <Tooltip title="删除商品">
            <Popconfirm
              title="确定要删除该商品吗？"
              onConfirm={() => deleteProduct(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[
          { title: <Link to="/customer-service">首页</Link> },
          { title: '商品列表' }
        ]} style={{ marginBottom: '16px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}>智能客服商品列表</Title>
          
          <Space>
            <Input
              placeholder="搜索商品"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refreshProducts}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={createNewProduct}
            >
              添加商品
            </Button>
          </Space>
        </div>
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination({
                ...pagination,
                current: page,
                pageSize
              });
            },
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>
    </div>
  );
};

export default ProductListPage;