import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Space, 
  Divider, 
  Spin, 
  Empty, 
  Tag,
  Breadcrumb,
  message,
  Tabs
} from 'antd';
import { 
  HomeOutlined, 
  FileTextOutlined, 
  ArrowLeftOutlined,
  NodeIndexOutlined,
  HighlightOutlined,
  TagOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import pkbAPI from '../../api/pkbAPI';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const DocumentDetail = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    fetchDocumentDetail();
  }, [documentId]);

  const fetchDocumentDetail = async () => {
    try {
      setLoading(true);
      const response = await pkbAPI.getDocumentDetail(documentId);
      
      if (response.code === 200) {
        setDocument(response.data);
      } else {
        message.error(response.message || '获取文档详情失败');
      }
    } catch (error) {
      message.error('获取文档详情失败');
      console.error('获取文档详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/knowledge-base');
  };

  const createChat = async () => {
    try {
      const response = await pkbAPI.createChatSession(`关于 ${document?.title || '文档'} 的对话`);
      
      if (response.code === 200) {
        message.success('创建聊天会话成功');
        navigate('/knowledge-base');
        // 这里理想情况下应该直接导航到新创建的聊天会话
      }
    } catch (error) {
      message.error('创建聊天会话失败');
      console.error('创建聊天会话失败:', error);
    }
  };

  const formatDocStatus = (status) => {
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

  // 格式化上传时间
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 渲染知识图谱
  const renderKnowledgeGraph = () => {
    if (!document?.knowledgeGraph) {
      return <Empty description="暂无知识图谱数据" />;
    }

    try {
      // 尝试解析知识图谱数据
      const mindMapData = document.knowledgeGraph.mindMap;
      if (!mindMapData) {
        return <Empty description="知识图谱数据格式不正确" />;
      }

      return (
        <div style={{ padding: '16px 0' }}>
          <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '16px', minHeight: '300px' }}>
            <Text>知识图谱信息 (该功能正在开发中)</Text>
            <pre style={{ 
              maxHeight: '400px', 
              overflow: 'auto', 
              background: '#f0f0f0', 
              padding: '16px',
              borderRadius: '4px',
              fontSize: '12px',
              marginTop: '16px' 
            }}>
              {JSON.stringify(JSON.parse(mindMapData), null, 2)}
            </pre>
          </div>
        </div>
      );
    } catch (error) {
      console.error('解析知识图谱数据失败:', error);
      return <Empty description="解析知识图谱数据失败" />;
    }
  };

  // 渲染关键词
  const renderKeywords = () => {
    if (!document?.knowledgeGraph?.keywords) {
      return <Empty description="暂无关键词数据" />;
    }

    try {
      // 尝试解析关键词数据
      const keywords = JSON.parse(document.knowledgeGraph.keywords);
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return <Empty description="暂无关键词" />;
      }

      return (
        <Space size={[8, 16]} wrap>
          {keywords.map((keyword, index) => (
            <Tag key={index} color="blue">{keyword}</Tag>
          ))}
        </Space>
      );
    } catch (error) {
      console.error('解析关键词数据失败:', error);
      return <Empty description="解析关键词数据失败" />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>

      
      <Content style={{ padding: '20px', background: '#f0f2f5' }}>
        <Card style={{ marginBottom: '16px' }}>
          <Breadcrumb items={[
            { title: <Link to="/"><HomeOutlined /></Link> },
            { title: <Link to="/knowledge-base">个人知识库</Link> },
            { title: '文档详情' }
          ]} />
        </Card>
        
        {loading ? (
          <Card style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>正在加载文档信息...</div>
          </Card>
        ) : !document ? (
          <Card>
            <Empty description="未找到文档信息" />
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button type="primary" onClick={goBack}>
                返回文档列表
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <Card style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Title level={3}>{document.title}</Title>
                  <Space>
                    {formatDocStatus(document.status)}
                    <Text type="secondary">上传于 {formatDate(document.createDate)}</Text>
                    <Text type="secondary">文件大小: {(document.fileSize / 1024).toFixed(2)} KB</Text>
                  </Space>
                </div>
                <Space>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={goBack}
                  >
                    返回列表
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<MessageOutlined />}
                    onClick={createChat}
                    disabled={document.status !== 2}
                  >
                    开始对话
                  </Button>
                </Space>
              </div>
            </Card>
            
            <Card>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane 
                  tab={<span><HighlightOutlined />文档摘要</span>} 
                  key="summary"
                >
                  <div style={{ padding: '16px 0' }}>
                    <Title level={4}>文档摘要</Title>
                    {document.status === 2 && document.knowledgeGraph?.summary ? (
                      <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                        {document.knowledgeGraph.summary}
                      </Paragraph>
                    ) : document.status === 0 ? (
                      <Empty description="文档待处理，暂无摘要信息" />
                    ) : document.status === 1 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spin />
                        <div style={{ marginTop: '16px' }}>文档处理中，请稍后查看</div>
                      </div>
                    ) : document.status === 3 ? (
                      <Empty description="文档处理失败，无法获取摘要信息" />
                    ) : (
                      <Empty description="暂无摘要信息" />
                    )}
                  </div>
                  
                  {document.status === 2 && document.content && (
                    <div style={{ padding: '16px 0' }}>
                      <Divider />
                      <Title level={4}>文档内容</Title>
                      <div style={{ 
                        background: '#f9f9f9', 
                        padding: '16px', 
                        borderRadius: '8px',
                        maxHeight: '500px',
                        overflow: 'auto'
                      }}>
                        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                          {document.content}
                        </Paragraph>
                      </div>
                    </div>
                  )}
                </Tabs.TabPane>
                
                <Tabs.TabPane 
                  tab={<span><NodeIndexOutlined />知识图谱</span>} 
                  key="knowledge-graph"
                  disabled={document.status !== 2}
                >
                  <div style={{ padding: '16px 0' }}>
                    <Title level={4}>知识图谱</Title>
                    {document.status === 2 ? renderKnowledgeGraph() : (
                      <Empty description={
                        document.status === 0 ? "文档待处理，暂无知识图谱" :
                        document.status === 1 ? "文档处理中，请稍后查看" :
                        "文档处理失败，无法获取知识图谱"
                      } />
                    )}
                  </div>
                </Tabs.TabPane>
                
                <Tabs.TabPane 
                  tab={<span><TagOutlined />关键词</span>} 
                  key="keywords"
                  disabled={document.status !== 2}
                >
                  <div style={{ padding: '16px 0' }}>
                    <Title level={4}>关键词</Title>
                    {document.status === 2 ? renderKeywords() : (
                      <Empty description={
                        document.status === 0 ? "文档待处理，暂无关键词" :
                        document.status === 1 ? "文档处理中，请稍后查看" :
                        "文档处理失败，无法获取关键词"
                      } />
                    )}
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </>
        )}
      </Content>
    </Layout>
  );
};

export default DocumentDetail;