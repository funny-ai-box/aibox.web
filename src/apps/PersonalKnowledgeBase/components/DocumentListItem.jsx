import React from 'react';
import { Card, Space, Button, Typography, Tag, Tooltip, Avatar } from 'antd';
import { 
  FileTextOutlined, 
  LoadingOutlined, 
  CloseCircleOutlined, 
  MessageOutlined, 
  DeleteOutlined,
  EyeOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// 文档列表项组件
const DocumentListItem = ({ document, onView, onDelete, onCreateChat }) => {
  // 根据状态获取图标和状态标签
  const getStatusDisplay = (status) => {
    switch (status) {
      case 0:
        return {
          icon: <FileTextOutlined style={{ color: '#bfbfbf' }} />,
          tag: <Tag color="default">待处理</Tag>
        };
      case 1:
        return {
          icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
          tag: <Tag color="processing">处理中</Tag>
        };
      case 2:
        return {
          icon: <FileTextOutlined style={{ color: '#52c41a' }} />,
          tag: <Tag color="success">已完成</Tag>
        };
      case 3:
        return {
          icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
          tag: <Tag color="error">处理失败</Tag>
        };
      default:
        return {
          icon: <FileTextOutlined style={{ color: '#bfbfbf' }} />,
          tag: <Tag color="default">未知状态</Tag>
        };
    }
  };

  // 获取文件类型图标
  const getFileTypeIcon = (fileName) => {
    if (!fileName) return <FileOutlined />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ color: '#1890ff' }} />;
      case 'txt':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      default:
        return <FileUnknownOutlined />;
    }
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

  const { icon, tag } = getStatusDisplay(document.status);
  
  // 处理卡片点击
  const handleCardClick = () => {
    onView(document.id);
  };

  return (
    <Card 
      hoverable
      bodyStyle={{ padding: '16px' }}
      onClick={handleCardClick}
      style={{ cursor: 'pointer', marginBottom: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Avatar 
            size={40} 
            icon={getFileTypeIcon(document.title)} 
            style={{ 
              backgroundColor: '#f5f5f5', 
              marginRight: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }} 
          />
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Text strong style={{ marginRight: '8px', fontSize: '16px' }}>{document.title}</Text>
              {tag}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px', marginRight: '16px' }}>
                上传于: {formatDate(document.createDate)}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                大小: {formatFileSize(document.fileSize)}
              </Text>
            </div>
          </div>
        </div>
        
        <Space>
          <Tooltip title={document.status !== 2 ? "文档处理完成后才能开始对话" : "开始对话"}>
            <Button 
              type="text" 
              icon={<MessageOutlined />} 
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                if (document.status === 2) {
                  onCreateChat(document.id, document.title);
                }
              }}
              disabled={document.status !== 2}
              style={{ color: document.status === 2 ? '#1890ff' : undefined }}
            />
          </Tooltip>
          
          <Tooltip title="查看文档详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                onView(document.id);
              }}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          
          <Tooltip title="删除文档">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />} 
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                onDelete(document.id);
              }}
            />
          </Tooltip>
        </Space>
      </div>
    </Card>
  );
};

export default DocumentListItem;