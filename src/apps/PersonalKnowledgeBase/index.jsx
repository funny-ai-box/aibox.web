import React, { useState } from 'react';
import { 
  Layout, 
  Button, 
  Input, 
  Card, 
  Tabs, 
  Typography, 
  Space, 
  Tag, 
  Alert,
  Divider,
  List,
  Flex
} from 'antd';
import { 
  FolderOutlined, 
  UploadOutlined, 
  LinkOutlined, 
  SearchOutlined, 
  FileTextOutlined, 
  MessageOutlined, 
  NodeIndexOutlined, 
  KeyOutlined, 
  PlusOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Bubble, Sender, useXAgent, useXChat } from '@ant-design/x';

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Search } = Input;

const KnowledgeBase = () => {
  const [selectedFolder, setSelectedFolder] = useState('all');
  
  const folders = [
    { id: 'all', name: '全部文档', count: 24 },
    { id: 'work', name: '工作文档', count: 12 },
    { id: 'tech', name: '技术资料', count: 8 },
    { id: 'article', name: '收藏文章', count: 4 }
  ];

  const documents = [
    { 
      id: 1, 
      title: 'React 开发最佳实践.pdf',
      type: 'pdf',
      folder: 'tech',
      keywords: ['React', '前端', '开发规范'],
      processStatus: 'done',
      date: '2024-02-23'
    },
    { 
      id: 2, 
      title: '产品需求分析报告.docx',
      type: 'word',
      folder: 'work',
      keywords: ['需求分析', '产品设计'],
      processStatus: 'processing',
      date: '2024-02-22'
    }
  ];

  // Agent for handling chat requests
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onUpdate }) => {
      // Simulate AI response with streaming
      const responses = {
        default: "我可以帮您解答关于知识库中文档的问题，请告诉我您需要了解什么？",
        "你好": "您好！我是您的知识库助手，可以帮您：\n• 解答文档相关问题\n• 提取文档核心观点\n• 生成知识连接\n• 相关内容推荐",
        "React": "您的知识库中有'React 开发最佳实践.pdf'文档，需要我为您总结其中的重点内容吗？"
      };
      
      let fullContent = responses[message] || `您询问的是关于"${message}"的问题。我正在检索相关文档...`;
      if (message.includes("最佳实践")) {
        fullContent = "React开发最佳实践包括：组件化设计、状态管理最小化、使用函数式组件和Hooks等。需要我深入解释某个具体方面吗？";
      }
      
      let currentContent = '';
      
      const id = setInterval(() => {
        currentContent = fullContent.slice(0, currentContent.length + 2);
        onUpdate(currentContent);
        
        if (currentContent === fullContent) {
          clearInterval(id);
          onSuccess(fullContent);
        }
      }, 50);
    },
  });

  // Default welcome message
  const defaultMessages = [
    {
      id: 'welcome',
      status: 'success',
      message: '欢迎使用知识库助手！我可以帮您解答文档相关问题，提取核心观点，生成知识连接，以及推荐相关内容。'
    }
  ];

  // Chat messages management using useXChat
  const { onRequest, messages } = useXChat({
    agent,
    defaultMessages
  });

  // Define chat bubble roles
  const roles = {
    ai: {
      placement: 'start',
      avatar: { icon: <MessageOutlined />, style: { background: '#1890ff', color: '#fff' } },
    },
    local: {
      placement: 'end',
      avatar: { icon: <UserOutlined />, style: { background: '#f0f0f0' } },
    },
  };

  // Chat input state
  const [chatInput, setChatInput] = useState('');

  return (
    <Layout style={{ height: 'calc(100vh - 30px)'  }}>
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>个人知识库</Title>
      </Header>
      <Layout>
        {/* 左侧导航 */}
        <Sider width={240} theme="light" style={{ padding: '16px' }}>
          {/* 导入按钮组 */}
          <Space direction="vertical" style={{ width: '100%', marginBottom: '24px' }}>
            <Button icon={<UploadOutlined />} type="primary" block>导入文档</Button>
            <Button icon={<LinkOutlined />} block>导入链接</Button>
          </Space>

          <Divider style={{ margin: '12px 0' }} />

          {/* 文件夹列表 */}
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>文件夹</Text>
            <Button type="text" icon={<PlusOutlined />} size="small" />
          </div>

          <List
            size="small"
            dataSource={folders}
            renderItem={folder => (
              <List.Item 
                style={{ 
                  padding: '8px 12px', 
                  cursor: 'pointer',
                  backgroundColor: selectedFolder === folder.id ? '#f0f0f0' : 'transparent',
                  borderRadius: '4px'
                }}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Space>
                    <FolderOutlined />
                    <Text>{folder.name}</Text>
                  </Space>
                  <Text type="secondary">{folder.count}</Text>
                </div>
              </List.Item>
            )}
          />
        </Sider>

   

        {/* 主内容区 */}
        <Content style={{ padding: '20px', borderRadius: '8px' }}>
          {/* 搜索栏 */}
          <Search
            placeholder="输入关键词进行语义搜索..."
            style={{ marginBottom: '20px' }}
            prefix={<SearchOutlined />}
          />

          {/* 功能标签页 */}
          <Tabs defaultActiveKey="documents">
            <TabPane tab="文档库" key="documents">
              <Space direction="vertical" style={{ width: '100%' }}>
                {documents.map(doc => (
                  <Card 
                    key={doc.id} 
                    hoverable
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <Space>
                          <FileTextOutlined style={{ color: '#1890ff' }} />
                          <Text strong>{doc.title}</Text>
                        </Space>
                        <div style={{ marginTop: '8px' }}>
                          <Space>
                            <Text type="secondary">更新于 {doc.date}</Text>
                            <Space>
                              {doc.keywords.map(keyword => (
                                <Tag color="blue" key={keyword}>{keyword}</Tag>
                              ))}
                            </Space>
                          </Space>
                        </div>
                      </div>
                      <Space>
                        <Button type="text" icon={<MessageOutlined />} />
                        <Button type="text" icon={<NodeIndexOutlined />} />
                        <Button type="text" icon={<KeyOutlined />} />
                      </Space>
                    </div>
                  </Card>
                ))}
              </Space>
            </TabPane>
            <TabPane tab="知识图谱" key="knowledge-graph">
              <Card style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#888' }}>
                  知识图谱可视化区域
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </Content>

        {/* 垂直分割线 - 中间与右侧对话区之间 */}
        <Divider type="vertical" style={{ height: '100%', margin: '0' }} />

        {/* 右侧对话区 - 使用 useXChat */}
        <Sider width={400} theme="light" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>
            <Space>
              <MessageOutlined />
              智能对话
            </Space>
          </Title>

          <Flex vertical gap="middle" style={{ height: 'calc(100% - 120px)', display: 'flex', flexDirection: 'column' }}>
            {/* Chat messages area */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px' }}>
              <Bubble.List
                roles={roles}
                items={messages.map(({ id, message, status }) => ({
                  key: id,
                  role: status === 'local' ? 'local' : 'ai',
                  content: message,
                }))}
              />
            </div>
            
            {/* Chat input area */}
            <div style={{ marginTop: 'auto' }}>
              <Sender
                loading={agent.isRequesting()}
                value={chatInput}
                onChange={setChatInput}
                onSubmit={(message) => {
                  if (message.trim()) {
                    onRequest(message);
                    setChatInput('');
                  }
                }}
                placeholder="输入问题，按回车发送..."
              />
            </div>
          </Flex>
        </Sider>
      </Layout>
    </Layout>
  );
};

export default KnowledgeBase;