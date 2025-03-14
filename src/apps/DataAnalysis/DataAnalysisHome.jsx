import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Upload,
  Typography,
  Space,
  Tag,
  Tooltip,
  Empty,
  message,
  Spin,
  Popconfirm,
  Modal
} from 'antd';
import {
  UploadOutlined,
  FileExcelOutlined,
  DeleteOutlined,
  EyeOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dtaAPI from '../../api/dtaAPI';

const { Title, Text } = Typography;
const { Dragger } = Upload;

/**
 * 数据分析助手 - 我的数据页面
 * 展示用户上传的Excel文件列表和状态
 */
const DataAnalysisHome = () => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [fileDetailModalVisible, setFileDetailModalVisible] = useState(false);
  const [currentFileDetail, setCurrentFileDetail] = useState(null);
  const [fileDetailLoading, setFileDetailLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // 初始加载
  useEffect(() => {
    fetchFilesList();
  }, [pagination.current, pagination.pageSize]);
  
  // 获取文件列表
  const fetchFilesList = async () => {
    try {
      setLoading(true);
      const response = await dtaAPI.getFilesList(
        pagination.current,
        pagination.pageSize
      );
      
      if (response.code === 200) {
        setFileList(response.data.items || []);
        setPagination({
          ...pagination,
          total: response.data.totalCount
        });
      } else {
        message.error(response.message || '获取文件列表失败');
      }
    } catch (error) {
      message.error('获取文件列表失败');
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理文件上传
  const handleUpload = async (file) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await dtaAPI.uploadFile(formData);
      
      if (response.code === 200) {
        message.success('文件上传成功');
        fetchFilesList(); // 刷新文件列表
      } else {
        message.error(response.message || '上传失败');
      }
    } catch (error) {
      message.error('文件上传失败');
      console.error('文件上传失败:', error);
    } finally {
      setUploading(false);
    }
    
    return false; // 阻止默认上传行为
  };
  
  // 查看文件详情
  const viewFileDetail = async (fileId) => {
    try {
      setFileDetailLoading(true);
      setFileDetailModalVisible(true);
      
      const response = await dtaAPI.getFileDetail(fileId);
      
      if (response.code === 200) {
        setCurrentFileDetail(response.data);
      } else {
        message.error(response.message || '获取文件详情失败');
        setFileDetailModalVisible(false);
      }
    } catch (error) {
      message.error('获取文件详情失败');
      console.error('获取文件详情失败:', error);
      setFileDetailModalVisible(false);
    } finally {
      setFileDetailLoading(false);
    }
  };
  
  // 打开文件数据分析
  const openFileAnalysis = (file) => {
    // 导航到数据分析页面，并传递文件信息
    navigate(`/data-analysis/analysis?fileId=${file.id}&fileName=${encodeURIComponent(file.originalFileName)}`);
  };
  
  // 格式化文件状态标签
  const formatFileStatus = (status) => {
    switch (status) {
      case 0:
        return <Tag color="default">待处理</Tag>;
      case 1:
        return <Tag color="processing">处理中</Tag>;
      case 2:
        return <Tag color="success">完成</Tag>;
      case 3:
        return <Tag color="error">失败</Tag>;
      default:
        return <Tag color="default">未知状态</Tag>;
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 表格列定义 - 根据API返回的字段进行调整
  const columns = [
    {
      title: '文件名',
      dataIndex: 'originalFileName', // 使用API返回的字段名
      key: 'originalFileName',
      render: (text, record) => (
        <Space>
          <FileExcelOutlined style={{ color: '#52c41a' }} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => formatFileStatus(status)
    },
    {
      title: '行数',
      dataIndex: 'rowCount', // 使用API返回的字段名
      key: 'rowCount',
      width: 100,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime', // 使用API返回的字段名
      key: 'uploadTime',
      width: 180,
      render: (text) => formatDate(text)
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看文件详情">
            <Button 
              type="text" 
              icon={<InfoCircleOutlined />} 
              onClick={() => viewFileDetail(record.id)}
            />
          </Tooltip>
          
          <Tooltip title="查看数据表">
            <Button
              type="text"
              icon={<EyeOutlined />}
              disabled={record.status !== 2}
              onClick={() => navigate(`/data-analysis/file/${record.id}`)}
            />
          </Tooltip>
          
          <Tooltip title="数据分析">
            <Button
              type="text"
              icon={<LineChartOutlined />}
              disabled={record.status !== 2}
              onClick={() => openFileAnalysis(record)}
            />
          </Tooltip>
          
          <Tooltip title="删除文件">
            <Popconfirm
              title="确定要删除这个文件吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => message.info('删除功能待实现')}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];
  
  // 文件详情模态框
  const renderFileDetailModal = () => {
    return (
      <Modal
        title="文件详情"
        open={fileDetailModalVisible}
        onCancel={() => setFileDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setFileDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {fileDetailLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : !currentFileDetail ? (
          <Empty description="未找到文件详情" />
        ) : (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <Title level={5}>基本信息</Title>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ width: '50%', marginBottom: '10px' }}>
                  <Text type="secondary">文件名：</Text>
                  <Text>{currentFileDetail.originalFileName}</Text>
                </div>
                <div style={{ width: '50%', marginBottom: '10px' }}>
                  <Text type="secondary">状态：</Text>
                  {formatFileStatus(currentFileDetail.status)}
                </div>
                <div style={{ width: '50%', marginBottom: '10px' }}>
                  <Text type="secondary">上传时间：</Text>
                  <Text>{formatDate(currentFileDetail.uploadTime)}</Text>
                </div>
                <div style={{ width: '50%', marginBottom: '10px' }}>
                  <Text type="secondary">行数：</Text>
                  <Text>{currentFileDetail.rowCount || 0}</Text>
                </div>
                <div style={{ width: '50%', marginBottom: '10px' }}>
                  <Text type="secondary">文件大小：</Text>
                  <Text>{currentFileDetail.fileSize ? `${(currentFileDetail.fileSize / 1024).toFixed(2)} KB` : '未知'}</Text>
                </div>
                <div style={{ width: '50%', marginBottom: '10px' }}>
                  <Text type="secondary">文件类型：</Text>
                  <Text>{currentFileDetail.fileType?.toUpperCase() || '未知'}</Text>
                </div>
              </div>
            </div>
            
            {currentFileDetail.columns && currentFileDetail.columns.length > 0 && (
              <div>
                <Title level={5}>列信息</Title>
                <Table
                  size="small"
                  rowKey="id"
                  columns={[
                    {
                      title: '列名',
                      dataIndex: 'columnName',
                      key: 'columnName'
                    },
                    {
                      title: '原始名称',
                      dataIndex: 'originalName',
                      key: 'originalName'
                    },
                    {
                      title: '数据类型',
                      dataIndex: 'dataType',
                      key: 'dataType',
                      width: 100,
                      render: (type) => (
                        <Tag color={
                          type === 'string' ? 'blue' : 
                          type === 'integer' ? 'green' : 
                          type === 'decimal' ? 'purple' : 
                          'default'
                        }>
                          {type}
                        </Tag>
                      )
                    },
                    {
                      title: '列索引',
                      dataIndex: 'columnIndex',
                      key: 'columnIndex',
                      width: 80
                    }
                  ]}
                  dataSource={currentFileDetail.columns}
                  pagination={false}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    );
  };
  
  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4}>我的数据</Title>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchFilesList()}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>
        
        <Dragger
          name="file"
          multiple={false}
          showUploadList={false}
          beforeUpload={handleUpload}
          accept=".xlsx,.xls"
          disabled={uploading}
          style={{ marginBottom: '24px' }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ color: '#1890ff', fontSize: '48px' }} />
          </p>
          <p className="ant-upload-text">
            点击或拖拽Excel文件到此区域上传
          </p>
          <p className="ant-upload-hint">
            支持 .xlsx 和 .xls 格式的Excel文件
          </p>
        </Dragger>
      </Card>
      
      <Card title="文件列表">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={fileList}
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
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>
      
      {renderFileDetailModal()}
    </div>
  );
};

export default DataAnalysisHome;