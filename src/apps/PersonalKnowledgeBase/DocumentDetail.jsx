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
const { TabPane } = Tabs;

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
    if (!status) return null;
    if (status === 'processing') return <Tag color="processing">处理中</Tag>;
    if (status === 'failed') return <Tag color="error">处理失败</Tag>;
    return <Tag color="success">已完成</Tag>;
  };

  // 格式化上传时间
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">
            <Button type="primary" shape="circle" icon={<HomeOutlined />} style={{ marginRight: '16px' }} />
          </Link>
          <Title level={3} style={{ margin: 0 }}>文档详情</Title>
        </div>
      </Header>
      
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
                  >
                    开始对话
                  </Button>
                </Space>
              </div>
            </Card>
            
            <Card>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane 
                  tab={<span><HighlightOutlined />文档摘要</span>} 
                  key="summary"
                >
                  <div style={{ padding: '16px 0' }}>
                    <Title level={4}>文档摘要</Title>
                    <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                      {document.summary || '暂无摘要信息'}
                    </Paragraph>
                  </div>
                </TabPane>
                
                <TabPane 
                  tab={<span><NodeIndexOutlined />知识图谱</span>} 
                  key="knowledge-graph"
                >
                  <div style={{ padding: '16px 0' }}>
                    <Title level={4}>知识图谱</Title>
                    <div style={{ height: '400px', background: '#f9f9f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Empty description="知识图谱展示区" />
                    </div>
                  </div>
                </TabPane>
                
                <TabPane 
                  tab={<span><TagOutlined />关键词</span>} 
                  key="keywords"
                >
                  <div style={{ padding: '16px 0' }}>
                    <Title level={4}>关键词</Title>
                    {document.keywords && document.keywords.length > 0 ? (
                      <Space size={[8, 16]} wrap>
                        {document.keywords.map((keyword, index) => (
                          <Tag key={index} color="blue">{keyword}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <Empty description="暂无关键词" />
                    )}
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </>
        )}
      </Content>
    </Layout>
  );
};

export default DocumentDetail;