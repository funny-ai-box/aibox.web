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
  const [mindMapData, setMindMapData] = useState(null);

  useEffect(() => {
    fetchDocumentDetail();
  }, [documentId]);

  const fetchDocumentDetail = async () => {
    try {
      setLoading(true);
      const response = await pkbAPI.getDocumentDetail(documentId);
      
      if (response.code === 200) {
        setDocument(response.data);
        
        // 解析知识图谱数据
        if (response.data.knowledgeGraph?.mindMap) {
          try {
            setMindMapData(JSON.parse(response.data.knowledgeGraph.mindMap));
          } catch (e) {
            console.error('解析知识图谱数据失败:', e);
          }
        }
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

  // 提取关键词
  const renderKeywords = () => {
    if (!document?.knowledgeGraph?.keywords) {
      return null;
    }

    try {
      // 尝试解析关键词数据
      const keywords = JSON.parse(document.knowledgeGraph.keywords);
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return null;
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
      return null;
    }
  };

  // 渲染知识图谱为脑图 - 使用G6渲染
  const renderMindMap = () => {
    if (!mindMapData) {
      return <Empty description="暂无知识图谱数据" />;
    }

    // 使用JS原生实现一个简单但有效的脑图
    return (
      <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px', marginTop: '16px' }}>
        {/* 设置一个固定高度的容器，内部使用iframe嵌入HTML脑图 */}
        <div style={{ width: '100%', height: '500px', overflow: 'hidden', borderRadius: '8px' }}>
          <iframe 
            srcDoc={`
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <link
            type="text/css"
            rel="stylesheet"
            href="//cdn.jsdelivr.net/npm/jsmind@0.8.7/style/jsmind.css"
        />
        <script
            type="text/javascript"
            src="//cdn.jsdelivr.net/npm/jsmind@0.8.7/es6/jsmind.js"
        ></script>
                <style>
                  body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                  #jsmind_container { width: 100%; height: 100%; }
                  .jsmind-inner { overflow: hidden; }
                  
                  /* 增加提示文字 */
                  .drag-tip {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    background-color: rgba(0,0,0,0.5);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 3px;
                    font-size: 12px;
                    opacity: 0.8;
                    z-index: 1000;
                  }
                </style>
              </head>
              <body>
                <div id="jsmind_container"></div>
                <div class="drag-tip">可通过拖拽移动脑图，鼠标滚轮缩放</div>
                <script>
                  // 解析传入的知识图谱数据
                  const mindMapData = ${JSON.stringify(mindMapData)};
                  
                  // 将数据转换为jsMind格式
                  function convertToJsMindFormat(data) {
                    const rootNode = data.root || data;
                    
                    // 构建jsMind数据结构
                    const jsMindData = {
                      meta: {
                        name: "知识图谱",
                        author: "系统生成",
                        version: "1.0"
                      },
                      format: "node_tree",
                      data: {
                        id: "root",
                        topic: rootNode.name || "根节点",
                        children: []
                      }
                    };
                    
                    // 递归处理子节点
                    function processChildren(sourceNode, targetParent) {
                      const children = [...(sourceNode.children || []), ...(sourceNode.topics || [])];
                      
                      if (children.length > 0) {
                        targetParent.children = [];
                        
                        children.forEach((child, index) => {
                          const childNode = {
                            id: 'node_' + Math.random().toString(36).substr(2, 9),
                            topic: child.name || child.text || child.title || child.content || '节点'
                          };
                          
                          targetParent.children.push(childNode);
                          
                          // 递归处理下一层
                          processChildren(child, childNode);
                        });
                      }
                    }
                    
                    // 开始递归处理
                    processChildren(rootNode, jsMindData.data);
                    
                    return jsMindData;
                  }
                  
                  // 转换数据格式
                  const jsMindData = convertToJsMindFormat(mindMapData);
                  
                  // 初始化jsMind，确保启用拖拽功能
                  const options = {
                    container: 'jsmind_container',
                    theme: 'primary',
                    editable: false,
                    mode: 'full',  // 使用full模式支持拖拽
                    view: {
                      line_width: 2,
                      line_color: '#555',
                      draggable: true  // 明确启用拖拽
                    }
                  };
                  
                  // 创建并渲染脑图
                  const jm = new jsMind(options);
                  jm.show(jsMindData);
                  
                  // 自动调整到合适大小
                  setTimeout(() => {
                    jm.resize();
                    jm.expand_all();
                    
                    // 稍微缩小以显示更多内容
                    jm.set_zoom(jm.view.zoomOut());
                    
                    // 确认拖拽功能已启用
                    if (jm.view.draggable) {
                      console.log('拖拽功能已启用');
                    }
                  }, 300);
                  
                  // 添加提示文字淡出效果
                  setTimeout(() => {
                    const tip = document.querySelector('.drag-tip');
                    if (tip) {
                      tip.style.transition = 'opacity 1s ease-in-out';
                      tip.style.opacity = '0';
                      
                      // 5秒后移除提示
                      setTimeout(() => {
                        tip.style.display = 'none';
                      }, 5000);
                    }
                  }, 3000);
                </script>
              </body>
              </html>
            `}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="知识图谱"
          />
        </div>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '20px', background: '#f0f2f5' }}>
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Breadcrumb items={[
              { title: <Link to="/"><HomeOutlined /></Link> },
              { title: <Link to="/knowledge-base">个人知识库</Link> },
              { title: '文档详情' }
            ]} />
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={goBack}
            >
              返回列表
            </Button>
          </div>
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
                  {/* 显示关键词在状态行下方 */}
                  {document.status === 2 && (
                    <div style={{ marginTop: '8px' }}>
                      {renderKeywords() || <Text type="secondary">暂无关键词</Text>}
                    </div>
                  )}
                </div>
                <Button 
                  type="primary" 
                  icon={<MessageOutlined />}
                  onClick={createChat}
                  disabled={document.status !== 2}
                >
                  开始对话
                </Button>
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
                    {document.status === 2 ? renderMindMap() : (
                      <Empty description={
                        document.status === 0 ? "文档待处理，暂无知识图谱" :
                        document.status === 1 ? "文档处理中，请稍后查看" :
                        "文档处理失败，无法获取知识图谱"
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