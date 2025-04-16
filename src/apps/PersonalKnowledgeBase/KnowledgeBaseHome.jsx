import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Button, 
  Input, 
  Card, 
  Typography, 
  Space, 
  Upload,
  Spin,
  Empty,
  message,
  Tabs,
  Badge,
  Avatar
} from 'antd';
import { 
  FileTextOutlined, 
  UploadOutlined, 
  MessageOutlined, 
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import pkbAPI from '../../api/pkbAPI';
import DocumentListItem from './components/DocumentListItem';
import ChatComponent from './components/ChatComponent';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const KnowledgeBaseHome = () => {
  // 文档状态
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' 或 'grid'
  const [activeTabKey, setActiveTabKey] = useState('all');
  const navigate = useNavigate();
  
  // 聊天状态
  const [chatVisible, setChatVisible] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState('');
  
  // 查询条件
  const [searchKeyword, setSearchKeyword] = useState('');

  // 初始化加载
  useEffect(() => {
    fetchDocuments();
  }, []);

  // 获取文档列表
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await pkbAPI.getDocumentsList();
      if (response.code === 200) {
        setDocuments(response.data.items || []);
      }
    } catch (error) {
      message.error('获取文档列表失败');
      console.error('获取文档列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 上传文档
  const handleUpload = async (file) => {
    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      
      const response = await pkbAPI.uploadDocument(formData);
      
      if (response.code === 200) {
        message.success('文档上传成功');
        fetchDocuments(); // 刷新文档列表
      } else {
        message.error(response.message || '上传失败');
      }
    } catch (error) {
      message.error('文档上传失败');
      console.error('文档上传失败:', error);
    } finally {
      setUploadLoading(false);
    }
    
    return false;  // 阻止默认上传行为
  };

  // 删除文档
  const deleteDocument = async (documentId) => {
    try {
      const response = await pkbAPI.deleteDocument(documentId);
      
      if (response.code === 200) {
        message.success('文档删除成功');
        fetchDocuments(); // 刷新文档列表
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除文档失败');
      console.error('删除文档失败:', error);
    }
  };

  // 查看文档详情
  const viewDocumentDetail = (documentId) => {
    navigate(`/knowledge-base/document/${documentId}`);
  };

  // 创建与文档相关的聊天
  const createDocumentChat = (documentId, documentTitle) => {
    setSelectedDocumentId(documentId);
    setSelectedDocumentTitle(documentTitle);
  };

  // 处理标签切换
  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  // 根据标签过滤文档
  const getFilteredDocuments = () => {
    let filtered = documents;
    
    // 先按标签过滤
    if (activeTabKey === 'completed') {
      filtered = filtered.filter(doc => doc.status === 2);
    } else if (activeTabKey === 'processing') {
      filtered = filtered.filter(doc => doc.status === 0 || doc.status === 1);
    } else if (activeTabKey === 'failed') {
      filtered = filtered.filter(doc => doc.status === 3);
    }
    
    // 再按搜索关键词过滤
    if (searchKeyword) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    
    return filtered;
  };

  // 获取标签计数
  const getTabCounts = () => {
    const counts = {
      all: documents.length,
      completed: documents.filter(doc => doc.status === 2).length,
      processing: documents.filter(doc => doc.status === 0 || doc.status === 1).length,
      failed: documents.filter(doc => doc.status === 3).length
    };
    return counts;
  };

  const tabCounts = getTabCounts();
  const filteredDocuments = getFilteredDocuments();

  // 上传组件属性配置
  const uploadProps = {
    name: 'file',
    showUploadList: false,
    beforeUpload: handleUpload,
    accept: '.txt,.pdf,.doc,.docx',
    disabled: uploadLoading
  };

  // 格式化文件大小
  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 根据状态获取图标和状态标签
  const getStatusDisplay = (status) => {
    switch (status) {
      case 0:
        return {
          icon: <FileTextOutlined style={{ color: '#bfbfbf' }} />,
          tag: <span style={{ color: '#bfbfbf', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>待处理</span>
        };
      case 1:
        return {
          icon: <Spin size="small" style={{ color: '#1890ff' }} />,
          tag: <span style={{ color: '#1890ff', backgroundColor: '#e6f7ff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>处理中</span>
        };
      case 2:
        return {
          icon: <FileTextOutlined style={{ color: '#52c41a' }} />,
          tag: <span style={{ color: '#52c41a', backgroundColor: '#f6ffed', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>已完成</span>
        };
      case 3:
        return {
          icon: <FileTextOutlined style={{ color: '#f5222d' }} />,
          tag: <span style={{ color: '#f5222d', backgroundColor: '#fff1f0', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>处理失败</span>
        };
      default:
        return {
          icon: <FileTextOutlined style={{ color: '#bfbfbf' }} />,
          tag: <span style={{ color: '#bfbfbf', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>未知状态</span>
        };
    }
  };

  // Grid模式的文档卡片渲染
  const renderDocumentGrid = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredDocuments.map(doc => {
          const { icon, tag } = getStatusDisplay(doc.status);
          return (
            <Card 
              key={doc.id}
              hoverable
              style={{ height: '100%' }}
              onClick={() => viewDocumentDetail(doc.id)}
              actions={[
                <Button 
                  type="text" 
                  icon={<MessageOutlined />} 
                  disabled={doc.status !== 2}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (doc.status === 2) {
                      createDocumentChat(doc.id, doc.title);
                    }
                  }}
                  title={doc.status !== 2 ? "文档处理完成后才能开始对话" : "开始对话"}
                />,
                <Button 
                  type="text" 
                  icon={<FileTextOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    viewDocumentDetail(doc.id);
                  }}
                  title="查看文档详情"
                />,
                <Button 
                  type="text" 
                  danger
                  icon={<MessageOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDocument(doc.id);
                  }}
                  title="删除文档"
                />
              ]}
            >
              <Card.Meta
                avatar={icon}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text ellipsis style={{ maxWidth: '160px' }} title={doc.title}>{doc.title}</Text>
                    {tag}
                  </div>
                }
                description={
                  <div>
                    <div>上传于: {formatDate(doc.createDate)}</div>
                    <div>大小: {formatFileSize(doc.fileSize)}</div>
                  </div>
                }
              />
            </Card>
          );
        })}
      </div>
    );
  };

  // 渲染文档列表内容
  const renderDocumentContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      );
    }
    
    if (filteredDocuments.length === 0) {
      return (
        <Card style={{ borderStyle: 'dashed', background: '#fafafa' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Text type="secondary" style={{ marginBottom: '16px' }}>
              {searchKeyword 
                ? '没有找到匹配的文档' 
                : activeTabKey !== 'all' 
                  ? `没有${activeTabKey === 'completed' ? '已完成' : activeTabKey === 'processing' ? '处理中' : '失败'}的文档` 
                  : '暂无文档'}
            </Text>
            <Upload {...uploadProps}>
              <Button type="primary" icon={<UploadOutlined />}>
                上传文档
              </Button>
            </Upload>
          </div>
        </Card>
      );
    }
    
    return viewMode === 'grid' 
      ? renderDocumentGrid()
      : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {filteredDocuments.map(doc => (
            <DocumentListItem
              key={doc.id}
              document={doc}
              onView={viewDocumentDetail}
              onDelete={deleteDocument}
              onCreateChat={(docId, docTitle) => createDocumentChat(docId, docTitle)}
            />
          ))}
        </Space>
      );
  };

  return (
    <Layout style={{ background: '#fff', height: 'calc(100vh - 104px)' }}>
      {/* 左侧文档列表区域 */}
      <Content style={{ width: chatVisible ? '54%' : '100%',padding: '20px', background: '##f8f8f8', paddingRight: chatVisible ? '20px' : '0', overflowY: 'auto' }}>

          <div style={{ marginBottom: '16px' }}>
            <Title level={4} style={{ marginBottom: '16px' }}>我的文档</Title>
            
            <Tabs activeKey={activeTabKey} onChange={handleTabChange}>
              <TabPane tab={<Badge count={tabCounts.all} offset={[10, 0]}>全部</Badge>} key="all" />
              <TabPane tab={<Badge count={tabCounts.completed} offset={[10, 0]}>已完成</Badge>} key="completed" />
              <TabPane tab={<Badge count={tabCounts.processing} offset={[10, 0]}>处理中</Badge>} key="processing" />
              <TabPane tab={<Badge count={tabCounts.failed} offset={[10, 0]}>失败</Badge>} key="failed" />
            </Tabs>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <Space>
                <Button 
                  type={viewMode === 'list' ? 'primary' : 'default'} 
                  icon={<AppstoreOutlined />} 
                  onClick={() => setViewMode('list')}
                >
                  列表
                </Button>
                <Button 
                  type={viewMode === 'grid' ? 'primary' : 'default'} 
                  icon={<AppstoreOutlined />} 
                  onClick={() => setViewMode('grid')}
                >
                  网格
                </Button>
              </Space>
              
              <Space>
                <Search
                  placeholder="搜索文档"
                  allowClear
                  onSearch={(value) => setSearchKeyword(value)}
                  style={{ width: 220 }}
                  prefix={<SearchOutlined />}
                />
                <Upload {...uploadProps}>
                  <Button 
                    type="primary" 
                    icon={<UploadOutlined />}
                    loading={uploadLoading}
                  >
                    上传文档
                  </Button>
                </Upload>
              </Space>
            </div>
          </div>

          <div style={{ minHeight: '300px' }}>
            {renderDocumentContent()}
          </div>
        
      </Content>
      
      {/* 右侧聊天区域，使用封装的聊天组件 */}
      <ChatComponent 
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        documentId={selectedDocumentId}
        documentTitle={selectedDocumentTitle}
        width="46%"
      />
    </Layout>
  );
};

export default KnowledgeBaseHome;